const { describe, it } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { equal: eq, deepEqual: deq, ok, throws } = require('node:assert');
const { parsers } = require('../lib/index');
const { MarkdownFeatureParser, FeatureParser } = parsers;

describe('MarkdownFeatureParser', () => {
  describe('(Equivalence with FeatureParser)', () => {
    it('should produce identical output to the equivalent .feature', () => {
      const from_markdown = parse_markdown('equivalence');
      const from_feature = new FeatureParser().parse(load('equivalence', 'feature'));
      deq(from_markdown, from_feature);
    });
  });

  describe('(Headings)', () => {
    it('should parse a feature title from a heading regardless of level', () => {
      eq(new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n- Given A\n').title, 'A');
      eq(new MarkdownFeatureParser().parse('### Feature: A\n\n# Scenario: S\n\n- Given A\n').title, 'A');
    });

    it('should treat a non-keyword heading as description text', () => {
      const feature = new MarkdownFeatureParser().parse('# Feature: A\n\n## Notes\n\n## Scenario: S\n\n- Given A\n');
      deq(feature.description, ['Notes']);
    });
  });

  describe('(Steps)', () => {
    it('should capture list items as steps', () => {
      const scenario = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n- Given A\n- When B\n- Then C\n').scenarios[0];
      deq(scenario.steps, ['Given A', 'When B', 'Then C']);
    });

    it('should treat feature-level paragraphs as description, not steps', () => {
      const feature = new MarkdownFeatureParser().parse('# Feature: A\n\ndescription line\n\n## Scenario: S\n\n- Given A\n');
      deq(feature.description, ['description line']);
      deq(feature.scenarios[0].steps, ['Given A']);
    });

    it('should treat any scenario text as a step, list marker optional (Yadda has no scenario description)', () => {
      const scenario = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\nGiven A\n- When B\n').scenarios[0];
      deq(scenario.description, []);
      deq(scenario.steps, ['Given A', 'When B']);
    });
  });

  describe('(Doc strings)', () => {
    it('should capture a fenced code block into the preceding step verbatim', () => {
      const scenario = parse_markdown('docstring').scenarios[0];
      eq(scenario.steps.length, 2);
      eq(scenario.steps[0], 'Given the following product is imported:\n{\n  "sku": "WIDGET-1",\n  "price": 9.99\n}');
      eq(scenario.steps[1], 'Then the catalogue should contain "Widget"');
    });
  });

  describe('(Step tables)', () => {
    it('should capture a table into the preceding step', () => {
      const scenario = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n- Given the following users:\n\n  | name | age |\n  |------|-----|\n  | Bob  | 42  |\n\n- Then there is 1 user\n').scenarios[0];
      deq(scenario.steps, ['Given the following users:\nname | age\nBob  | 42', 'Then there is 1 user']);
    });

    it('should capture a table that follows its step without a blank line', () => {
      const scenario = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n- Given the following users:\n  | name | age |\n  |------|-----|\n  | Bob  | 42  |\n').scenarios[0];
      deq(scenario.steps, ['Given the following users:\nname | age\nBob  | 42']);
    });

    it('should capture a table into the preceding background step', () => {
      const feature = new MarkdownFeatureParser().parse('# Feature: A\n\n## Background: B\n\n- Given the following users:\n\n  | name |\n  |------|\n  | Bob  |\n\n## Scenario: S\n\n- Then there is 1 user\n');
      deq(feature.scenarios[0].steps, ['Given the following users:\nname\nBob', 'Then there is 1 user']);
    });

    it('should keep the table open across html comments', () => {
      const scenario = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n- Given the following users:\n\n  | name |\n  |------|\n  | Bob  |\n  <!-- hidden note -->\n  | Ann  |\n').scenarios[0];
      deq(scenario.steps, ['Given the following users:\nname\nBob\nAnn']);
    });

    it('should decode entities in table cells', () => {
      const scenario = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n- Given the following comparisons:\n\n  | expression |\n  |------------|\n  | a &lt; b   |\n').scenarios[0];
      deq(scenario.steps, ['Given the following comparisons:\nexpression\na < b']);
    });

    it('should reject a table in a feature description', () => {
      throws(() => new MarkdownFeatureParser().parse('# Feature: A\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n## Scenario: S\n\n- Given A\n'), /Dash is unexpected at this time/);
    });

    it('should reject a table without a preceding step', () => {
      throws(() => new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n| a | b |\n|---|---|\n| 1 | 2 |\n'), /Dash is unexpected at this time/);
    });
  });

  describe('(Comments)', () => {
    it('should ignore html comments', () => {
      const feature = new MarkdownFeatureParser().parse('<!-- hidden -->\n# Feature: A\n\n<!--\nmulti\nline\n-->\n\n## Scenario: S\n\n- Given A\n');
      eq(feature.title, 'A');
      deq(feature.description, []);
    });

    it('should ignore blockquotes without treating them as steps or description', () => {
      const feature = new MarkdownFeatureParser().parse('# Feature: A\n\n> a visible note\n\n## Scenario: S\n\n> another note\n- Given A\n');
      deq(feature.description, []);
      deq(feature.scenarios[0].steps, ['Given A']);
    });

    it('should keep a blockquote verbatim inside a doc-string', () => {
      const scenario = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n- Given text:\n\n  ```\n  > quoted\n  ```\n').scenarios[0];
      eq(scenario.steps[0], 'Given text:\n> quoted');
    });
  });

  describe('(Annotations)', () => {
    it('should attach annotations to the following construct', () => {
      const feature = new MarkdownFeatureParser().parse('@wip\n@issue=7\n# Feature: A\n\n## Scenario: S\n\n- Given A\n');
      eq(feature.annotations.wip, true);
      eq(feature.annotations.issue, '7');
    });
  });

  describe('(Example tables)', () => {
    it('should swallow the separator row and expand rows', () => {
      const scenarios = parse_markdown('equivalence').rules[0].scenarios;
      const outlines = scenarios.filter((s) => s.title === 'applying discount codes');
      eq(outlines.length, 3);
      ok(outlines[0].steps.includes('When I apply the discount code "HALFOFF"'));
    });

    it('should attach annotations between rows to the following row', () => {
      const feature = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S [n]\n\n- Given [n] things\n\n### Examples:\n\n| n |\n|---|\n| 1 |\n@wip\n| 2 |\n');
      eq(feature.scenarios.length, 2);
      eq(feature.scenarios[0].annotations.wip, undefined);
      eq(feature.scenarios[1].annotations.wip, true);
    });
  });

  describe('(Entities)', () => {
    it('should decode entities in prose', () => {
      const feature = parse_markdown('entities');
      const scenario = feature.scenarios[0];
      deq(feature.description, ['Comparisons like a < b && b > c belong in the description.']);
      deq(scenario.steps, ['Given a value of 5 & a threshold of 10', 'Then 5 < 10 should be true', 'And the label should read "done"']);
    });

    it('should leave entities verbatim inside doc-strings', () => {
      const scenario = parse_markdown('entities').scenarios[1];
      eq(scenario.steps[0], 'Given the following markup:\n<p>a &lt; b</p>');
    });
  });

  describe('(Known limitations)', () => {
    it('decodes entities inside inline code spans (v1 limitation)', () => {
      const scenario = new MarkdownFeatureParser().parse('# Feature: A\n\n## Scenario: S\n\n- Then it prints `a &lt; b`\n').scenarios[0];
      eq(scenario.steps[0], 'Then it prints `a < b`');
    });
  });

  function parse_markdown(filename) {
    return new MarkdownFeatureParser().parse(load(filename, 'feature.md'));
  }

  function load(filename, extension) {
    return fs.readFileSync(path.join(__dirname, 'features', 'markdown', `${filename}.${extension}`), 'utf8');
  }
});

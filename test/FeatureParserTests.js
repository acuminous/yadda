const { describe, it, afterEach } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { equal: eq, deepEqual: deq, ok, throws } = require('node:assert');
const { parsers, localisation: Localisation } = require('../lib/index');
const { FeatureParser } = parsers;
const { Language, Pirate, English } = Localisation;

describe('FeatureParser', () => {
  afterEach(() => {
    Localisation.default = English;
  });

  describe('(Features)', () => {
    it('should parse feature title', () => {
      const feature = parse_file('feature/simple_feature');
      eq(feature.title, 'Simple Feature');
    });

    it('should parse feature descriptions', () => {
      const feature = parse_file('feature/feature_description');
      eq(feature.title, 'Feature Description');
      eq(feature.description.join(' - '), 'As a wood chopper - I want to maintain a sharp axe - So that I can chop wood');
    });

    it('should only allow a single feature', () => {
      throws(() => {
        parse_file('feature/multiple_features');
      }, /Feature is unexpected/);
    });

    it('should report incomplete features', () => {
      throws(() => {
        parse_file('feature/incomplete_feature');
      }, /Feature requires one or more scenarios/);
    });
  });

  describe('(Scenarios)', () => {
    it('should parse a simple scenario', () => {
      const scenarios = parse_file('scenario/simple_scenario').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Simple Scenario');
      deq(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse a complex scenario', () => {
      const scenarios = parse_file('scenario/complex_scenario').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Complex Scenario');
      deq(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse multiple scenarios', () => {
      const scenarios = parse_file('scenario/multiple_scenarios').scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[1].title, 'Second Scenario');
    });

    it('should reset scenarios between parses', () => {
      eq(parse_file('scenario/simple_scenario').scenarios.length, 1);
      eq(parse_file('scenario/simple_scenario').scenarios.length, 1);
    });

    it('should report incomplete scenarios', () => {
      throws(() => {
        parse_file('scenario/incomplete_scenario_1');
      }, /Scenario requires one or more steps/);

      throws(() => {
        parse_file('scenario/incomplete_scenario_2');
      }, /Scenario requires one or more steps/);

      throws(() => {
        parse_file('scenario/incomplete_scenario_3');
      }, /Scenario requires one or more steps/);

      throws(() => {
        parse_file('scenario/incomplete_scenario_4');
      }, /Scenario requires one or more steps/);
    });

    it('should report steps with no scenario', () => {
      throws(() => {
        parse_file('scenario/missing_scenario');
      }, /A feature must contain one or more scenarios/);
    });

    it('should parse multline steps with no ending dash', () => {
      const scenarios = parse_file('scenario/multiline_step_scenario').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Multiline Step');
      eq(scenarios[0].steps[0], poem);
    });

    it('should parse multiline steps', () => {
      const scenarios = parse_file('scenario/multiline_step_scenario_with_ending_dash').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Multiline Step With Ending Dash');
      eq(scenarios[0].steps[0], poem);
    });

    it('should parse multiline steps with followers', () => {
      const scenarios = parse_file('scenario/multiline_step_scenario_with_followers').scenarios;
      eq(scenarios.length, 5);
      eq(scenarios[0].title, 'Multiline Step Followed By Scenario');
      eq(scenarios[0].steps[0], poem);

      eq(scenarios[1].title, 'Another scenario');

      eq(scenarios[2].title, 'Multiline Step Followed By Annotation');
      eq(scenarios[2].steps[0], poem);

      eq(scenarios[3].title, 'Another scenario');

      eq(scenarios[4].title, 'Multiline Step Followed By Example Table');
      eq(JSON.stringify(scenarios[4].steps[0]), JSON.stringify(poem));
    });

    it('should parse multiple multiline steps in the same scenario', () => {
      const scenarios = parse_file('scenario/multiline_step_scenario_with_multiple_blocks').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Multiline Step With Multiple Blocks');
      eq(scenarios[0].steps[0], ['Verse 1'].concat(poem.split('\n').splice(1, 4)).join('\n'));
      eq(scenarios[0].steps[1], ['Verse 2'].concat(poem.split('\n').splice(6, 9)).join('\n'));
    });

    it('should append the final blank line in a multiple step', () => {
      const scenarios = parse_file('scenario/multiline_step_scenario_with_multiple_blocks_and_blank').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Multiline Step With Multiple Blocks And Blank');
      eq(scenarios[0].steps[0], ['Verse 1'].concat(poem.split('\n').splice(1, 4)).concat('').join('\n'));
      eq(scenarios[0].steps[1], ['Verse 2'].concat(poem.split('\n').splice(6, 9)).concat('').join('\n'));
    });

    it('should maintain indentation while parsing multiline steps', () => {
      const scenarios = parse_file('scenario/multiline_step_scenario_with_indentation').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Multiline Step With Indentation');
      eq(scenarios[0].steps[0], ['LOLCODE', 'HAI', 'CAN HAS STDIO?', 'PLZ OPEN FILE "LOLCATS.TXT"?', '    AWSUM THX', '        VISIBLE FILE', '    O NOES', '        INVISIBLE "ERROR!"', 'KTHXBYE'].join('\n'));
    });

    it('should report malformed multiline steps', () => {
      throws(() => {
        parse_file('scenario/malformed_multiline_scenario_1');
      }, /Dash is unexpected at this time/);

      throws(() => {
        parse_file('scenario/malformed_multiline_scenario_2');
      }, /Indentation error/);

      throws(() => {
        parse_file('scenario/malformed_multiline_scenario_3');
      }, /Dash is unexpected at this time/);

      throws(() => {
        parse_file('scenario/malformed_multiline_scenario_4');
      }, /Examples is unexpected at this time/);

      throws(() => {
        parse_file('scenario/malformed_multiline_scenario_5');
      }, /Annotation is unexpected at this time/);
    });
  });

  describe('(Annotations)', () => {
    it('should parse feature annotations', () => {
      const feature = parse_file('annotated/annotated_feature');
      eq(feature.annotations.keyword1, 'value1');
      eq(feature.annotations.keyword2, 'value2');
      ok(feature.annotations.keyword3);
      eq(Object.keys(feature.scenarios[0].annotations).length, 0);
    });

    it('should trim feature annotations', () => {
      const feature = parse_file('annotated/untrimmed_annotated_feature');
      eq(feature.annotations.keyword1, 'value1');
      eq(feature.annotations.keyword2, 'value2');
      ok(feature.annotations.keyword3);
      eq(Object.keys(feature.scenarios[0].annotations).length, 0);
    });

    it('should parse scenario annotations', () => {
      const feature = parse_file('annotated/annotated_scenario');
      eq(Object.keys(feature.annotations).length, 0);
      eq(feature.scenarios[0].annotations.keyword1, 'value1');
      eq(feature.scenarios[0].annotations.keyword2, 'value2');
      ok(feature.scenarios[0].annotations.keyword3);
    });

    it('should trim scenario annotations', () => {
      const feature = parse_file('annotated/untrimmed_annotated_scenario');
      eq(Object.keys(feature.annotations).length, 0);
      eq(feature.scenarios[0].annotations.keyword1, 'value1');
      eq(feature.scenarios[0].annotations.keyword2, 'value2');
      ok(feature.scenarios[0].annotations.keyword3);
    });

    it('should support annotations with non alphanumerics', () => {
      const feature = parse_file('annotated/annotated_feature_non_alphanumeric');
      eq(feature.annotations['keyword+1'], 'value1');
      eq(feature.scenarios[0].annotations['keyword-1'], 'value1');
    });

    it('should expand scenarios from annotated singleline example table', () => {
      const scenarios = parse_file('annotated/annotated_example_table').scenarios;
      eq(scenarios.length, 4);
      eq(scenarios[0].annotations.pending, true);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[0].steps[0], 'Step A11');
      eq(scenarios[0].steps[1], 'Step 1AA');
      eq(scenarios[1].annotations.pending, undefined);
      eq(scenarios[1].title, 'Second Scenario');
      eq(scenarios[1].steps[0], 'Step B22');
      eq(scenarios[1].steps[1], 'Step 2BB');
      eq(scenarios[2].annotations.pending, true);
      eq(scenarios[2].title, 'Third Scenario');
      eq(scenarios[2].steps[0], 'Step C33');
      eq(scenarios[2].steps[1], 'Step 3CC');
    });

    it('should expand scenarios from annotated multiline example table', () => {
      const scenarios = parse_file('annotated/annotated_multiline_example_table').scenarios;
      eq(scenarios.length, 4);
      eq(scenarios[0].annotations.pending, true);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[0].steps[0], 'Step A11');
      eq(scenarios[0].steps[1], 'Step 1AA');
      eq(scenarios[1].annotations.pending, undefined);
      eq(scenarios[1].title, 'Second Scenario');
      eq(scenarios[1].steps[0], 'Step B22');
      eq(scenarios[1].steps[1], 'Step 2BB');
      eq(scenarios[2].annotations.pending, true);
      eq(scenarios[2].title, 'Third Scenario');
      eq(scenarios[2].steps[0], 'Step C33');
      eq(scenarios[2].steps[1], 'Step 3CC');
    });

    it('should merge scenario annotations with example table annotations', () => {
      const scenarios = parse_file('annotated/annotated_example_table').scenarios;
      eq(scenarios.length, 4);
      eq(scenarios[0].annotations.pending, true);
      eq(scenarios[0].annotations.only, true);
      eq(scenarios[1].annotations.pending, undefined);
      eq(scenarios[1].annotations.only, true);
      eq(scenarios[2].annotations.pending, true);
      eq(scenarios[2].annotations.only, true);

      delete scenarios[0].annotations.pending;
      eq(scenarios[2].annotations.pending, true);
    });

    it('should not confuse example table annotations and scenario annotations', () => {
      const scenarios = parse_file('annotated/annotated_example_table').scenarios;
      eq(scenarios.length, 4);
      eq(scenarios[3].annotations.crystal, true);
    });

    it('should parse scenario annotations after background', () => {
      const feature = parse_file('annotated/annotated_scenario_after_background');
      eq(feature.scenarios[0].steps[0], 'Given A');
    });
  });

  describe('(Single line Example Tables)', () => {
    it('should expand scenarios from example table', () => {
      const scenarios = parse_file('example_table/example_table').scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[0].steps[0], 'Step A11');
      eq(scenarios[0].steps[1], 'Step 1AA');
      eq(scenarios[1].title, 'Second Scenario');
      eq(scenarios[1].steps[0], 'Step B22');
      eq(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should expand scenarios from example table with chevrons', () => {
      const scenarios = parse_file('example_table/example_table_with_chevrons', {
        leftPlaceholderChar: '<',
        rightPlaceholderChar: '>',
      }).scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[0].steps[0], 'Step A11');
      eq(scenarios[0].steps[1], 'Step 1AA');
      eq(scenarios[1].title, 'Second Scenario');
      eq(scenarios[1].steps[0], 'Step B22');
      eq(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should expand scenarios from example table using \\u2506 separator', () => {
      const scenarios = parse_file('example_table/example_table_2506').scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[0].steps[0], 'Step A11');
      eq(scenarios[0].steps[1], 'Step 1AA');
      eq(scenarios[1].title, 'Second Scenario');
      eq(scenarios[1].steps[0], 'Step B22');
      eq(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should expand scenarios from example table with outer borders', () => {
      const scenarios = parse_file('example_table/example_table_with_outer_borders').scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[0].steps[0], 'Step A11');
      eq(scenarios[0].steps[1], 'Step 1AA');
      eq(scenarios[1].title, 'Second Scenario');
      eq(scenarios[1].steps[0], 'Step B22');
      eq(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should stash annotations for following scenarios', () => {
      const scenarios = parse_file('example_table/example_table_followed_by_annotated_scenario').scenarios;
      eq(scenarios.length, 3);
      eq(scenarios[2].title, 'Annotated Scenario');
      ok(scenarios[2].annotations.pending);
    });

    it('should report malformed singleline example tables', () => {
      throws(() => {
        parse_file('example_table/malformed_example_table_1').scenarios;
      }, /Incorrect number of fields in example table/);

      throws(() => {
        parse_file('example_table/malformed_example_table_2').scenarios;
      }, /Blank is unexpected at this time/);

      throws(() => {
        parse_file('example_table/malformed_example_table_3').scenarios;
      }, /Text is unexpected at this time/);
    });

    it('should report incomplete example table', () => {
      throws(() => {
        parse_file('example_table/incomplete_example_table_1');
      }, /Examples table requires one or more headings/);

      throws(() => {
        parse_file('example_table/incomplete_example_table_2');
      }, /Examples table requires one or more rows/);

      throws(() => {
        parse_file('example_table/incomplete_example_table_3');
      }, /Scenario is unexpected at this time/);

      throws(() => {
        parse_file('example_table/incomplete_example_table_4');
      }, /Scenario is unexpected at this time/);
    });

    it('should expand feature background from example table', () => {
      const feature = parse_file('example_table/feature_with_background_and_example_table');
      eq(feature.scenarios.length, 4);
      eq(feature.scenarios[0].steps[0], 'BG A1');
      eq(feature.scenarios[1].steps[0], 'BG B2');
      eq(feature.scenarios[2].steps[0], 'BG X3');
      eq(feature.scenarios[3].steps[0], 'BG Y4');
    });

    it('should add meta fields to example table', () => {
      const scenarios = parse_file('example_table/meta_fields').scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[0].steps[0], '1 First 9:5');
      eq(scenarios[0].steps[1], '1 A 9:14');
      eq(scenarios[0].steps[2], '1 1 9:23');
      eq(scenarios[1].title, 'Second Scenario');
      eq(scenarios[1].steps[0], '2 Second 10:5');
      eq(scenarios[1].steps[1], '2 B 10:14');
      eq(scenarios[1].steps[2], '2 2 10:23');
    });

    it('should expand multiline step scenarios from example table', () => {
      const scenarios = parse_file('example_table/multiline_step_example_table').scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'First Scenario');
      eq(scenarios[0].steps[0], 'Step\nA11\n1AA');
      eq(scenarios[1].title, 'Second Scenario');
      eq(scenarios[1].steps[0], 'Step\nB22\n2BB');
    });
  });

  describe('(Multiline Example Tables)', () => {
    it('should expand scenarios from simple multiline example table', () => {
      const scenarios = parse_file('example_table/simple_multiline_example_table').scenarios;
      eq(scenarios.length, 2);

      eq(scenarios[0].title, 'Simple Multiline Example Table');
      eq(scenarios[0].steps.length, 2);
      eq(scenarios[0].steps[0], 'Step left 1');
      eq(scenarios[0].steps[1], ['Step right 1', 'right 2'].join('\n'));

      eq(scenarios[1].title, 'Simple Multiline Example Table');
      eq(scenarios[1].steps.length, 2);
      eq(scenarios[1].steps[0], ['Step left 3', 'left 4'].join('\n'));
      eq(scenarios[1].steps[1], 'Step right 3');
    });

    it('should expand scenarios from complex multiline examples', () => {
      const scenarios = parse_file('example_table/complex_multiline_example_table').scenarios;
      eq(scenarios.length, 2);

      eq(scenarios[0].title, 'Complex Multiline Example Table');
      eq(scenarios[0].steps.length, 2);
      eq(scenarios[0].steps[0], 'Step x {\n  y\n }');
      eq(scenarios[0].steps[1], 'Step foo');

      eq(scenarios[1].title, 'Complex Multiline Example Table');
      eq(scenarios[0].steps.length, 2);
      eq(scenarios[1].steps[0], 'Step ');
      eq(scenarios[1].steps[1], 'Step x {\n  y\n }');
    });

    it('should expand scenarios from multiline example table with outer border', () => {
      const scenarios = parse_file('example_table/multiline_example_table_with_outer_border').scenarios;
      eq(scenarios.length, 2);

      eq(scenarios[0].title, 'Multiline Example Table With Outer Border');
      eq(scenarios[0].steps.length, 2);
      eq(scenarios[0].steps[0], 'Step left 1');
      eq(scenarios[0].steps[1], ['Step right 1', 'right 2'].join('\n'));

      eq(scenarios[1].title, 'Multiline Example Table With Outer Border');
      eq(scenarios[1].steps.length, 2);
      eq(scenarios[1].steps[0], ['Step left 3', 'left 4'].join('\n'));
      eq(scenarios[1].steps[1], 'Step right 3');
    });

    it('should report malformed multiline examples', () => {
      throws(() => {
        parse_file('example_table/malformed_multiline_example_table_1');
      }, /Dash is unexpected at this time/);

      throws(() => {
        parse_file('example_table/malformed_multiline_example_table_2');
      }, /Indentation error/);

      throws(() => {
        parse_file('example_table/malformed_multiline_example_table_3');
      }, /Text is unexpected at this time/);
    });

    it('should add meta fields to multiline example table', () => {
      const scenarios = parse_file('example_table/meta_fields_multiline_example_table').scenarios;
      eq(scenarios.length, 2);

      eq(scenarios[0].title, 'Meta Fields Multiline Example Table');
      eq(scenarios[0].steps.length, 2);
      eq(scenarios[0].steps[0], '1 left 1 9:5');
      eq(scenarios[0].steps[1], '1 right 1\nright 2 9:14');

      eq(scenarios[1].title, 'Meta Fields Multiline Example Table');
      eq(scenarios[1].steps.length, 2);
      eq(scenarios[1].steps[0], '2 left 3\nleft 4 12:5');
      eq(scenarios[1].steps[1], '2 right 3 12:14');
    });
  });

  describe('(Localisation)', () => {
    it('should support multiple languages', () => {
      const feature = parse_file('localisation/pirate_feature', Pirate);
      eq(feature.title, 'Treasure Island');

      const scenarios = feature.scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'The Black Spot');
      deq(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

      ok(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
    });

    it('should support multiple languages using the options object', () => {
      const feature = parse_file('localisation/pirate_feature', { language: Pirate });
      eq(feature.title, 'Treasure Island');

      const scenarios = feature.scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'The Black Spot');
      deq(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

      ok(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
    });

    it('should support changing the default language', () => {
      Localisation.default = Pirate;
      const feature = new FeatureParser().parse(load('localisation/pirate_feature'));

      eq(feature.title, 'Treasure Island');

      const scenarios = feature.scenarios;
      eq(scenarios.length, 2);
      eq(scenarios[0].title, 'The Black Spot');
      deq(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

      ok(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
    });

    it('should support localised rules', () => {
      const feature = parse_file('localisation/pirate_rule', Pirate);
      eq(feature.title, 'Treasure Island');
      eq(feature.rules.length, 1);
      eq(feature.rules[0].title, 'The Pirate Code');
      eq(feature.rules[0].scenarios[0].title, 'The Black Spot');
    });

    it('should report missing translations', () => {
      const language = new Language('Incomplete', {});
      throws(() => {
        parse_file('feature/multiple_features', language);
      }, /Keyword "feature" has not been translated into Incomplete/);
    });

    it('should report supported keywords without throwing', () => {
      const language = new Language('Partial', { feature: '[Ff]eature' });
      eq(language.supports('feature'), true);
      eq(language.supports('rule'), false);
    });
  });

  describe('(Feature Backgrounds)', () => {
    it('should parse feature background', () => {
      const feature = parse_file('background/feature_with_background');
      eq(feature.scenarios[0].steps[0], 'Given A');
    });

    it('shoud parse multiline step background', () => {
      const scenarios = parse_file('background/background_with_multiline_step').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Simple Scenario');
      eq(scenarios[0].steps[0], poem);
      eq(scenarios[0].steps[1], 'Given A');
    });

    it('should report background annotations', () => {
      throws(() => {
        parse_file('background/malformed_background_annotated');
      }, /Background is unexpected at this time/);
    });

    it('should parse a background without an enclosing feature', () => {
      const scenarios = parse_file('background/background_without_feature').scenarios;
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Simple Scenario');
      deq(scenarios[0].steps, ['Given A', 'Given B', 'When C', 'Then D']);
    });
  });

  describe('(Rules)', () => {
    it('should parse a rule with scenarios', () => {
      const feature = parse_file('rule/feature_with_rule');
      eq(feature.rules.length, 1);
      eq(feature.rules[0].title, 'First Rule');
      eq(feature.rules[0].scenarios.length, 2);
      eq(feature.rules[0].scenarios[0].title, 'First Scenario');
      deq(feature.rules[0].scenarios[0].steps, ['Given A', 'When B', 'Then C']);
      eq(feature.rules[0].scenarios[1].title, 'Second Scenario');
      deq(feature.rules[0].scenarios[1].steps, ['Given D', 'When E', 'Then F']);
    });

    it('should keep top level scenarios separate from rule scenarios', () => {
      const feature = parse_file('rule/feature_with_top_level_and_rule_scenarios');
      eq(feature.scenarios.length, 1);
      eq(feature.scenarios[0].title, 'Top Level Scenario');
      eq(feature.rules.length, 1);
      eq(feature.rules[0].title, 'A Rule');
      eq(feature.rules[0].scenarios.length, 1);
      eq(feature.rules[0].scenarios[0].title, 'Rule Scenario');
    });

    it('should parse multiple rules', () => {
      const feature = parse_file('rule/multiple_rules');
      eq(feature.rules.length, 2);
      eq(feature.rules[0].title, 'First Rule');
      eq(feature.rules[1].title, 'Second Rule');
      eq(feature.rules[0].scenarios[0].title, 'First Scenario');
      eq(feature.rules[1].scenarios[0].title, 'Second Scenario');
    });

    it('should parse a rule description', () => {
      const feature = parse_file('rule/rule_with_description');
      eq(feature.rules[0].description.join(' - '), 'This rule describes a business constraint - that spans multiple lines');
    });

    it('should report rule annotations', () => {
      const feature = parse_file('rule/annotated_rule');
      ok(feature.rules[0].annotations.only, 'Rule was not annotated');
    });

    it('should expose an empty rules array when there are no rules', () => {
      const feature = parse_file('scenario/simple_scenario');
      deq(feature.rules, []);
      eq(feature.scenarios.length, 1);
    });

    it('should parse a rule without an enclosing feature', () => {
      const feature = parse_file('rule/rule_without_feature');
      eq(feature.rules.length, 1);
      eq(feature.rules[0].title, 'First Rule');
      eq(feature.rules[0].scenarios.length, 1);
      eq(feature.rules[0].scenarios[0].title, 'First Scenario');
      deq(feature.rules[0].scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should not recognise rules in languages without a rule keyword', () => {
      const language = new Language('NoRule', {
        feature: '[Ff]eature',
        scenario: '[Ss]cenario',
        background: '[Bb]ackground',
        examples: '[Ee]xamples',
        pending: '[Pp]ending',
        only: '[Oo]nly',
        given: '[Gg]iven',
        when: '[Ww]hen',
        then: '[Tt]hen',
      });
      const feature = parse_file('scenario/simple_scenario', language);
      eq(feature.scenarios.length, 1);
      deq(feature.rules, []);
    });
  });

  describe('(Rule Backgrounds)', () => {
    it('should prepend feature and rule background steps to rule scenarios', () => {
      const feature = parse_file('rule/rule_with_background');
      const scenario = feature.rules[0].scenarios[0];
      deq(scenario.steps, ['Given feature background step', 'Given rule background step', 'Given A', 'When B', 'Then C']);
    });
  });

  describe('(Malformed Rules)', () => {
    it('should reject a rule without scenarios', () => {
      throws(() => {
        parse_file('rule/empty_rule');
      }, /Rule requires one or more scenarios/);
    });

    it('should reject a rule immediately following a scenario-less rule', () => {
      throws(() => {
        parse_file('rule/nested_rule');
      }, /Rule requires one or more scenarios/);
    });
  });

  describe('(Comments)', () => {
    it('should support single line comments', () => {
      const feature = parse_file('comment/singleline_comment');
      const scenarios = feature.scenarios;
      eq(feature.title, 'Single Line Comments Feature');
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Single Line Comments Scenario');
      deq(scenarios[0].steps, ['Given A', 'When # B', 'Then C #']);
    });

    it('should parse multiline comments', () => {
      const feature = parse_file('comment/multiline_comment');
      const scenarios = feature.scenarios;
      eq(feature.title, 'Simple Feature');
      eq(scenarios.length, 1);
      eq(scenarios[0].title, 'Simple Scenario');
      deq(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });
  });

  function parse_file(filename, options) {
    return new FeatureParser(options).parse(load(filename));
  }

  function load(filename) {
    return fs.readFileSync(path.join(__dirname, 'features', `${filename}.feature`), 'utf8');
  }

  const poem = [
    'Good Times',
    'May we go our separate ways,',
    'Finding fortune and new friends.',
    'But let us not forget these days,',
    'Or let the good times ever end.',
    '',
    'A poet with wiser words than mine,',
    'Wrote that nothing gold can stay.',
    "These are golden days we're in,",
    'And so are bound to fade away.',
  ].join('\n');
});

var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var afterEach = nodeTest.afterEach;
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var FeatureParser = require('../lib/index').parsers.FeatureParser;
var Localisation = require('../lib/index').localisation;
var Language = require('../lib/index').localisation.Language;
var Pirate = require('../lib/index').localisation.Pirate;
var English = require('../lib/index').localisation.English;

describe('FeatureParser', () => {
  afterEach(() => {
    Localisation.default = English;
  });

  describe('(Features)', () => {
    it('should parse feature title', () => {
      var feature = parse_file('feature/simple_feature');
      assert.equal(feature.title, 'Simple Feature');
    });

    it('should parse feature descriptions', () => {
      var feature = parse_file('feature/feature_description');
      assert.equal(feature.title, 'Feature Description');
      assert.equal(feature.description.join(' - '), 'As a wood chopper - I want to maintain a sharp axe - So that I can chop wood');
    });

    it('should only allow a single feature', () => {
      assert.throws(() => {
        parse_file('feature/multiple_features');
      }, /Feature is unexpected/);
    });

    it('should report incomplete features', () => {
      assert.throws(() => {
        parse_file('feature/incomplete_feature');
      }, /Feature requires one or more scenarios/);
    });
  });

  describe('(Scenarios)', () => {
    it('should parse a simple scenario', () => {
      var scenarios = parse_file('scenario/simple_scenario').scenarios;
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Simple Scenario');
      assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse a complex scenario', () => {
      var scenarios = parse_file('scenario/complex_scenario').scenarios;
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Complex Scenario');
      assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse multiple scenarios', () => {
      var scenarios = parse_file('scenario/multiple_scenarios').scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[1].title, 'Second Scenario');
    });

    it('should reset scenarios between parses', () => {
      assert.equal(parse_file('scenario/simple_scenario').scenarios.length, 1);
      assert.equal(parse_file('scenario/simple_scenario').scenarios.length, 1);
    });

    it('should report incomplete scenarios', () => {
      assert.throws(() => {
        parse_file('scenario/incomplete_scenario_1');
      }, /Scenario requires one or more steps/);

      assert.throws(() => {
        parse_file('scenario/incomplete_scenario_2');
      }, /Scenario requires one or more steps/);

      assert.throws(() => {
        parse_file('scenario/incomplete_scenario_3');
      }, /Scenario requires one or more steps/);

      assert.throws(() => {
        parse_file('scenario/incomplete_scenario_4');
      }, /Scenario requires one or more steps/);
    });

    it('should report steps with no scenario', () => {
      assert.throws(() => {
        parse_file('scenario/missing_scenario');
      }, /A feature must contain one or more scenarios/);
    });

    it('should parse multline steps with no ending dash', () => {
      var scenarios = parse_file('scenario/multiline_step_scenario').scenarios;
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Multiline Step');
      assert.equal(scenarios[0].steps[0], poem);
    });

    it('should parse multiline steps', () => {
      var scenarios = parse_file('scenario/multiline_step_scenario_with_ending_dash').scenarios;
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Multiline Step With Ending Dash');
      assert.equal(scenarios[0].steps[0], poem);
    });

    it('should parse multiline steps with followers', () => {
      var scenarios = parse_file('scenario/multiline_step_scenario_with_followers').scenarios;
      assert.equal(scenarios.length, 5);
      assert.equal(scenarios[0].title, 'Multiline Step Followed By Scenario');
      assert.equal(scenarios[0].steps[0], poem);

      assert.equal(scenarios[1].title, 'Another scenario');

      assert.equal(scenarios[2].title, 'Multiline Step Followed By Annotation');
      assert.equal(scenarios[2].steps[0], poem);

      assert.equal(scenarios[3].title, 'Another scenario');

      assert.equal(scenarios[4].title, 'Multiline Step Followed By Example Table');
      assert.equal(JSON.stringify(scenarios[4].steps[0]), JSON.stringify(poem));
    });

    it('should parse multiple multiline steps in the same scenario', () => {
      var scenarios = parse_file('scenario/multiline_step_scenario_with_multiple_blocks').scenarios;
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Multiline Step With Multiple Blocks');
      assert.equal(scenarios[0].steps[0], ['Verse 1'].concat(poem.split('\n').splice(1, 4)).join('\n'));
      assert.equal(scenarios[0].steps[1], ['Verse 2'].concat(poem.split('\n').splice(6, 9)).join('\n'));
    });

    it('should append the final blank line in a multiple step', () => {
      var scenarios = parse_file('scenario/multiline_step_scenario_with_multiple_blocks_and_blank').scenarios;
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Multiline Step With Multiple Blocks And Blank');
      assert.equal(scenarios[0].steps[0], ['Verse 1'].concat(poem.split('\n').splice(1, 4)).concat('').join('\n'));
      assert.equal(scenarios[0].steps[1], ['Verse 2'].concat(poem.split('\n').splice(6, 9)).concat('').join('\n'));
    });

    it('should maintain indentation while parsing multiline steps', () => {
      var scenarios = parse_file('scenario/multiline_step_scenario_with_indentation').scenarios;
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Multiline Step With Indentation');
      assert.equal(scenarios[0].steps[0], ['LOLCODE', 'HAI', 'CAN HAS STDIO?', 'PLZ OPEN FILE "LOLCATS.TXT"?', '    AWSUM THX', '        VISIBLE FILE', '    O NOES', '        INVISIBLE "ERROR!"', 'KTHXBYE'].join('\n'));
    });

    it('should report malformed multiline steps', () => {
      assert.throws(() => {
        parse_file('scenario/malformed_multiline_scenario_1');
      }, /Dash is unexpected at this time/);

      assert.throws(() => {
        parse_file('scenario/malformed_multiline_scenario_2');
      }, /Indentation error/);

      assert.throws(() => {
        parse_file('scenario/malformed_multiline_scenario_3');
      }, /Dash is unexpected at this time/);

      assert.throws(() => {
        parse_file('scenario/malformed_multiline_scenario_4');
      }, /Examples is unexpected at this time/);

      assert.throws(() => {
        parse_file('scenario/malformed_multiline_scenario_5');
      }, /Annotation is unexpected at this time/);
    });
  });

  describe('(Annotations)', () => {
    it('should parse feature annotations', () => {
      var feature = parse_file('annotated/annotated_feature');
      assert.equal(feature.annotations.keyword1, 'value1');
      assert.equal(feature.annotations.keyword2, 'value2');
      assert(feature.annotations.keyword3);
      assert.equal(Object.keys(feature.scenarios[0].annotations).length, 0);
    });

    it('should trim feature annotations', () => {
      var feature = parse_file('annotated/untrimmed_annotated_feature');
      assert.equal(feature.annotations.keyword1, 'value1');
      assert.equal(feature.annotations.keyword2, 'value2');
      assert(feature.annotations.keyword3);
      assert.equal(Object.keys(feature.scenarios[0].annotations).length, 0);
    });

    it('should parse scenario annotations', () => {
      var feature = parse_file('annotated/annotated_scenario');
      assert.equal(Object.keys(feature.annotations).length, 0);
      assert.equal(feature.scenarios[0].annotations.keyword1, 'value1');
      assert.equal(feature.scenarios[0].annotations.keyword2, 'value2');
      assert(feature.scenarios[0].annotations.keyword3);
    });

    it('should trim scenario annotations', () => {
      var feature = parse_file('annotated/untrimmed_annotated_scenario');
      assert.equal(Object.keys(feature.annotations).length, 0);
      assert.equal(feature.scenarios[0].annotations.keyword1, 'value1');
      assert.equal(feature.scenarios[0].annotations.keyword2, 'value2');
      assert(feature.scenarios[0].annotations.keyword3);
    });

    it('should support annotations with non alphanumerics', () => {
      var feature = parse_file('annotated/annotated_feature_non_alphanumeric');
      assert.equal(feature.annotations['keyword+1'], 'value1');
      assert.equal(feature.scenarios[0].annotations['keyword-1'], 'value1');
    });

    it('should expand scenarios from annotated singleline example table', () => {
      var scenarios = parse_file('annotated/annotated_example_table').scenarios;
      assert.equal(scenarios.length, 4);
      assert.equal(scenarios[0].annotations.pending, true);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[0].steps[0], 'Step A11');
      assert.equal(scenarios[0].steps[1], 'Step 1AA');
      assert.equal(scenarios[1].annotations.pending, undefined);
      assert.equal(scenarios[1].title, 'Second Scenario');
      assert.equal(scenarios[1].steps[0], 'Step B22');
      assert.equal(scenarios[1].steps[1], 'Step 2BB');
      assert.equal(scenarios[2].annotations.pending, true);
      assert.equal(scenarios[2].title, 'Third Scenario');
      assert.equal(scenarios[2].steps[0], 'Step C33');
      assert.equal(scenarios[2].steps[1], 'Step 3CC');
    });

    it('should expand scenarios from annotated multiline example table', () => {
      var scenarios = parse_file('annotated/annotated_multiline_example_table').scenarios;
      assert.equal(scenarios.length, 4);
      assert.equal(scenarios[0].annotations.pending, true);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[0].steps[0], 'Step A11');
      assert.equal(scenarios[0].steps[1], 'Step 1AA');
      assert.equal(scenarios[1].annotations.pending, undefined);
      assert.equal(scenarios[1].title, 'Second Scenario');
      assert.equal(scenarios[1].steps[0], 'Step B22');
      assert.equal(scenarios[1].steps[1], 'Step 2BB');
      assert.equal(scenarios[2].annotations.pending, true);
      assert.equal(scenarios[2].title, 'Third Scenario');
      assert.equal(scenarios[2].steps[0], 'Step C33');
      assert.equal(scenarios[2].steps[1], 'Step 3CC');
    });

    it('should merge scenario annotations with example table annotations', () => {
      var scenarios = parse_file('annotated/annotated_example_table').scenarios;
      assert.equal(scenarios.length, 4);
      assert.equal(scenarios[0].annotations.pending, true);
      assert.equal(scenarios[0].annotations.only, true);
      assert.equal(scenarios[1].annotations.pending, undefined);
      assert.equal(scenarios[1].annotations.only, true);
      assert.equal(scenarios[2].annotations.pending, true);
      assert.equal(scenarios[2].annotations.only, true);

      delete scenarios[0].annotations.pending;
      assert.equal(scenarios[2].annotations.pending, true);
    });

    it('should not confuse example table annotations and scenario annotations', () => {
      var scenarios = parse_file('annotated/annotated_example_table').scenarios;
      assert.equal(scenarios.length, 4);
      assert.equal(scenarios[3].annotations.crystal, true);
    });

    it('should parse scenario annotations after background', () => {
      var feature = parse_file('annotated/annotated_scenario_after_background');
      assert.equal(feature.scenarios[0].steps[0], 'Given A');
    });
  });

  describe('(Single line Example Tables)', () => {
    it('should expand scenarios from example table', () => {
      var scenarios = parse_file('example_table/example_table').scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[0].steps[0], 'Step A11');
      assert.equal(scenarios[0].steps[1], 'Step 1AA');
      assert.equal(scenarios[1].title, 'Second Scenario');
      assert.equal(scenarios[1].steps[0], 'Step B22');
      assert.equal(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should expand scenarios from example table with chevrons', () => {
      var scenarios = parse_file('example_table/example_table_with_chevrons', {
        leftPlaceholderChar: '<',
        rightPlaceholderChar: '>',
      }).scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[0].steps[0], 'Step A11');
      assert.equal(scenarios[0].steps[1], 'Step 1AA');
      assert.equal(scenarios[1].title, 'Second Scenario');
      assert.equal(scenarios[1].steps[0], 'Step B22');
      assert.equal(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should expand scenarios from example table using \\u2506 separator', () => {
      var scenarios = parse_file('example_table/example_table_2506').scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[0].steps[0], 'Step A11');
      assert.equal(scenarios[0].steps[1], 'Step 1AA');
      assert.equal(scenarios[1].title, 'Second Scenario');
      assert.equal(scenarios[1].steps[0], 'Step B22');
      assert.equal(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should expand scenarios from example table with outer borders', () => {
      var scenarios = parse_file('example_table/example_table_with_outer_borders').scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[0].steps[0], 'Step A11');
      assert.equal(scenarios[0].steps[1], 'Step 1AA');
      assert.equal(scenarios[1].title, 'Second Scenario');
      assert.equal(scenarios[1].steps[0], 'Step B22');
      assert.equal(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should stash annotations for following scenarios', () => {
      var scenarios = parse_file('example_table/example_table_followed_by_annotated_scenario').scenarios;
      assert.equal(scenarios.length, 3);
      assert.equal(scenarios[2].title, 'Annotated Scenario');
      assert(scenarios[2].annotations.pending);
    });

    it('should report malformed singleline example tables', () => {
      assert.throws(() => {
        parse_file('example_table/malformed_example_table_1').scenarios;
      }, /Incorrect number of fields in example table/);

      assert.throws(() => {
        parse_file('example_table/malformed_example_table_2').scenarios;
      }, /Blank is unexpected at this time/);

      assert.throws(() => {
        parse_file('example_table/malformed_example_table_3').scenarios;
      }, /Text is unexpected at this time/);
    });

    it('should report incomplete example table', () => {
      assert.throws(() => {
        parse_file('example_table/incomplete_example_table_1');
      }, /Examples table requires one or more headings/);

      assert.throws(() => {
        parse_file('example_table/incomplete_example_table_2');
      }, /Examples table requires one or more rows/);

      assert.throws(() => {
        parse_file('example_table/incomplete_example_table_3');
      }, /Scenario is unexpected at this time/);

      assert.throws(() => {
        parse_file('example_table/incomplete_example_table_4');
      }, /Scenario is unexpected at this time/);
    });

    it('should expand feature background from example table', () => {
      var feature = parse_file('example_table/feature_with_background_and_example_table');
      assert.equal(feature.scenarios.length, 4);
      assert.equal(feature.scenarios[0].steps[0], 'BG A1');
      assert.equal(feature.scenarios[1].steps[0], 'BG B2');
      assert.equal(feature.scenarios[2].steps[0], 'BG X3');
      assert.equal(feature.scenarios[3].steps[0], 'BG Y4');
    });

    it('should add meta fields to example table', () => {
      var scenarios = parse_file('example_table/meta_fields').scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[0].steps[0], '1 First 9:5');
      assert.equal(scenarios[0].steps[1], '1 A 9:14');
      assert.equal(scenarios[0].steps[2], '1 1 9:23');
      assert.equal(scenarios[1].title, 'Second Scenario');
      assert.equal(scenarios[1].steps[0], '2 Second 10:5');
      assert.equal(scenarios[1].steps[1], '2 B 10:14');
      assert.equal(scenarios[1].steps[2], '2 2 10:23');
    });

    it('should expand multiline step scenarios from example table', () => {
      var scenarios = parse_file('example_table/multiline_step_example_table').scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'First Scenario');
      assert.equal(scenarios[0].steps[0], 'Step\nA11\n1AA');
      assert.equal(scenarios[1].title, 'Second Scenario');
      assert.equal(scenarios[1].steps[0], 'Step\nB22\n2BB');
    });
  });

  describe('(Multiline Example Tables)', () => {
    it('should expand scenarios from simple multiline example table', () => {
      var scenarios = parse_file('example_table/simple_multiline_example_table').scenarios;
      assert.equal(scenarios.length, 2);

      assert.equal(scenarios[0].title, 'Simple Multiline Example Table');
      assert.equal(scenarios[0].steps.length, 2);
      assert.equal(scenarios[0].steps[0], 'Step left 1');
      assert.equal(scenarios[0].steps[1], ['Step right 1', 'right 2'].join('\n'));

      assert.equal(scenarios[1].title, 'Simple Multiline Example Table');
      assert.equal(scenarios[1].steps.length, 2);
      assert.equal(scenarios[1].steps[0], ['Step left 3', 'left 4'].join('\n'));
      assert.equal(scenarios[1].steps[1], 'Step right 3');
    });

    it('should expand scenarios from complex multiline examples', () => {
      var scenarios = parse_file('example_table/complex_multiline_example_table').scenarios;
      assert.equal(scenarios.length, 2);

      assert.equal(scenarios[0].title, 'Complex Multiline Example Table');
      assert.equal(scenarios[0].steps.length, 2);
      assert.equal(scenarios[0].steps[0], 'Step x {\n  y\n }');
      assert.equal(scenarios[0].steps[1], 'Step foo');

      assert.equal(scenarios[1].title, 'Complex Multiline Example Table');
      assert.equal(scenarios[0].steps.length, 2);
      assert.equal(scenarios[1].steps[0], 'Step ');
      assert.equal(scenarios[1].steps[1], 'Step x {\n  y\n }');
    });

    it('should expand scenarios from multiline example table with outer border', () => {
      var scenarios = parse_file('example_table/multiline_example_table_with_outer_border').scenarios;
      assert.equal(scenarios.length, 2);

      assert.equal(scenarios[0].title, 'Multiline Example Table With Outer Border');
      assert.equal(scenarios[0].steps.length, 2);
      assert.equal(scenarios[0].steps[0], 'Step left 1');
      assert.equal(scenarios[0].steps[1], ['Step right 1', 'right 2'].join('\n'));

      assert.equal(scenarios[1].title, 'Multiline Example Table With Outer Border');
      assert.equal(scenarios[1].steps.length, 2);
      assert.equal(scenarios[1].steps[0], ['Step left 3', 'left 4'].join('\n'));
      assert.equal(scenarios[1].steps[1], 'Step right 3');
    });

    it('should report malformed multiline examples', () => {
      assert.throws(() => {
        parse_file('example_table/malformed_multiline_example_table_1');
      }, /Dash is unexpected at this time/);

      assert.throws(() => {
        parse_file('example_table/malformed_multiline_example_table_2');
      }, /Indentation error/);

      assert.throws(() => {
        parse_file('example_table/malformed_multiline_example_table_3');
      }, /Text is unexpected at this time/);
    });

    it('should add meta fields to multiline example table', () => {
      var scenarios = parse_file('example_table/meta_fields_multiline_example_table').scenarios;
      assert.equal(scenarios.length, 2);

      assert.equal(scenarios[0].title, 'Meta Fields Multiline Example Table');
      assert.equal(scenarios[0].steps.length, 2);
      assert.equal(scenarios[0].steps[0], '1 left 1 9:5');
      assert.equal(scenarios[0].steps[1], '1 right 1\nright 2 9:14');

      assert.equal(scenarios[1].title, 'Meta Fields Multiline Example Table');
      assert.equal(scenarios[1].steps.length, 2);
      assert.equal(scenarios[1].steps[0], '2 left 3\nleft 4 12:5');
      assert.equal(scenarios[1].steps[1], '2 right 3 12:14');
    });
  });

  describe('(Localisation)', () => {
    it('should support multiple languages', () => {
      var feature = parse_file('localisation/pirate_feature', Pirate);
      assert.equal(feature.title, 'Treasure Island');

      var scenarios = feature.scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'The Black Spot');
      assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

      assert(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
    });

    it('should support multiple languages using the options object', () => {
      var feature = parse_file('localisation/pirate_feature', { language: Pirate });
      assert.equal(feature.title, 'Treasure Island');

      var scenarios = feature.scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'The Black Spot');
      assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

      assert(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
    });

    it('should support changing the default language', () => {
      Localisation.default = Pirate;
      var feature = new FeatureParser().parse(load('localisation/pirate_feature'));

      assert.equal(feature.title, 'Treasure Island');

      var scenarios = feature.scenarios;
      assert.equal(scenarios.length, 2);
      assert.equal(scenarios[0].title, 'The Black Spot');
      assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

      assert(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
    });

    it('should support localised rules', () => {
      var feature = parse_file('localisation/pirate_rule', Pirate);
      assert.equal(feature.title, 'Treasure Island');
      assert.equal(feature.rules.length, 1);
      assert.equal(feature.rules[0].title, 'The Pirate Code');
      assert.equal(feature.rules[0].scenarios[0].title, 'The Black Spot');
    });

    it('should report missing translations', () => {
      var language = new Language('Incomplete', {});
      assert.throws(() => {
        parse_file('feature/multiple_features', language);
      }, /Keyword "feature" has not been translated into Incomplete/);
    });

    it('should report supported keywords without throwing', () => {
      var language = new Language('Partial', { feature: '[Ff]eature' });
      assert.equal(language.supports('feature'), true);
      assert.equal(language.supports('rule'), false);
    });
  });

  describe('(Feature Backgrounds)', () => {
    it('should parse feature background', () => {
      var feature = parse_file('background/feature_with_background');
      assert.equal(feature.scenarios[0].steps[0], 'Given A');
    });

    it('shoud parse multiline step background', () => {
      var scenarios = parse_file('background/background_with_multiline_step').scenarios;
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Simple Scenario');
      assert.equal(scenarios[0].steps[0], poem);
      assert.equal(scenarios[0].steps[1], 'Given A');
    });

    it('should report background annotations', () => {
      assert.throws(() => {
        parse_file('background/malformed_background_annotated');
      }, /Background is unexpected at this time/);
    });
  });

  describe('(Rules)', () => {
    it('should parse a rule with scenarios', () => {
      var feature = parse_file('rule/feature_with_rule');
      assert.equal(feature.rules.length, 1);
      assert.equal(feature.rules[0].title, 'First Rule');
      assert.equal(feature.rules[0].scenarios.length, 2);
      assert.equal(feature.rules[0].scenarios[0].title, 'First Scenario');
      assert.deepEqual(feature.rules[0].scenarios[0].steps, ['Given A', 'When B', 'Then C']);
      assert.equal(feature.rules[0].scenarios[1].title, 'Second Scenario');
      assert.deepEqual(feature.rules[0].scenarios[1].steps, ['Given D', 'When E', 'Then F']);
    });

    it('should keep top level scenarios separate from rule scenarios', () => {
      var feature = parse_file('rule/feature_with_top_level_and_rule_scenarios');
      assert.equal(feature.scenarios.length, 1);
      assert.equal(feature.scenarios[0].title, 'Top Level Scenario');
      assert.equal(feature.rules.length, 1);
      assert.equal(feature.rules[0].title, 'A Rule');
      assert.equal(feature.rules[0].scenarios.length, 1);
      assert.equal(feature.rules[0].scenarios[0].title, 'Rule Scenario');
    });

    it('should parse multiple rules', () => {
      var feature = parse_file('rule/multiple_rules');
      assert.equal(feature.rules.length, 2);
      assert.equal(feature.rules[0].title, 'First Rule');
      assert.equal(feature.rules[1].title, 'Second Rule');
      assert.equal(feature.rules[0].scenarios[0].title, 'First Scenario');
      assert.equal(feature.rules[1].scenarios[0].title, 'Second Scenario');
    });

    it('should parse a rule description', () => {
      var feature = parse_file('rule/rule_with_description');
      assert.equal(feature.rules[0].description.join(' - '), 'This rule describes a business constraint - that spans multiple lines');
    });

    it('should report rule annotations', () => {
      var feature = parse_file('rule/annotated_rule');
      assert(feature.rules[0].annotations.only, 'Rule was not annotated');
    });

    it('should expose an empty rules array when there are no rules', () => {
      var feature = parse_file('scenario/simple_scenario');
      assert.deepEqual(feature.rules, []);
      assert.equal(feature.scenarios.length, 1);
    });

    it('should not recognise rules in languages without a rule keyword', () => {
      var language = new Language('NoRule', {
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
      var feature = parse_file('scenario/simple_scenario', language);
      assert.equal(feature.scenarios.length, 1);
      assert.deepEqual(feature.rules, []);
    });
  });

  describe('(Rule Backgrounds)', () => {
    it('should prepend feature and rule background steps to rule scenarios', () => {
      var feature = parse_file('rule/rule_with_background');
      var scenario = feature.rules[0].scenarios[0];
      assert.deepEqual(scenario.steps, ['Given feature background step', 'Given rule background step', 'Given A', 'When B', 'Then C']);
    });
  });

  describe('(Malformed Rules)', () => {
    it('should reject a rule without scenarios', () => {
      assert.throws(() => {
        parse_file('rule/empty_rule');
      }, /Rule requires one or more scenarios/);
    });

    it('should reject a rule immediately following a scenario-less rule', () => {
      assert.throws(() => {
        parse_file('rule/nested_rule');
      }, /Rule requires one or more scenarios/);
    });
  });

  describe('(Comments)', () => {
    it('should support single line comments', () => {
      var feature = parse_file('comment/singleline_comment');
      var scenarios = feature.scenarios;
      assert.equal(feature.title, 'Single Line Comments Feature');
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Single Line Comments Scenario');
      assert.deepEqual(scenarios[0].steps, ['Given A', 'When # B', 'Then C #']);
    });

    it('should parse multiline comments', () => {
      var feature = parse_file('comment/multiline_comment');
      var scenarios = feature.scenarios;
      assert.equal(feature.title, 'Simple Feature');
      assert.equal(scenarios.length, 1);
      assert.equal(scenarios[0].title, 'Simple Scenario');
      assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });
  });

  function parse_file(filename, options) {
    return new FeatureParser(options).parse(load(filename));
  }

  function load(filename) {
    return fs.readFileSync(path.join(__dirname, 'features', `${filename}.feature`), 'utf8');
  }

  var poem = [
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

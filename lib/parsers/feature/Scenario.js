const StringUtils = require('../../StringUtils');
const fn = require('../../fn');

// Understands a scenario
module.exports = (registry) => {
  return function Scenario(title, background, annotations, feature) {
    const description = [];
    const steps = [];
    let blanks = [];
    let examples;
    let indentation = 0;
    const handlers = new registry.Handlers({
      text: capture_step,
      blank: fn.noop,
      annotation: start_scenario,
      scenario: start_scenario,
      rule: start_scenario,
      examples: start_examples,
    });
    const _this = this;

    function capture_step(event, text, line_number) {
      handlers.register('dash', enable_multiline_step);
      steps.push(StringUtils.trim(text));
    }

    function enable_multiline_step(event, text, line_number) {
      handlers.unregister('dash', 'annotation', 'scenario', 'rule', 'examples');
      handlers.register('text', start_multiline_step);
      handlers.register('blank', stash_blanks);
      indentation = StringUtils.indentation(text);
    }

    function start_multiline_step(event, text, line_number) {
      handlers.register('dash', disable_multiline_step);
      handlers.register('text', continue_multiline_step);
      handlers.register('blank', stash_blanks);
      handlers.register('annotation', start_scenario);
      handlers.register('scenario', start_scenario);
      handlers.register('rule', start_scenario);
      handlers.register('examples', start_examples);
      append_to_step(text, '\n');
    }

    function continue_multiline_step(event, text, line_number) {
      unstash_blanks();
      append_to_step(text, '\n');
    }

    function stash_blanks(event, text, line_number) {
      blanks.push(text);
    }

    function unstash_blanks() {
      if (!blanks.length) return;
      append_to_step(blanks.join('\n'), '\n');
      blanks = [];
    }

    function disable_multiline_step(event, text, line_number) {
      handlers.unregister('dash');
      handlers.register('text', capture_step);
      handlers.register('blank', fn.noop);
      unstash_blanks();
    }

    function append_to_step(text, prefix) {
      if (StringUtils.isNotBlank(text) && StringUtils.indentation(text) < indentation) throw new Error('Indentation error');
      steps[steps.length - 1] = steps[steps.length - 1] + prefix + StringUtils.rtrim(text.substr(indentation));
    }

    function start_scenario(event, data, line_number) {
      validate();
      return feature.on(event, data, line_number);
    }

    function start_examples(event, data, line_number) {
      validate();
      examples = new registry.Examples(_this);
      return examples;
    }

    function validate() {
      if (steps.length === 0) throw new Error('Scenario requires one or more steps');
    }

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.export = () => {
      validate();
      const result = {
        title: title,
        annotations: annotations.export(),
        description: description,
        steps: background.export().steps.concat(steps),
      };
      return examples ? examples.expand(result) : result;
    };
  };
};

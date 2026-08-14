const StringUtils = require('../../StringUtils');
const fn = require('../../fn');
const Handlers = require('./Handlers');

// Understands a set of steps shared between scenarios
const Background = function (title, feature) {
  const steps = [];
  let blanks = [];
  let indentation = 0;
  const handlers = new Handlers({
    text: capture_step,
    blank: fn.noop,
    annotation: stash_annotation,
    scenario: start_scenario,
    rule: start_scenario,
  });

  function capture_step(event, text, line_number) {
    handlers.register('dash', enable_multiline_step);
    steps.push(StringUtils.trim(text));
  }

  function enable_multiline_step(event, text, line_number) {
    handlers.unregister('dash', 'annotation', 'scenario', 'rule');
    handlers.register('text', start_multiline_step);
    handlers.register('blank', stash_blanks);
    indentation = StringUtils.indentation(text);
  }

  function start_multiline_step(event, text, line_number) {
    handlers.register('dash', disable_multiline_step);
    handlers.register('text', continue_multiline_step);
    handlers.register('blank', stash_blanks);
    handlers.register('annotation', stash_annotation);
    handlers.register('scenario', start_scenario);
    handlers.register('rule', start_scenario);
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

  function stash_annotation(event, annotation, line_number) {
    validate();
    return feature.on(event, annotation, line_number);
  }

  function start_scenario(event, data, line_number) {
    validate();
    return feature.on(event, data, line_number);
  }

  function validate() {
    if (steps.length === 0) throw new Error('Background requires one or more steps');
  }

  this.on = function (event, data, line_number) {
    return handlers.find(event).handle(event, data, line_number) || this;
  };

  this.export = () => ({
    steps: steps,
  });
};

// Understands the absence of a background
const NullBackground = function () {
  const handlers = new Handlers();

  this.on = function (event, data, line_number) {
    return handlers.find(event).handle(event, data, line_number) || this;
  };

  this.export = () => ({
    steps: [],
  });
};

// Understands the combination of a feature and a rule background
const MergedBackground = function (outer, inner) {
  const handlers = new Handlers();

  this.on = function (event, data, line_number) {
    return handlers.find(event).handle(event, data, line_number) || this;
  };

  this.export = () => ({
    steps: outer.export().steps.concat(inner.export().steps),
  });
};

module.exports = { Background: Background, NullBackground: NullBackground, MergedBackground: MergedBackground };

const $ = require('../../Array');
const StringUtils = require('../../StringUtils');
const fn = require('../../fn');

// Understands a group of scenarios sharing a rule
module.exports = (registry) => {
  return function Rule(title, annotations, feature, feature_background) {
    const description = [];
    const scenarios = [];
    let stashed_annotations = new registry.Annotations();
    let background = new registry.NullBackground();
    const handlers = new registry.Handlers({
      text: capture_description,
      blank: fn.noop,
      annotation: stash_annotation,
      scenario: start_scenario,
      background: start_background,
      rule: delegate,
    });
    const _this = this;

    function start_background(event, title) {
      background = new registry.Background(title, _this);
      stashed_annotations = new registry.Annotations();
      return background;
    }

    function stash_annotation(event, annotation) {
      handlers.unregister('background', 'text');
      stashed_annotations.stash(annotation.key, annotation.value);
    }

    function capture_description(event, text) {
      description.push(StringUtils.trim(text));
    }

    function start_scenario(event, title) {
      const scenario = new registry.Scenario(title, new registry.MergedBackground(feature_background, background), stashed_annotations, _this);
      scenarios.push(scenario);
      stashed_annotations = new registry.Annotations();
      return scenario;
    }

    function delegate(event, data, line_number) {
      validate();
      return feature.on(event, data, line_number);
    }

    function validate() {
      if (scenarios.length === 0) throw new Error('Rule requires one or more scenarios');
    }

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.export = () => {
      validate();
      return {
        title: title,
        annotations: annotations.export(),
        description: description,
        scenarios: $(scenarios)
          .collect((scenario) => scenario.export())
          .flatten()
          .naked(),
      };
    };
  };
};

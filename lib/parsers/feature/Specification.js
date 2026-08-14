const fn = require('../../fn');

// Understands a whole specification
module.exports = (registry) => {
  return function Specification() {
    let current_element = this;
    let feature;
    const annotations = new registry.Annotations();
    const handlers = new registry.Handlers({
      text: fn.noop,
      blank: fn.noop,
      annotation: stash_annotation,
      feature: start_feature,
      rule: start_scenario,
      scenario: start_scenario,
      background: start_scenario,
    });

    function stash_annotation(event, annotation) {
      handlers.unregister('background');
      annotations.stash(annotation.key, annotation.value);
    }

    function start_feature(event, title) {
      return (feature = new registry.Feature(title, annotations, new registry.Annotations()));
    }

    function start_scenario(event, title, line_number) {
      feature = new registry.Feature(title, new registry.Annotations(), annotations);
      return feature.on(event, title, line_number);
    }

    this.handle = (event, data, line_number) => {
      current_element = current_element.on(event, data, line_number);
    };

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.export = () => {
      if (!feature) throw new Error('A feature must contain one or more scenarios');
      return feature.export();
    };
  };
};

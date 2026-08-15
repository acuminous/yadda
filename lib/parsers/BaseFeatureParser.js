const $ = require('../Array');
const Localisation = require('../localisation');
const Handlers = require('./feature/Handlers');
const Annotations = require('./feature/Annotations');
const Backgrounds = require('./feature/Background');
const createExamples = require('./feature/Examples');
const createScenario = require('./feature/Scenario');
const createRule = require('./feature/Rule');
const createFeature = require('./feature/Feature');
const createSpecification = require('./feature/Specification');

// Understands the parts of feature parsing common to every syntax:
// language keyword vocabulary, the construct state machine, and the
// line-splitting / error-wrapping parse loop. Subclasses supply parse_line.
const BaseFeatureParser = function (options) {
  const defaults = { language: Localisation.default, leftPlaceholderChar: '[', rightPlaceholderChar: ']' };
  const opts = options?.is_language ? { language: options } : options || defaults;
  const language = opts.language || defaults.language;
  const left_placeholder_char = opts.leftPlaceholderChar || defaults.leftPlaceholderChar;
  const right_placeholder_char = opts.rightPlaceholderChar || defaults.rightPlaceholderChar;

  this.keywords = {
    feature: new RegExp(`^\\s*${language.translate('feature')}:\\s*(.*)`, 'i'),
    rule: language.supports('rule') ? new RegExp(`^\\s*${language.translate('rule')}:\\s*(.*)`, 'i') : /(?!)/, // Never matches when the language has no rule keyword
    scenario: new RegExp(`^\\s*${language.translate('scenario')}:\\s*(.*)`, 'i'),
    background: new RegExp(`^\\s*${language.translate('background')}:\\s*(.*)`, 'i'),
    examples: new RegExp(`^\\s*${language.translate('examples')}:`, 'i'),
  };

  const registry = {
    config: { left_placeholder_char: left_placeholder_char, right_placeholder_char: right_placeholder_char },
    Handlers: Handlers,
    Annotations: Annotations,
    Background: Backgrounds.Background,
    NullBackground: Backgrounds.NullBackground,
    MergedBackground: Backgrounds.MergedBackground,
  };
  registry.Examples = createExamples(registry);
  registry.Scenario = createScenario(registry);
  registry.Rule = createRule(registry);
  registry.Feature = createFeature(registry);
  registry.Specification = createSpecification(registry);
  this.registry = registry;

  let specification;

  this.parse = (text, next) => {
    specification = new registry.Specification();
    this.reset();
    split(text).each((line, index) => {
      const line_number = index + 1;
      try {
        this.parse_line(line, line_number);
      } catch (e) {
        e.message = `Error parsing line ${line_number}, "${line}".\nOriginal error was: ${e.message}`;
        throw e;
      }
    });
    return next?.(specification.export()) || specification.export();
  };

  this.emit = (event, data, line_number) => specification.handle(event, data, line_number);

  // Overridable hook for subclasses to reset their own per-parse state.
  this.reset = () => {};

  function split(text) {
    return $(text.split(/\r\n|\n/));
  }
};

module.exports = BaseFeatureParser;

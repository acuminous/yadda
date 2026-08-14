const $ = require('../Array');
const StringUtils = require('../StringUtils');
const Localisation = require('../localisation');
const Handlers = require('./feature/Handlers');
const Annotations = require('./feature/Annotations');
const Backgrounds = require('./feature/Background');
const createExamples = require('./feature/Examples');
const createScenario = require('./feature/Scenario');
const createRule = require('./feature/Rule');
const createFeature = require('./feature/Feature');
const createSpecification = require('./feature/Specification');

const FeatureParser = function (options) {
  const defaults = { language: Localisation.default, leftPlaceholderChar: '[', rightPlaceholderChar: ']' };
  const opts = options?.is_language ? { language: options } : options || defaults;
  const language = opts.language || defaults.language;
  const left_placeholder_char = opts.leftPlaceholderChar || defaults.leftPlaceholderChar;
  const right_placeholder_char = opts.rightPlaceholderChar || defaults.rightPlaceholderChar;

  const FEATURE_REGEX = new RegExp(`^\\s*${language.translate('feature')}:\\s*(.*)`, 'i');
  const RULE_REGEX = language.supports('rule') ? new RegExp(`^\\s*${language.translate('rule')}:\\s*(.*)`, 'i') : /(?!)/; // Never matches when the language has no rule keyword
  const SCENARIO_REGEX = new RegExp(`^\\s*${language.translate('scenario')}:\\s*(.*)`, 'i');
  const BACKGROUND_REGEX = new RegExp(`^\\s*${language.translate('background')}:\\s*(.*)`, 'i');
  const EXAMPLES_REGEX = new RegExp(`^\\s*${language.translate('examples')}:`, 'i');
  const TEXT_REGEX = /^(.*)$/i;
  const SINGLE_LINE_COMMENT_REGEX = /^\s*#/;
  const MULTI_LINE_COMMENT_REGEX = /^\s*#{3,}/;
  const BLANK_REGEX = /^(\s*)$/;
  const DASH_REGEX = /(^\s*[|┆]?-{3,})/;
  const SIMPLE_ANNOTATION_REGEX = /^\s*@([^=]*)$/;
  const NVP_ANNOTATION_REGEX = /^\s*@([^=]*)=(.*)$/;

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

  let specification;
  let comment;

  this.parse = (text, next) => {
    reset();
    split(text).each(parse_line);
    return next?.(specification.export()) || specification.export();
  };

  function reset() {
    specification = new registry.Specification();
    comment = false;
  }

  function split(text) {
    return $(text.split(/\r\n|\n/));
  }

  function parse_line(line, index) {
    let match;
    const line_number = index + 1;
    try {
      if ((match = MULTI_LINE_COMMENT_REGEX.test(line))) return (comment = !comment);
      if (comment) return;
      if ((match = SINGLE_LINE_COMMENT_REGEX.test(line))) return;
      if ((match = SIMPLE_ANNOTATION_REGEX.exec(line))) return specification.handle('Annotation', { key: StringUtils.trim(match[1]), value: true }, line_number);
      if ((match = NVP_ANNOTATION_REGEX.exec(line))) return specification.handle('Annotation', { key: StringUtils.trim(match[1]), value: StringUtils.trim(match[2]) }, line_number);
      if ((match = FEATURE_REGEX.exec(line))) return specification.handle('Feature', match[1], line_number);
      if ((match = RULE_REGEX.exec(line))) return specification.handle('Rule', match[1], line_number);
      if ((match = SCENARIO_REGEX.exec(line))) return specification.handle('Scenario', match[1], line_number);
      if ((match = BACKGROUND_REGEX.exec(line))) return specification.handle('Background', match[1], line_number);
      if ((match = EXAMPLES_REGEX.exec(line))) return specification.handle('Examples', line_number);
      if ((match = BLANK_REGEX.exec(line))) return specification.handle('Blank', match[0], line_number);
      if ((match = DASH_REGEX.exec(line))) return specification.handle('Dash', match[1], line_number);
      if ((match = TEXT_REGEX.exec(line))) return specification.handle('Text', match[1], line_number);
    } catch (e) {
      e.message = `Error parsing line ${line_number}, "${line}".\nOriginal error was: ${e.message}`;
      throw e;
    }
  }
};

module.exports = FeatureParser;

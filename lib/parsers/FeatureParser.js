const StringUtils = require('../StringUtils');
const BaseFeatureParser = require('./BaseFeatureParser');

const TEXT_REGEX = /^(.*)$/i;
const SINGLE_LINE_COMMENT_REGEX = /^\s*#/;
const MULTI_LINE_COMMENT_REGEX = /^\s*#{3,}/;
const BLANK_REGEX = /^(\s*)$/;
const DASH_REGEX = /(^\s*[|┆]?-{3,})/;
const SIMPLE_ANNOTATION_REGEX = /^\s*@([^=]*)$/;
const NVP_ANNOTATION_REGEX = /^\s*@([^=]*)=(.*)$/;

const FeatureParser = function (options) {
  BaseFeatureParser.call(this, options);
  const keywords = this.keywords;
  let comment;

  this.reset = () => {
    comment = false;
  };

  this.parse_line = (line, line_number) => {
    let match;
    if (MULTI_LINE_COMMENT_REGEX.test(line)) return (comment = !comment);
    if (comment) return;
    if (SINGLE_LINE_COMMENT_REGEX.test(line)) return;
    if ((match = SIMPLE_ANNOTATION_REGEX.exec(line))) return this.emit('Annotation', { key: StringUtils.trim(match[1]), value: true }, line_number);
    if ((match = NVP_ANNOTATION_REGEX.exec(line))) return this.emit('Annotation', { key: StringUtils.trim(match[1]), value: StringUtils.trim(match[2]) }, line_number);
    if ((match = keywords.feature.exec(line))) return this.emit('Feature', match[1], line_number);
    if ((match = keywords.rule.exec(line))) return this.emit('Rule', match[1], line_number);
    if ((match = keywords.scenario.exec(line))) return this.emit('Scenario', match[1], line_number);
    if ((match = keywords.background.exec(line))) return this.emit('Background', match[1], line_number);
    if (keywords.examples.exec(line)) return this.emit('Examples', line_number);
    if ((match = BLANK_REGEX.exec(line))) return this.emit('Blank', match[0], line_number);
    if ((match = DASH_REGEX.exec(line))) return this.emit('Dash', match[1], line_number);
    if ((match = TEXT_REGEX.exec(line))) return this.emit('Text', match[1], line_number);
  };
};

module.exports = FeatureParser;

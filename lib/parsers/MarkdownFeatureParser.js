const StringUtils = require('../StringUtils');
const BaseFeatureParser = require('./BaseFeatureParser');

const HEADING_REGEX = /^\s*#+\s*(.*)$/;
const FENCE_REGEX = /^\s*(`{3,}|~{3,})/;
const COMMENT_OPEN_REGEX = /^\s*<!--/;
const COMMENT_CLOSE_REGEX = /-->/;
const BLOCKQUOTE_REGEX = /^\s*>/;
const BLANK_REGEX = /^\s*$/;
const LIST_ITEM_REGEX = /^\s*[-*+]\s+(.*)$/;
const TABLE_ROW_REGEX = /^\s*\|/;
const SIMPLE_ANNOTATION_REGEX = /^\s*@([^=]*)$/;
const NVP_ANNOTATION_REGEX = /^\s*@([^=]*)=(.*)$/;

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

// Decodes the handful of HTML entities markdown authors reach for in prose.
// Never applied inside fenced code blocks, where content must stay verbatim.
function decode_entities(text) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isNaN(value) ? match : String.fromCodePoint(value);
    }
    const named = NAMED_ENTITIES[code.toLowerCase()];
    return named !== undefined ? named : match;
  });
}

function strip_outer_pipes(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '');
}

function is_table_separator(line) {
  const cells = strip_outer_pipes(line).split('|');
  return cells.length > 0 && cells.every((cell) => /^\s*:?-+:?\s*$/.test(cell));
}

// Understands feature specifications written as GitHub-flavoured markdown
const MarkdownFeatureParser = function (options) {
  BaseFeatureParser.call(this, options);
  const keywords = this.keywords;
  let in_fence;
  let fence_marker;
  let in_comment;
  let prev_was_table_row;

  this.reset = () => {
    in_fence = false;
    fence_marker = null;
    in_comment = false;
    prev_was_table_row = false;
  };

  this.parse_line = (line, line_number) => {
    let match;
    if (in_comment) return (in_comment = !COMMENT_CLOSE_REGEX.test(line));
    if (in_fence && closes_fence(line)) return close_fence(line, line_number);
    if (in_fence) return this.emit('Text', line, line_number);
    if (COMMENT_OPEN_REGEX.test(line)) return (in_comment = !COMMENT_CLOSE_REGEX.test(line));
    if ((match = FENCE_REGEX.exec(line))) return open_fence(match[1], line, line_number);
    if (BLOCKQUOTE_REGEX.test(line)) return (prev_was_table_row = false); // swallow blockquotes: visible comments that are never steps
    if (prev_was_table_row && is_table_separator(line)) return; // swallow the GitHub table separator row
    prev_was_table_row = TABLE_ROW_REGEX.test(line);
    if (BLANK_REGEX.test(line)) return this.emit('Blank', line, line_number);
    if ((match = HEADING_REGEX.exec(line))) return emit_heading(match[1], line_number);
    if ((match = SIMPLE_ANNOTATION_REGEX.exec(line))) return this.emit('Annotation', { key: StringUtils.trim(match[1]), value: true }, line_number);
    if ((match = NVP_ANNOTATION_REGEX.exec(line))) return this.emit('Annotation', { key: StringUtils.trim(match[1]), value: StringUtils.trim(match[2]) }, line_number);
    if (prev_was_table_row) return this.emit('Text', decode_entities(strip_outer_pipes(line)), line_number);
    if ((match = LIST_ITEM_REGEX.exec(line))) return this.emit('Text', decode_entities(match[1]), line_number);
    return this.emit('Text', decode_entities(line), line_number);
  };

  const emit_heading = (text, line_number) => {
    let match;
    if ((match = keywords.feature.exec(text))) return this.emit('Feature', match[1], line_number);
    if ((match = keywords.rule.exec(text))) return this.emit('Rule', match[1], line_number);
    if ((match = keywords.scenario.exec(text))) return this.emit('Scenario', match[1], line_number);
    if ((match = keywords.background.exec(text))) return this.emit('Background', match[1], line_number);
    if (keywords.examples.exec(text)) return this.emit('Examples', line_number);
    return this.emit('Text', decode_entities(text), line_number);
  };

  const open_fence = (marker, line, line_number) => {
    in_fence = true;
    fence_marker = marker[0];
    return this.emit('Dash', line, line_number);
  };

  const close_fence = (line, line_number) => {
    in_fence = false;
    return this.emit('Dash', line, line_number);
  };

  const closes_fence = (line) => new RegExp(`^\\s*\\${fence_marker}{3,}\\s*$`).test(line);
};

module.exports = MarkdownFeatureParser;

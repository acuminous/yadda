const $ = require('../Array');
const StringUtils = require('../StringUtils');
const COLUMN_SEPARATOR_REGEX = /[|\u2506]/;
const OUTER_BORDERS_REGEX = /^[|\u2506]|[|\u2506]$/g;
const DASH_REGEX = /^[\\|\u2506]?-{3,}/;

module.exports = function table_converter(value, next) {
  const rows = value.split(/\n/);
  const headings = parse_headings(rows.shift());
  const handler = is_horizinal_separator(rows[0]) ? handle_multiline_row : handle_single_line_row;
  const table = $();

  try {
    $(rows).each(handler);
    next(null, collapse(table));
  } catch (err) {
    next(err);
  }

  function handle_single_line_row(row) {
    if (is_horizinal_separator(row)) throw new Error('Dashes are unexpected at this time');
    start_new_row();
    parse_fields(row);
  }

  function handle_multiline_row(row) {
    if (is_horizinal_separator(row)) return start_new_row();
    parse_fields(row);
  }

  function parse_headings(row) {
    return $(row.replace(OUTER_BORDERS_REGEX, '').split(COLUMN_SEPARATOR_REGEX))
      .collect((value) => ({ text: StringUtils.trim(value), indentation: StringUtils.indentation(value) }))
      .naked();
  }

  function is_horizinal_separator(row) {
    return DASH_REGEX.test(row);
  }

  function start_new_row() {
    table.push({});
  }

  function parse_fields(row) {
    const fields = table.last();
    $(row.replace(OUTER_BORDERS_REGEX, '').split(COLUMN_SEPARATOR_REGEX)).each((field, index) => {
      const column = headings[index].text;
      const indentation = headings[index].indentation;
      const text = StringUtils.rtrim(field.substr(indentation));
      if (StringUtils.isNotBlank(field) && StringUtils.indentation(field) < indentation) throw new Error('Indentation error');
      fields[column] = (fields[column] || []).concat(text);
    });
  }

  function collapse(table) {
    return table
      .collect((row) => {
        const new_row = {};
        for (const heading in row) {
          new_row[heading] = row[heading].join('\n');
        }
        return new_row;
      })
      .naked();
  }
};

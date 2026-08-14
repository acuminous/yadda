const $ = require('../../Array');
const StringUtils = require('../../StringUtils');
const fn = require('../../fn');

// Understands an example table
module.exports = (registry) => {
  const { left_placeholder_char, right_placeholder_char } = registry.config;

  return function Examples(scenario) {
    let headings = [];
    const examples = $();
    let annotations = new registry.Annotations();
    const handlers = new registry.Handlers({
      blank: fn.noop,
      dash: start_example_table,
      text: capture_headings,
    });

    function start_example_table(evnet, data, line_number) {
      handlers.unregister('blank', 'dash');
    }

    function capture_headings(event, data, line_number) {
      handlers.register('annotation', stash_annotation);
      handlers.register('text', capture_singleline_fields);
      handlers.register('dash', enable_multiline_examples);
      let pos = 1;
      headings = split(data)
        .collect((column) => {
          const attributes = { text: StringUtils.trim(column), left: pos, indentation: StringUtils.indentation(column) };
          pos += column.length + 1;
          return attributes;
        })
        .naked();
    }

    function stash_annotation(event, annotation, line_number) {
      handlers.unregister('blank', 'dash');
      annotations.stash(annotation.key, annotation.value);
    }

    function capture_singleline_fields(event, data, line_number) {
      handlers.register('dash', end_example_table);
      handlers.register('blank', end_example_table);
      examples.push({ annotations: annotations, fields: parse_fields(data, {}) });
      add_meta_fields(line_number);
      annotations = new registry.Annotations();
    }

    function enable_multiline_examples(event, data, line_number) {
      handlers.register('text', start_capturing_multiline_fields);
      handlers.register('dash', stop_capturing_multiline_fields);
    }

    function start_capturing_multiline_fields(event, data, line_number) {
      handlers.register('text', continue_capturing_multiline_fields);
      handlers.register('dash', stop_capturing_multiline_fields);
      handlers.register('blank', end_example_table);
      examples.push({ annotations: annotations, fields: parse_fields(data, {}) });
      add_meta_fields(line_number);
    }

    function continue_capturing_multiline_fields(event, data, line_number) {
      parse_fields(data, examples.last().fields);
    }

    function stop_capturing_multiline_fields(event, data, line_number) {
      handlers.register('text', start_capturing_multiline_fields);
      annotations = new registry.Annotations();
    }

    function end_example_table(event, data, line_number) {
      handlers.unregister('text', 'dash');
      handlers.register('blank', fn.noop);
      handlers.register('annotation', start_scenario);
      handlers.register('scenario', start_scenario);
      handlers.register('rule', start_scenario);
    }

    function add_meta_fields(line_number) {
      const fields = examples.last().fields;
      $(headings).each((heading) => {
        fields[`${heading.text}.index`] = [examples.length];
        fields[`${heading.text}.start.line`] = [line_number];
        fields[`${heading.text}.start.column`] = [heading.left + heading.indentation];
      });
    }

    function parse_fields(row, fields) {
      split(row, headings.length).each((field, index) => {
        const column = headings[index].text;
        const indentation = headings[index].indentation;
        const text = StringUtils.rtrim(field.substr(indentation));
        if (StringUtils.isNotBlank(field) && StringUtils.indentation(field) < indentation) throw new Error('Indentation error');
        fields[column] = (fields[column] || []).concat(text);
      });
      return fields;
    }

    function split(row, number_of_fields) {
      const separator = row.indexOf('┆') >= 0 ? '┆' : '|';
      const fields = $(row.split(separator));
      if (number_of_fields !== undefined && number_of_fields !== fields.length) {
        throw new Error(`Incorrect number of fields in example table. Expected ${number_of_fields} but found ${fields.length}`);
      }
      return fields;
    }

    function start_scenario(event, data, line_number) {
      validate();
      return scenario.on(event, data, line_number);
    }

    function validate() {
      if (headings.length === 0) throw new Error('Examples table requires one or more headings');
      if (examples.length === 0) throw new Error('Examples table requires one or more rows');
    }

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.expand = (scenario) => {
      validate();
      return examples
        .collect((example) => ({
          title: substitute(example.fields, scenario.title),
          annotations: shallow_merge(example.annotations.export(), scenario.annotations),
          description: substitute_all(example, scenario.description),
          steps: substitute_all(example.fields, scenario.steps),
        }))
        .naked();
    };

    function shallow_merge() {
      const result = {};
      $(Array.prototype.slice.call(arguments)).each((annotations) => {
        for (const key in annotations) {
          result[key] = annotations[key];
        }
      });
      return result;
    }

    function substitute_all(example, lines) {
      return $(lines)
        .collect((line) => substitute(example, line))
        .naked();
    }

    function substitute(example, line) {
      for (const heading in example) {
        line = line.replace(new RegExp(`\\${left_placeholder_char}\\s*${heading}\\s*\\${right_placeholder_char}`, 'g'), StringUtils.rtrim(example[heading].join('\n')));
      }
      return line;
    }
  };
};

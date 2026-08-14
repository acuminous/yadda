const { describe, it } = require('node:test');
const { equal: eq, deepEqual: deq, ok, ifError } = require('node:assert');
const convert = require('../../lib/converters/table-converter');

describe('Table Converter', () => {
  it('Should convert strings to data tables', (_t, done) => {
    const text = ['left | right', '1    | 3', '2    | 4'].join('\n');

    convert(text, (err, value) => {
      ifError(err);
      eq(value.length, 2);
      deq(value[0], { left: '1', right: '3' });
      deq(value[1], { left: '2', right: '4' });
      done();
    });
  });

  it('Should maintain indentation', (_t, done) => {
    const text = ['left | middle | right', '  1  |   2    |   3  '].join('\n');

    convert(text, (err, value) => {
      ifError(err);
      eq(value.length, 1);
      deq(value[0], { left: '  1', middle: '  2', right: '  3' });
      done();
    });
  });

  it('Should support multiline rows', (_t, done) => {
    const text = [
      'Henry V                     | Romeo and Juliet',
      '----------------------------|------------------------',
      'Once more unto the          | What light from yonder',
      'breech dear friends         | window breaks',
      '----------------------------|------------------------',
      'And sheathed their          | It is the East',
      'swords for lack of argument | and Juliet is the sun',
    ].join('\n');

    convert(text, (err, value) => {
      ifError(err);
      eq(value.length, 2);
      deq(value[0], { 'Henry V': 'Once more unto the\nbreech dear friends', 'Romeo and Juliet': 'What light from yonder\nwindow breaks' });
      deq(value[1], { 'Henry V': 'And sheathed their\nswords for lack of argument', 'Romeo and Juliet': 'It is the East\nand Juliet is the sun' });
      done();
    });
  });

  it('Should maintain indentation for multiline rows', (_t, done) => {
    const text = [
      'Henry V                       | Romeo and Juliet',
      '------------------------------|------------------------',
      '  Once more unto the          |  What light from yonder',
      '                              |  ',
      '  breech dear friends         |  window breaks',
      '------------------------------|------------------------',
      '  And sheathed their          |  It is the East',
      '  swords for lack of argument |  and Juliet is the sun',
    ].join('\n');

    convert(text, (err, value) => {
      ifError(err);
      eq(value.length, 2);
      deq(value[0], { 'Henry V': '  Once more unto the\n\n  breech dear friends', 'Romeo and Juliet': ' What light from yonder\n\n window breaks' });
      deq(value[1], { 'Henry V': '  And sheathed their\n  swords for lack of argument', 'Romeo and Juliet': ' It is the East\n and Juliet is the sun' });
      done();
    });
  });

  it('Should support outer borders', (_t, done) => {
    const text = [
      ' Henry V                     | Romeo and Juliet       |',
      '-----------------------------|------------------------|',
      ' Once more unto the          | What light from yonder |',
      ' breech dear friends         | window breaks          |',
      '-----------------------------|------------------------|',
      ' And sheathed their          | It is the East         |',
      ' swords for lack of argument | and Juliet is the sun  |',
    ].join('\n');

    convert(text, (err, value) => {
      ifError(err);
      eq(value.length, 2);
      deq(value[0], { 'Henry V': 'Once more unto the\nbreech dear friends', 'Romeo and Juliet': 'What light from yonder\nwindow breaks' });
      deq(value[1], { 'Henry V': 'And sheathed their\nswords for lack of argument', 'Romeo and Juliet': 'It is the East\nand Juliet is the sun' });
      done();
    });
  });

  it('Should report indentation errors', (_t, done) => {
    const text = ['left | middle | right', '  1  |2       |   3  '].join('\n');

    convert(text, (err, _value) => {
      ok(err);
      eq(err.message, 'Indentation error');
      done();
    });
  });
});

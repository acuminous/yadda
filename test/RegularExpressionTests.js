const { describe, it } = require('node:test');
const { equal: eq, ok } = require('node:assert');
const RegularExpression = require('../lib/RegularExpression');

describe('RegularExpression', () => {
  it('should base equality on underlying RegExp source', () => {
    ok(new RegularExpression(/abc/).equals(new RegularExpression(/abc/)));
    ok(new RegularExpression('abc').equals(new RegularExpression('abc')));
    ok(new RegularExpression(/abc/).equals(new RegularExpression('abc')));
    ok(new RegularExpression('abc').equals(new RegularExpression(/abc/)));
  });

  it('should provide matching groups', () => {
    const words = new RegularExpression(/(\d+) (\w+)/g);
    const groups = words.groups('1 the 2 quick 3 brown 4 fox');
    eq(groups.length, 8);
    eq(groups[0], '1');
    eq(groups[1], 'the');
    eq(groups[3], 'quick');
  });

  it('should provide multiline', () => {
    const words = new RegularExpression(/text: ([^\u0000]*)/);
    const groups = words.groups('text: 1\n2\n3');
    eq(groups.length, 1);
    eq(groups[0], '1\n2\n3');
  });
});

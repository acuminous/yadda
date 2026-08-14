const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const RegularExpression = require('../lib/RegularExpression');

describe('RegularExpression', () => {
  it('should base equality on underlying RegExp source', () => {
    assert.ok(new RegularExpression(/abc/).equals(new RegularExpression(/abc/)));
    assert.ok(new RegularExpression('abc').equals(new RegularExpression('abc')));
    assert.ok(new RegularExpression(/abc/).equals(new RegularExpression('abc')));
    assert.ok(new RegularExpression('abc').equals(new RegularExpression(/abc/)));
  });

  it('should provide matching groups', () => {
    const words = new RegularExpression(/(\d+) (\w+)/g);
    const groups = words.groups('1 the 2 quick 3 brown 4 fox');
    assert.equal(groups.length, 8);
    assert.equal(groups[0], '1');
    assert.equal(groups[1], 'the');
    assert.equal(groups[3], 'quick');
  });

  it('should provide multiline', () => {
    const words = new RegularExpression(/text: ([^\u0000]*)/);
    const groups = words.groups('text: 1\n2\n3');
    assert.equal(groups.length, 1);
    assert.equal(groups[0], '1\n2\n3');
  });
});

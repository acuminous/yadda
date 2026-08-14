const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const StringUtils = require('../lib/StringUtils');

describe('StringUtils', () => {
  it('should detect blank strings', () => {
    assert.ok(StringUtils.isBlank(''));
    assert.ok(StringUtils.isBlank(' '));
    assert.ok(StringUtils.isNotBlank('x'));
    assert.ok(StringUtils.isNotBlank(' x '));
  });

  it('should return the indentation size', () => {
    assert.equal(StringUtils.indentation(''), 0);
    assert.equal(StringUtils.indentation(' '), 1);
  });
});

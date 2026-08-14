const { describe, it } = require('node:test');
const { equal: eq, ok } = require('node:assert');
const StringUtils = require('../lib/StringUtils');

describe('StringUtils', () => {
  it('should detect blank strings', () => {
    ok(StringUtils.isBlank(''));
    ok(StringUtils.isBlank(' '));
    ok(StringUtils.isNotBlank('x'));
    ok(StringUtils.isNotBlank(' x '));
  });

  it('should return the indentation size', () => {
    eq(StringUtils.indentation(''), 0);
    eq(StringUtils.indentation(' '), 1);
  });
});

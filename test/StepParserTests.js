const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const StepParser = require('../lib/index').parsers.StepParser;

describe('StepParser', () => {
  it('should parse steps', () => {
    const parser = new StepParser();
    const text = ['Given A', '', '   When B   ', '   ', 'Then C'].join('\n');
    const steps = parser.parse(text);

    assert.equal(steps.length, 3);
    assert.equal(steps[0], 'Given A');
    assert.equal(steps[1], '   When B   ');
    assert.equal(steps[2], 'Then C');
  });
});

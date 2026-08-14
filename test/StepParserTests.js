const { describe, it } = require('node:test');
const { equal: eq } = require('node:assert');
const { StepParser } = require('../lib/index').parsers;

describe('StepParser', () => {
  it('should parse steps', () => {
    const parser = new StepParser();
    const text = ['Given A', '', '   When B   ', '   ', 'Then C'].join('\n');
    const steps = parser.parse(text);

    eq(steps.length, 3);
    eq(steps[0], 'Given A');
    eq(steps[1], '   When B   ');
    eq(steps[2], 'Then C');
  });
});

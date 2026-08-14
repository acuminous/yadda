const { describe, it } = require('node:test');
const { ok } = require('node:assert');
const MultiScore = require('../../lib/scores/MultiScore');

describe('MultiScore', () => {
  it('should return true when first sub score wins', () => {
    const m1 = new MultiScore([new SimpleScore(1)]);
    const m2 = new MultiScore([new SimpleScore(0)]);

    ok(m1.compare(m2) > 0);
  });

  it('should return false when first sub score loses', () => {
    const m1 = new MultiScore([new SimpleScore(0)]);
    const m2 = new MultiScore([new SimpleScore(1)]);

    ok(m1.compare(m2) < 0);
  });

  it('should ignore subsequent scores after a win', () => {
    const m1 = new MultiScore([new SimpleScore(1), new SimpleScore(0)]);
    const m2 = new MultiScore([new SimpleScore(0), new SimpleScore(1)]);

    ok(m1.compare(m2) > 0);
  });

  it('should ignore subsequent scores after a loss', () => {
    const m1 = new MultiScore([new SimpleScore(0), new SimpleScore(1)]);
    const m2 = new MultiScore([new SimpleScore(1), new SimpleScore(0)]);

    ok(m1.compare(m2) < 0);
  });

  it('should return true when first sub score draws but second wins', () => {
    const m1 = new MultiScore([new SimpleScore(0), new SimpleScore(1)]);
    const m2 = new MultiScore([new SimpleScore(0), new SimpleScore(0)]);

    ok(m1.compare(m2) > 0);
  });

  function SimpleScore(value) {
    this.value = value;
    this.compare = function (other) {
      return this.value - other.value;
    };
  }
});

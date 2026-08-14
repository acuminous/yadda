const $ = require('../Array');

const MultiScore = function (scores) {
  this.scores = $(scores);
  this.type = 'MultiScore';

  this.compare = function (other) {
    for (let i = 0; i < this.scores.length; i++) {
      const difference = this.scores[i].compare(other.scores[i]);
      if (difference) return difference;
    }
    return 0;
  };

  this.equals = function (other) {
    if (!other) return false;
    if (this.type !== other.type) return false;
    return this.compare(other) === 0;
  };
};

module.exports = MultiScore;

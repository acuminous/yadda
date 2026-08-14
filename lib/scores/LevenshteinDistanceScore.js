// Understands similarity of two strings
const LevenshteinDistanceScore = function (s1, s2) {
  this.value;
  this.type = 'LevenshteinDistanceScore';
  let distance_table;

  const initialise = () => {
    const x = s1.length;
    const y = s2.length;

    distance_table = new Array(x + 1);

    for (let i = 0; i <= x; i++) {
      distance_table[i] = new Array(y + 1);
    }

    for (let i = 0; i <= x; i++) {
      for (let j = 0; j <= y; j++) {
        distance_table[i][j] = 0;
      }
    }

    for (let i = 0; i <= x; i++) {
      distance_table[i][0] = i;
    }

    for (let j = 0; j <= y; j++) {
      distance_table[0][j] = j;
    }
  };

  const score = () => {
    if (s1 === s2) {
      this.value = 0;
      return;
    }

    for (let j = 0; j < s2.length; j++) {
      for (let i = 0; i < s1.length; i++) {
        if (s1[i] === s2[j]) {
          distance_table[i + 1][j + 1] = distance_table[i][j];
        } else {
          const deletion = distance_table[i][j + 1] + 1;
          const insertion = distance_table[i + 1][j] + 1;
          const substitution = distance_table[i][j] + 1;
          distance_table[i + 1][j + 1] = Math.min(substitution, deletion, insertion);
        }
      }
    }
    this.value = distance_table[s1.length][s2.length];
  };

  this.compare = function (other) {
    return other.value - this.value;
  };

  this.equals = function (other) {
    if (!other) return false;
    return this.type === other.type && this.value === other.value;
  };

  initialise();
  score();
};

module.exports = LevenshteinDistanceScore;

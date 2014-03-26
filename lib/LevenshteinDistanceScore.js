// Understands similarity of two strings
var LevenshteinDistanceScore = function(s1, s2) {

    this.value;
    this.type = 'LevenshteinDistanceScore';
    var distance_table;
    var _this = this;

    var initialise = function() {

        var x = s1.length;
        var y = s2.length;

        distance_table = new Array(x + 1);

        for (i = 0; i <= x; i++) {
            distance_table[i] = new Array(y + 1);
        }

        for (var i = 0; i <= x; i++) {
            for (var j = 0; j <= y; j++) {
                distance_table[i][j] = 0;
            }
        }

        for (var i = 0; i <= x; i++) {
            distance_table[i][0] = i;
        }

        for (var j = 0; j <= y; j++) {
            distance_table[0][j] = j;
        }
    };

    var score = function() {

        if (s1 == s2) return _this.value = 0;

        for (var j = 0; j < s2.length; j++) {
            for (var i = 0; i < s1.length; i++) {
                if (s1[i] == s2[j]) {
                    distance_table[i + 1][j + 1] = distance_table[i][j];
                } else {
                    var deletion = distance_table[i][j + 1] + 1;
                    var insertion = distance_table[i + 1][j] + 1;
                    var substitution = distance_table[i][j] + 1;
                    distance_table[i + 1][j + 1] = Math.min(substitution,
                                                          deletion, insertion);
                }
            }
        }
        _this.value = distance_table[s1.length][s2.length];
    };

    this.beats = function(other) {
        return this.value < other.value;
    };

    this.equals = function(other) {
        if (!other) return false;
        return (this.type == other.type && this.value == other.value);
    };

    initialise();
    score();
};

module.exports = LevenshteinDistanceScore;

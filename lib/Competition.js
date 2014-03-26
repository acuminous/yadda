var LevenshteinDistanceScore = require('./LevenshteinDistanceScore');
var $ = require('./Array');

// Understands appropriateness of macros in relation to a specific step
var Competition = function(step, macros) {

    var results = [];

    this.validate = function() {
        if (is_undefined())
            return {step: step, valid: false, reason: 'Undefined Step'};
        if (is_ambiguous())
            return {step: step, valid: false, reason: 'Ambiguous Step (Patterns [' + winning_patterns() + '] are all equally good candidates)'};
        return {step: step, valid: true};
    };

    this.clear_winner = function() {
        if (is_undefined())
            throw new Error('Undefined Step: [' + step + ']');
        if (is_ambiguous())
            throw new Error('Ambiguous Step: [' + step + ']. Patterns [' + winning_patterns() + '] match equally well.');
        return this.winner();
    };

    function is_undefined() {
        return results.length == 0;
    };

    function is_ambiguous() {
        return (results.length > 1) &&
                results[0].score.equals(results[1].score);
    };

    this.winner = function() {
        return results[0].macro;
    };

    function winning_patterns() {
        return results.find_all(by_winning_score)
                      .collect(macro_signatures)
                      .join(', ');
    };

    function rank(step, macros) {
        results = macros
            .collect(function(macro) {
                return {
                    macro: macro,
                    score: new LevenshteinDistanceScore(
                        step, macro.levenshtein_signature())
                };
            })
            .sort(by_ascending_score);
    };

    function by_ascending_score(a, b) {
        return b.score.beats(a.score);
    };

    function by_winning_score(result) {
        return result.score.equals(results[0].score);
    };

    function macro_signatures(result) {
        return result.macro.toString();
    };

    rank(step, $(macros));
};

module.exports = Competition;

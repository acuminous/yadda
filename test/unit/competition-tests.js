module('competition');

test("Competition winner is decided by Levenshtein distance", function() {

    var best_match = new Yadda.Macro('best', /given 1 (.*) patient/);
    var middle_match = new Yadda.Macro('middle', /given (\d+) (.*) patient(?:s{0,1})/);
    var worst_match = new Yadda.Macro('worse', /given (\d+) (.*) (?:patient|patients)/);
    
    var competition = new Yadda.Competition('given 1 male patient', [worst_match, best_match, middle_match]);

    equal(competition.clear_winner().signature, best_match.signature);

});

test("Competitions can have joint winners", function() {

    var best_match = new Yadda.Macro('best', /given 1 (.*) patient/);
    var equal_match = new Yadda.Macro('equal', /given 1 (.+) patient/);

    var competition = new Yadda.Competition('given 1 male patient', [best_match, equal_match]);

    raises(function() {
        competition.clear_winner();
    }, /Ambiguous Step: \[given 1 male patient\]/);
});


test("Competitions can have no winner", function() {

    var competition = new Yadda.Competition('given 1 male patient', []);

    raises(function() {
        competition.clear_winner();
    }, /Undefined Step: \[given 1 male patient\]/);
});
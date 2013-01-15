test('RegularExpression equality is based on underlying RegExp source', function() {
    ok(new Yadda.RegularExpression(/abc/).equals(new Yadda.RegularExpression(/abc/)));
    ok(new Yadda.RegularExpression('abc').equals(new Yadda.RegularExpression('abc')));
    ok(new Yadda.RegularExpression(/abc/).equals(new Yadda.RegularExpression('abc')));
    ok(new Yadda.RegularExpression('abc').equals(new Yadda.RegularExpression(/abc/)));        
});

test('RegularExpression can provide the underlying RegExp source', function() {
    equal(new Yadda.RegularExpression('abc').source, 'abc');
    equal(new Yadda.RegularExpression(/abc/).source, 'abc');
});

test('RegularExpression can iterate over each match, passing the match to a specified function', function() {

    var result = [];
    var words = new Yadda.RegularExpression(/(\w+)/g);

    words.each_match('the quick brown fox', function() {
        result.push(Array.prototype.slice.call(arguments, 0).toString());
    });

    equal(result.length, 4);
    equal(result[0], 'the');
    equal(result[3], 'fox');    
});

test('RegularExpression can iterate over each match, passing the group matches to a specified function', function() {

    var result = [];
    var words = new Yadda.RegularExpression(/(\d+) (\w+)/g);

    words.each_group('1 the 2 quick 3 brown 4 fox', function() {
        result.push(Array.prototype.slice.call(arguments, 0).toString());
    });

    equal(result.length, 4);
    equal(result[0], '1,the');
    equal(result[3], '4,fox');    
})
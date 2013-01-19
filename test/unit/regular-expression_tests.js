test('RegularExpression equality is based on underlying RegExp source', function() {
    ok(new Yadda.RegularExpression(/abc/).equals(new Yadda.RegularExpression(/abc/)));
    ok(new Yadda.RegularExpression('abc').equals(new Yadda.RegularExpression('abc')));
    ok(new Yadda.RegularExpression(/abc/).equals(new Yadda.RegularExpression('abc')));
    ok(new Yadda.RegularExpression('abc').equals(new Yadda.RegularExpression(/abc/)));        
});

test('RegularExpression provides matching groups', function() {

    var words = new Yadda.RegularExpression(/(\d+) (\w+)/g);
    var groups = words.groups('1 the 2 quick 3 brown 4 fox');
    equal(groups.length, 4);
    equal(groups[0], '1,the');
    equal(groups[3], '4,fox');    
})
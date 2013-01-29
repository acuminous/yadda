module('environment');

test("Environment contexts can be merged", function() {
    assert_merge_ctx({a: 1}, undefined, {a: 1});
    assert_merge_ctx({a: 1}, null, {a: 1});
    assert_merge_ctx({a: 1}, {}, {a: 1});
    assert_merge_ctx({a: 1}, {b: 2}, {a: 1, b:2});
    assert_merge_ctx({a: 1}, {a: 2}, {a: 2});
});

test("Environments can be merged", function() {
    same(
        new Yadda.Environment({a: 1}).merge(new Yadda.Environment({b: 2})), 
        new Yadda.Environment({a:1, b: 2})
    );
});

var assert_merge_ctx = function(thing1, thing2, expected) {
    same(new Yadda.Environment(thing1).merge(thing2).ctx, expected);
}
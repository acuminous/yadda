test("Environments can be merged", function() {
    same(new Yadda.Environment({a: 1}).merge().ctx, {a: 1});
    same(new Yadda.Environment({a: 1}).merge(null).ctx, {a: 1});
    same(new Yadda.Environment({a: 1}).merge({}).ctx, {a: 1});
    same(new Yadda.Environment({a: 1}).merge({b: 2}).ctx, {a: 1, b: 2});
    same(new Yadda.Environment({a: 1}).merge({a: 2}).ctx, {a: 1});    
});
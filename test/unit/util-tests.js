module('util');

test('Flattens a nested array', function() {
    same(Yadda.Util.flatten([1, 2, 3]), [1, 2, 3]);
    same(Yadda.Util.flatten([1, [2], 3]), [1, 2, 3]);
    same(Yadda.Util.flatten([1, [[2], 3]]), [1, 2, 3]);
    same(Yadda.Util.flatten([1, [[2], 3]], []), [1, 2, 3]);
})
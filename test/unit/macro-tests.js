module('macro');

var Execution = function() {    
    this.code = function() {      
        execution.executed = true;        
        execution.captureArguments(arguments);        
        execution.ctx = this;
    };
    this.captureArguments = function(args) {
        execution.args = this.toArray(args)
    };

    this.toArray = function(obj) {
        return [].slice.call(obj, 0);        
    };
};

test('Macro can interpret a line of text', function() {

    execution = new Execution();
    args = [1, 2, 3];    

    new Yadda.Macro('Easy', /Easy as (\d), (\d), (\d)/, execution.code, {a: 1}).interpret("Easy as 1, 2, 3", {b: 2});

    ok(execution.executed, "The step code was not run");
    equal(execution.args.toString(), args.toString(), "The step code was not passed the correct arguments");    
    same(execution.ctx, {a: 1, b: 2}, "The step code was not run in the correct context");
});

test('Macro provides a signature that can be used to compare levenshtein distance', function() {

    Yadda.Util.each([
        /the quick brown fox/,
        /the quick.* brown.* fox/,
        /the quick(.*) brown(?:.*) fox/,
        /the quick[xyz] brown[^xyz] fox/,
        /the quick{0,1} brown{1} fox/,
        /the quick\d brown\W fox/
    ], function(signature) {
        equal(new Yadda.Macro('Quick brown fox', signature).levenshtein_signature(), 'the quick brown fox');
    })
});
    
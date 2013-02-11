exports.create = function create(yadda, incoming_casper) {

	var casper = incoming_casper ? incoming_casper : require('casper').create();

    yadda.interpreter.interpret_step = function(step, ctx) {
        var _this = this;
        casper.then(function() {
            casper.test.info(step);
            _this.rank_macros(step).clear_winner().interpret(step, ctx);
        });  
    };

	casper.yadda = function(script, ctx) {
		if (script == undefined) return this;
        yadda.yadda(script, ctx);
	}

    return casper;
};

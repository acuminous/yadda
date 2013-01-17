exports.create = function create(yadda, incoming_casper) {

	var casper = incoming_casper ? incoming_casper : require('casper').create();

    Yadda.Interpreter.interpret = function(scenario, ctx) {
        var _this = this;
        Yadda.Util.ensure_array(scenario).each(function(step) { 
            casper.test.info(step);
            _this.interpret_step(step, ctx);
        });
    };

	casper.yadda = function(script, ctx) {
		if (script == undefined) return this;

    	this.then(function() {
    		yadda.yadda(script, ctx);
		});
	}

    return casper;
};

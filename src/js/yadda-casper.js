exports.create = function create(yadda, incoming_casper) {

	var casper = incoming_casper ? incoming_casper : require('casper').create();

	casper.yadda = function(script) {
		if (script == undefined) return this;

	    Yadda.Interpreter.interpret = function(scenario, ctx) {
	        Yadda.Util.ensure_array(scenario).each(function(step) { 
				casper.test.info(step);
	            _this.interpret_step(step, ctx);
	        });
	    };

    	this.then(function() {
    		yadda.yadda(script);
		});
	}

    return casper;
};

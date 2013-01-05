exports.create = function create(steps, incoming_casper) {

	var casper = incoming_casper ? incoming_casper : require('casper').create();

	casper.yadda = function(text) {
		if (text == undefined) {
			return this;
		} else if (text.constructor.toString().indexOf("Array") != -1) {
	    	for (var i = 0; i < text.length; i++) {
	    		this.yadda(text[i]);
	    	}
	    } else {
	    	this.then(function() {
				steps.runStep(text);
			});
	    }
	}

    return casper;
};
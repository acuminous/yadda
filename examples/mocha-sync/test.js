var Yadda = require('yadda');
Yadda.plugins.mocha({ mode: 'sync'});

feature('./features/bottles.feature', function(feature) {

	var library = require('./bottles-library');
	var yadda = new Yadda.Yadda(library);

	scenarios(feature.scenarios, function(scenario) {
		yadda.yadda(scenario.steps);
	});
});
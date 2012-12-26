var shared = { executions: {}};
var steps = new Steps()

.given('a new Yadda instance', function() {
	shared.yadda = new Yadda();	
})

.when("(?:Dirk adds|adds) (?:a|another) test step, '(.+)'", function(template) {
	shared.executions[template] = 0;
	shared.yadda.steps.addStep(template, function() {
		shared.executions[template]++;
	});
})

.then("(?:Dirk|he) is prevented from adding a conflicting test step, '(.+)'", function(template) {
	var existing = shared.yadda.steps.findStep(template);
	try {		
		shared.yadda.steps.addStep(template, function() {});
	 	throw "Conflicting step was not reported";
	} catch (e) {
		ok(e == "[" + template + "]" + " conflicts with " + "[" + existing.template + "]", "Unexpected error : " + e);
	}
})

.when("(?:Dirk runs|runs) '(.+)'", function(text) {
	shared.yadda.steps.runStep(text);
})

.then("'(.+)' is executed (\\d) time(?:s)?", function(text, number) {
	var step = shared.yadda.steps.findStep(text);
	ok(shared.executions[step.template] == number);
})

.then("(?:Dirk|he) is prevented from running an ambiguous test step, '(.+)'", function(text) {
	try {
		shared.yadda.steps.runStep(text);
		throw "Ambiguous step was not reported";
	} catch (e) {
		ok(e.match("Unable to determine which of .+ or .+ is more likely for \\[" + text + "]"));
	}
})

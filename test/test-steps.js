var shared = { executions: {}};
var steps = new Steps()

.given('a new Yadda instance', function() {
	shared.yadda = new Yadda();	
})

.when("(?:Dirk adds|adds) (?:a|another) test step, '(.+)'", function(template) {
	shared.executions[template] = [];
	shared.yadda.steps.addStep(template, function() {
		var executions = shared.executions[template];
		executions[executions.length] = arguments;
	});
})

.then("(?:Dirk|he) is prevented from adding a conflicting test step, '(.+)'", function(template) {
	var existing = shared.yadda.steps.steps[template];
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

.then("'(.+)' is executed (\\d) time(?:s)?", function(template, number) {
	ok(shared.executions[template].length == number);
})

.then("(?:Dirk|he) is prevented from running an ambiguous test step, '(.+)'", function(text) {
	try {
		shared.yadda.steps.runStep(text);
		throw "Ambiguous step was not reported";
	} catch (e) {
		ok(e.match("Unable to determine which of .+ or .+ is more likely for \\[" + text + "]"));
	}
})

.then ("'(.+)' is invoked with arguments (\\d+) and (\\d+)", function(template, arg1, arg2) {
	var executions = shared.executions[template];
	ok(executions.length > 0);

	var lastExecution = executions[executions.length - 1];
	ok(lastExecution.length == 2);
	ok(lastExecution[0] == arg1);
	ok(lastExecution[1] == arg2);
})

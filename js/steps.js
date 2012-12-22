var stepHolder = new StepHolder();

stepHolder.addStep("Stand up", function() {
	console.log("Stand up");
})

.addStep("Sit down", function() {
	console.log("Sit down");
})

.addStep("Stand up (\\d+) times", function(number) {
	for (var i = 1; i <= number; i++) {
		console.log("Stand up " + i);
	}
})

.addStep("Sit down a number of times", function() {
	for (var i = 1; i <= this.number; i++) {
		console.log("Sit down " + i);
	}
}, {number: 10})

.addStep("(Jump|Shout) (\\d+) times", function(action, number) {
	for (var i = 1; i <= number; i++) {		
		console.log(action + " " + i);
	}	
})

.addStep("Dance (\\d+) time(?:s?)", function(number) {
	for (var i = 1; i <= number; i++) {
		console.log("Dance " + i);
	}
})

.addStep(["Sing (\\d+) time(?:s?)", "Sing (\\d+) more time(?:s{0,1})"], function(number) {
	for (var i = 1; i <= number; i++) {
		console.log("Sing " + i);
	}
})
;
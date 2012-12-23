var steps = new Steps();

steps.addStep("Stand up", function() {
	document.write("<li>Stand up</li>");
})

.addStep("Sit down", function() {
	document.write("<li>Sit down</li>");
})

.addStep("Stand up (\\d+) times", function(number) {
	for (var i = 1; i <= number; i++) {
		document.write("<li>Stand up " + i + "</li>");
	}
})

.addStep("Sit down a number of times", function() {
	for (var i = 1; i <= this.number; i++) {
		document.write("<li>Sit down " + i + "</li>");
	}
}, {number: 10})

.addStep("(Jump|Shout) (\\d+) times", function(action, number) {
	for (var i = 1; i <= number; i++) {		
		document.write("<li>" + action + " " + i + "</li>");
	}	
})

.addStep("Dance (\\d+) time(?:s?)", function(number) {
	for (var i = 1; i <= number; i++) {
		document.write("<li>Dance " + i + "</li>");
	}
})

.addStep(["Sing (\\d+) time(?:s?)", "Sing (\\d+) more time(?:s{0,1})"], function(number) {
	for (var i = 1; i <= number; i++) {
		document.write("<li>Sing " + i + "</li>");
	}
})
;
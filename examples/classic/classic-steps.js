var steps = new Steps()

.given("that I like repetitive, mechanical test specifications", function() {
	document.write("<li>Mmmm, mechanical</li>");
})

.when("I use given, when, or then", function() {
	document.write("<li>Given, when then baby</li>");
})

.then("anyone reading the specification will start to doze", function() {
	document.write("<li>Yawn</li>");
})

.then("probably fall asleep", function() {
	document.write("<li>Time for some shut eye</li>");
})

.then("hopefully not snore", function() {
	document.write("<li>Zzzzzz</li>");
});

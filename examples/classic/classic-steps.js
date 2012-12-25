var steps = new Steps()

.given("that I like repetitive, mechanical test specifications", function() {
	document.write("<li>Yawn</li>");
})

.when("I use given, when, or then instead of addStep", function() {
	document.write("<li>Stretch</li>");
})

.then("anyone reading the specification will fall asleep", function() {
	document.write("<li>Zzzzz</li>");
})

.then("probably fall off their chair", function() {
	document.write("<li>Bump</li>");
})

.then("not wake up", function() {
	document.write("<li>Snore</li>");
});

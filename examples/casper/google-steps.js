exports.create = function create() {
	return steps;
}

require('../../src/js/yadda');

steps = new Steps();

steps.addStep("When I open Google's (.+) search page", function(locale) {
	casper.open("http://www.google." + locale + "/");
})

.addStep("(?:then|and) the title is (.+)", function(title) {
	casper.test.assertTitle(title, 'title is the one expected');
})

.addStep("(?:then|and) the (.+) form exists", function(action) {
	casper.test.assertExists('form[action="/' + action + '"]', 'form is found');
})

.addStep("When I search for (.+)", function(term) {
	casper.fill('form[action="/search"]', {
		q: term
	}, true);
})

.addStep("(?:then|and) the search for (.+) was made", function(term) {
	var regex = new RegExp('q=' + term)
	casper.test.assertUrlMatch(regex, 'search term has been submitted');
})

.addStep("(?:then|and) (\\d+) or more results were returned", function(number) {
    casper.test.assertEval(function() {
        return __utils__.findAll('h3.r').length >= number;
    }, 'google search retrieves ' + number + ' or more results');		
});
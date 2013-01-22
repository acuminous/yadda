exports.create = function() {
	return library;
}

var dictionary = new Yadda.Dictionary()
    .define('LOCALE', /(fr|es)/)
    .define('NUM', /(\d+)/);

var library = new Yadda.Library.English(dictionary)

.when("I open Google's $LOCALE search page", function(locale) {    
	casper.open("http://www.google." + locale + "/");
})

.then("the title is $TITLE", function(title) {
	casper.test.assertTitle(title, 'title is the one expected');
})

.then("the $ACTION form exists", function(action) {
	casper.test.assertExists('form[action="/' + action + '"]', 'form is found');
})

.when("I search for $TERM", function(term) {
	casper.fill('form[action="/search"]', { q: term }, true);
})

.then("the search for $TERM was made", function(term) {
	var regex = new RegExp('q=' + term)
	casper.test.assertUrlMatch(regex, 'search term has been submitted');
})

.then("$NUM or more results were returned", function(number) {
    casper.test.assertEval(function(number) {
        return __utils__.findAll('h3.r').length >= number;
    }, 'google search retrieves ' + number + ' or more results', [number]);		
});
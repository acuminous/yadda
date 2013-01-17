require('../../src/js/yadda-0.2.0');
require('../../src/js/yadda-0.2.0-localisation');

var library = require('./google-library').create();
var yadda = new Yadda.yadda(library);
var casper = require('../../src/js/yadda-0.2.0-casper').create(new Yadda.yadda(library));

casper.start();

casper.yadda([
	"When I open Google's fr search page",
	"then the title is Google",
	"and the search form exists",

	"When I search for foo",
	"then the title is foo - Google Search",
	"and the search for foo was made",
	"and 10 or more results were returned"
]);

casper.run(function() {
    this.test.done(5);
    this.test.renderResults(true);
});
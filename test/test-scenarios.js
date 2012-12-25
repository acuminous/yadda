var yadda = new Yadda(steps);

test('Developer adds and runs a test step', function() {
	yadda.yadda([
	    "Given a new Yadda instance",
	    "when Dirk adds a new test step, 'Blah blah blah'",
	    "and runs 'Blah blah blah'",
	    "then 'Blah blah blah' is executed 1 time"
    ])
});

test('Developer adds a conflicting literal step', function() {
	yadda.yadda([
		"Given a new Yadda instance",
		"when Dirk adds a new test step, 'Blah blah blah'",
		"then he is prevented from adding a conflicting test step, 'Blah blah blah'"
	])
});

test('Developer adds a conflicting regex step', function() {
	yadda.yadda([
		"Given a new Yadda instance",
		"when Dirk adds a new test step, 'Blah (.+) blah'",
		"then he is prevented from adding a conflicting test step, 'Blah (.+) blah'"
	])
});

test('Developer runs an ambiguous step', function() {
	yadda.yadda([
		"Given a new Yadda instance",
		"when Dirk adds a new test step, 'Blah (.+) blah'",
		"and adds a new test step, 'Blah (.*) blah'",
		"then he is prevented from running an ambiguous test step, 'Blah blah blah'"
	])
});


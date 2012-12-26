var yadda = new Yadda(steps);

test('Developer runs a test step', function() {
	yadda.yadda([
	    "Given a new Yadda instance",
	    "when Dirk adds a test step, 'Blah blah blah'",
	    "and runs 'Blah blah blah'",
	    "then 'Blah blah blah' is executed 1 time"
    ])
});

test('Developer adds a conflicting literal test step', function() {
	yadda.yadda([
		"Given a new Yadda instance",
		"when Dirk adds a test step, 'Blah blah blah'",
		"then he is prevented from adding a conflicting test step, 'Blah blah blah'"
	])
});

test('Developer adds a conflicting regex test step', function() {
	yadda.yadda([
		"Given a new Yadda instance",
		"when Dirk adds a test step, 'Blah (.+) blah'",
		"then he is prevented from adding a conflicting test step, 'Blah (.+) blah'"
	])
});

test('Developer attempts to runs a test step with an ambiguous template, where a best match cannot be determined', function() {
	yadda.yadda([
		"Given a new Yadda instance",
		"when Dirk adds a test step, 'Blah (.+) blah'",
		"and adds another test step, 'Blah (.*) blah'",
		"then he is prevented from running an ambiguous test step, 'Blah blah blah'"
	])
});

test('Developer runs a test step with an ambiguous template, where a best match can be determined', function() {
	yadda.yadda([
		"Given a new Yadda instance",
		"when Dirk adds a test step, 'Given pirate (.+) parrot has green feathers'",
		"and adds another test step, 'Given pirate (.+) old parrot has green feathers'",
		"and runs 'Given pirate Rob\'s parrot has green feathers'",
		"then 'Given pirate (.+) parrot has green feathers' is executed 1 time",		
		"but when Dirk runs 'Given pirate Rob\'s old parrot has green feathers' is run'",
		"then 'Given pirate (.+) old parrot has green feathers' is executed 1 time"
	])
});

// Literals
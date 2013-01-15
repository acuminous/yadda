var library = new Library();

.given("(\\d+) green bottles are standing on the wall", function(bottles) {
	wall = new Wall(bottles);
})

.when("one green bottle should accidentally fall", function() {	
    wall.dropBottle();
})

.when("one too many green bottles should accidentally fall", function(i) {	
    throws(function() {
        wall.dropBottle();
    }, function(e) {
        error = e
        return true;
    })
})

.then("there are (\\d+) green bottles standing on the wall", function(bottles) {
    ok(wall.bottles == bottles, bottles + " green bottles left");
})

.then("an insufficient bottles error is raised", function() {
    ok(error == "Insufficient bottles");
})

.then("Donnie Darko receives a visit from a very scary rabbit", function() {
    // not really
})

var Wall = function(bottles) {
    this.bottles = bottles;
    this.dropBottle = function() {
        if (this.bottles > 0) {
            this.bottles--;
        } else {
            throw "Insufficient bottles";
        }
    }
}

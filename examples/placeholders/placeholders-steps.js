var steps = new Steps({prefix: '$'})

.addStep("$number is the magic number", function(number) {
    document.write("<li>" + number + " is the magic number</li>");
})
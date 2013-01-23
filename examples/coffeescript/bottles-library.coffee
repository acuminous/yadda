exports.create = -> library

wall = null;

dictionary = new Yadda.Dictionary()
    .define('NUM', /(\d+)/)
    .define('ANOTHER', /(1)/)

library = new Yadda.Library.English(dictionary)

.given "$NUM green bottles are standing on the wall", (number_of_bottles) ->
    wall = new Wall number_of_bottles

.when "$NUM green bottle accidentally falls", (number_of_falling_bottles) ->
    wall.fall number_of_falling_bottles
    return

.when "another green bottle accidentally falls", -> 
    wall.fall 1
    return

.when "bounces back", -> 
    wall.returned 1 
    return

.given "a loud bang", ->
    return # no op

.then "there (?:are|are still) $NUM green bottles standing on the wall", (number_of_bottles) ->
    this.equal number_of_bottles, wall.bottles
    return

Wall = (bottles) ->
    this.bottles = bottles

    this.fall = (n) ->
        this.bottles -= n
        return

    this.returned = () ->
        this.bottles++
        return

    return
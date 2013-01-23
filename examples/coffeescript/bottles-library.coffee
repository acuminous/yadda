exports.create = -> library

wall = null;

dictionary = new Yadda.Dictionary()
    .define('NUM', /(\d+)/)
    .define('ANOTHER', /(1)/)

library = new Yadda.Library.English(dictionary)

.given "$NUM green bottles are standing on the wall", (number_of_bottles) ->
    wall = new Wall number_of_bottles

.when "$NUM green bottle accidentally falls", (number_of_falling_bottles) ->
    wall.lose number_of_falling_bottles

.when "another green bottle accidentally falls", -> 
    wall.lose 1

.when "bounces back", -> 
    wall.add 1 

.given "a loud bang", ->
    return

.then "there (?:are|are still) $NUM green bottles standing on the wall", (number_of_bottles) ->
    this.equal number_of_bottles, wall.bottles

Wall = (bottles) ->
    this.bottles = bottles

    this.lose = (n) ->
        this.bottles -= n
        return

    this.add = () ->
        this.bottles++
        return

    return
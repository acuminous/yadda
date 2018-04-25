Feature: Mocha Asynchronous Thenable Example Using Cups

Background:

    Given a 6 foot wall

Scenario: A cup falls from the wall

    Given 100 green cups are standing on the wall
    when 1 green cup accidentally falls
    then there are 99 green cups standing on the wall

Scenario: No cups are left

    Given 1 green cups are standing on the wall
    when 1 green cup accidentally falls
    then there are 0 green cups standing on the wall

@Todo
Scenario: Bottles are reset

    Given there are no green cups
    when 5 minutes has elapsed
    then there are 100 green cups standing on the wall

Scenario: [N] cups are standing on a wall

    Given [N] green cups are standing on the wall
    when 1 green cup accidentally falls
    then there are [N-1] green cups standing on the wall

    Where:
        N   | N-1
        100 | 99
        99  | 98
        10  | 9

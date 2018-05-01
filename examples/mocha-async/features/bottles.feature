Feature: Mocha Asynchronous Example

Background:

    Given a 6 foot wall

Scenario: A bottle falls from the wall

    Given 100 green bottles are standing on the wall
    when 1 green bottle accidentally falls
    then there are 99 green bottles standing on the wall

Scenario: No bottles are left

    Given 1 green bottles are standing on the wall
    when 1 green bottle accidentally falls
    then there are 0 green bottles standing on the wall

@Todo
Scenario: Bottles are reset

    Given there are no green bottles
    when 5 minutes has elapsed
    then there are 100 green bottles standing on the wall

Scenario: [N] bottles are standing on a wall

    Given [N] green bottles are standing on the wall
    when 1 green bottle accidentally falls
    then there are [N-1] green bottles standing on the wall
    and this test should be skipped

    Where:
        N   | N-1
        100 | 99
        99  | 98
        10  | 9

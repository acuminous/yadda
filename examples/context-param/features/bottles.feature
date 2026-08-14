Feature: Context as a step argument

Scenario: Steps receive the context as their first argument

    Given a wall with 100 green bottles
    When 1 green bottle accidentally falls
    Then there are 99 green bottles standing on the wall

Scenario: A step can skip itself at runtime

    Given the bottle supplier is unavailable
    Then the delivery is recorded

Scenario: A bottle falls from the wall

    Given 100 green bottles are standing on the wall
    when 1 green bottle accidentally falls
    then there are 99 green bottles standing on the wall


Scenario: Another bottle falls from the wall

    Given 99 green bottles are standing on the wall
    when 1 green bottle accidentally falls
    then there are 98 green bottles standing on the wall
Feature: Green Bottles

Scenario: A bottle falls from the wall

    Given I open the green bottles page
    When I specify 100 bottles
    And I specify 1 fallen
    And I update the wall
    Then there are 99 green bottles standing on the wall

Scenario: Several bottles fall from the wall

    Given I open the green bottles page
    When I specify 100 bottles
    And I specify 10 fallen
    And I update the wall
    Then there are 90 green bottles standing on the wall

Scenario: No bottles are left

    Given I open the green bottles page
    When I specify 1 bottles
    And I specify 1 fallen
    And I update the wall
    Then there are 0 green bottles standing on the wall

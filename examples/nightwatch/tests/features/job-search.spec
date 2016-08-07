Feature: Job Search

Scenario: Search for a job from search bar

    When I view the jobs home page
    And search for "teacher of mathematics"
    Then I should be shown the search results page
    containing a list of at least 3 jobs

Scenario: Displays a friendly message when no results are found

    When I view the jobs home page
    And search for "something that does not exist"
    Then I should be shown the search results page
    But be informed that there are no results

Scenario: Search for a job from the search page

    When I view the jobs search page
    And I filter by London teaching jobs
    Then I should be shown the search results page
    containing a list of at least 3 jobs

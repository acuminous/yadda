Feature: Multilingual Google Search

Scenario: Searching Google For The First Time

    When I open Google's fr search page
    then the title is Google
    and the search form exists

    When I search for foo
    then the title is foo - Recherche Google
    and the search for foo was made
    and 5 or more results were returned

Scenario: Searching Google Again

    When I open Google's ie search page
    then the title is Google
    and the search form exists

    When I search for bar
    then the title is bar - Google Search
    and the search for bar was made
    and 5 or more results were returned  
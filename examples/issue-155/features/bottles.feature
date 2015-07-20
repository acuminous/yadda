Feature: ACCESS THE INTERWEBZ AND DO A SEARCH
As an internet enabled individual I can
search for at least two things via an
internet search mechanism.

Background:

    Given I visit http://www.duckduckgo.com

Scenario: DuckDuckGo Search for [Type]

    When I type in [Type]
    And I click search
    Then '[Expected]' exists in the page

    Where:
        Type | Expected
        nightwatch | Night Watch
        bower | bower.io
@wip
        nightwatch | Night Watch
@wip
        bower | bower.io
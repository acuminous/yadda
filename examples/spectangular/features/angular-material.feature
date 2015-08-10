Feature: Demo Bottom Sheet

    Scenario: Show as list

        Given a list of actions
        ----
        share
        upload
        copy
        print this page
        ----

        When I click on Show as list
        Then the list actions are shown

    Scenario: Show as grid

        Given a list of actions
        ----
        hangout
        mail
        message
        copy
        facebook
        twitter
        ----

        When I click on Show as grid
        Then the grid actions are shown


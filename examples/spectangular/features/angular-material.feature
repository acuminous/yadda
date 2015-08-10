Feature: Multilingual Google Search

Scenario: Demo of the bottom sheet

    Given a table of actions
    ------------
    list | grid
    share,upload,copy,print this page | hangout,mail,message,copy,facebook,twitter
    ------------

    When I open Show as list
    Then the list actions are shown

    When I open Shows as grid
    Then the grid actions are shown


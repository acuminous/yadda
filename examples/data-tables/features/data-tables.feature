Scenario: List

    Given a list of integers
    ----
    1000
    2022
    9405
    ----

    Then the total should be 12427


Scenario: Simple Table

    Given a table of data

    ------------
    left | right
    1    | 3
    2    | 4
    ------------

    Then the left total should be 3
    And the right total should be 7


@Pending
Scenario: Multiline Table

    Given some Shakespeare

    -----------------------------------------------------
    Henry V                     | Romeo and Juliet
    ----------------------------|------------------------
    Once more unto the          | What light from yonder
    breech dear friends         | window breaks
    ----------------------------|------------------------
    And sheathed their          | It is the East
    swords for lack of argument | and Juliet is the sun
    -----------------------------------------------------

    Then the Henry V extract should have 14 words
    And the Romeo and Juliet extract should have 15 words
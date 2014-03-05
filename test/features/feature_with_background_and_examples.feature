Feature: Simple Feature With Examples

Background:

    BG [letter][number]

Scenario: Scenario 1

    Step [letter][number]

    Examples:
        nth    | letter | number
        First  | A      | 1
        Second | B      | 2

Scenario: Scenario 2

    Step [number][letter]

    Examples:
        nth    | letter | number
        First  | X      | 3
        Second | Y      | 4    
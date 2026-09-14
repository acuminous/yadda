@feature-level
@issue=1234
Feature: Shopping cart

As a shopper
I want to manage items in my cart
So that I can buy the things I want.

Background: a logged-in shopper

Given I am logged in as "alice"
And my cart is empty

Rule: items can be added and removed

Rules group related scenarios. This paragraph is the rule description.

@happy-path
Scenario: adding a single item

Given the catalogue contains "Widget" priced at 9.99
When I add "Widget" to my cart
Then my cart total should be 9.99

@data-table
Scenario: restocking products

Given the following stock levels:
---
product | stock
Widget  | 3
Gadget  | 0
---
Then "Widget" should be in stock

Scenario Outline: applying discount codes

Given the catalogue contains "Widget" priced at 100.00
When I apply the discount code "[code]"
Then my cart total should be [expected]

Examples:

code    | expected
HALFOFF | 50.00
TENOFF  | 90.00
NONE    | 100.00

@pending
Scenario: emptying the cart

Given a cart with 3 items
When I empty my cart
Then my cart total should be 0.00

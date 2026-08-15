<!--
  This is a hidden comment: an HTML comment block that a markdown viewer
  does NOT render. Use it for editor notes you don't want readers to see.
  Every construct below is exercised by examples/markdown/library.js.
-->

> **Note:** This is a *visible* comment. Blockquotes render as callouts on
> GitHub but are never treated as steps or titles, so they're the way to
> leave notes readers should actually see.

@layer=example
@issue=344

# Feature: Shopping cart

As a shopper
I want to manage items in my cart
So that I can buy the things I want.

This paragraph (not a list item) is part of the feature description.
Prose comparisons like a &lt; b &amp;&amp; b &gt; c render naturally and are entity-decoded.

## Background: a logged-in shopper

- Given I am logged in as "alice"
- And my cart is empty

## Rule: items can be added and priced

Rules group related scenarios. This paragraph is the rule description.

@happy-path
### Scenario: adding a single item

> A blockquote comment *inside* a scenario. Plain prose here would be
> parsed as an undefined step, but a blockquote is safely ignored.

- Given the catalogue contains "Widget" priced at 9.99
- When I add "Widget" to my cart
- Then my cart total should be 9.99

### Scenario: importing a product from a JSON doc-string

- Given the following product is imported:

  ```json
  {
    "sku": "GADGET-1",
    "name": "Gadget",
    "price": 19.99
  }
  ```

- Then the catalogue should contain "Gadget"

## Scenario Outline: applying discount codes

- Given the catalogue contains "Widget" priced at 100.00
- When I apply the discount code "[code]"
- Then my cart total should be [expected]

### Examples:

| code    | expected |
|---------|----------|
| HALFOFF | 50.00    |
| TENOFF  | 90.00    |
| NONE    | 100.00   |

## Scenario: entities are decoded in prose but verbatim in doc-strings

- Given a note that says "5 &lt; 10 &amp; done"
- Then the note should read "5 < 10 & done"
- Given the following markup:

  ```html
  <p>a &lt; b</p>
  ```

- Then the stored markup should contain a literal entity

@pending
## Scenario: not yet implemented

- Given a feature that does not exist
- Then it should be skipped, not run

# Feature: Doc strings

## Scenario: a step with a fenced doc-string

- Given the following product is imported:

  ```json
  {
    "sku": "WIDGET-1",
    "price": 9.99
  }
  ```

- Then the catalogue should contain "Widget"

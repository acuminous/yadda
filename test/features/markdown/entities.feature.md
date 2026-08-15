# Feature: Entities

Comparisons like a &lt; b &amp;&amp; b &gt; c belong in the description.

## Scenario: entities are decoded in prose

- Given a value of 5 &amp; a threshold of 10
- Then 5 &lt; 10 should be true
- And the label should read &quot;done&quot;

## Scenario: entities are verbatim in doc-strings

- Given the following markup:

  ```html
  <p>a &lt; b</p>
  ```

- Then it should not be decoded

# Yadda Best Practices

Yadda is designed to let executable specifications read like natural descriptions of business behaviour. These guidelines are divided into two parts: writing features and scenarios, which concerns how behaviour is expressed, and implementing Yadda, which concerns the automation that makes those specifications executable.

There is deliberate overlap between them. Good implementation techniques exist partly to make better specifications possible, so the relevant rules link between the two sections.

# Writing Features and Scenarios

## Rule 1: Simplicity above all

The most important principle is simplicity, in the sense described by John Maeda in *The Laws of Simplicity*:

> “Simplicity is about subtracting the obvious, and adding the meaningful.”

Simplicity does not mean making scenarios as short as possible. It means thoughtfully removing noise so that the important behaviour stands out. Remove repetition, unnecessary setup, implementation detail and obvious statements where they do not contribute to understanding. Conversely, do not remove information merely to make a scenario shorter. If something matters to understanding the behaviour, make it visible.

The rest of these guidelines largely follow from this principle.

## Rule 2: Speak the language of the business

Features, scenarios and steps should use the natural language of the business domain. Avoid technical terminology and implementation details unless they are themselves meaningful business concepts. For example:

```feature
Then they are told that the wine is unavailable
```

is preferable to:

```feature
Then the API responds with a 404
```

when the behaviour being specified is whether a customer can order a particular wine.

The same principle applies to outcomes and assertions. Describe what happened in business terms rather than exposing HTTP responses, database columns, internal objects or other implementation details. Technical language is entirely appropriate when the technical behaviour itself is what you are specifying.

## Rule 3: Imagine the business without the software

A useful way to find natural business language is to imagine that the software does not exist. Ask how the same transaction would happen between people dealing directly with one another and with physical things. For example, imagine a customer in a restaurant:

```feature
When the customer requests the wine list
And asks for the Sancerre "Les Baronnes" 2023
```

Both steps remain perfectly natural if the customer is speaking to a waiter rather than interacting with software. By contrast:

```feature
When the client fetches the wine list
And sends a request for wine 2847
```

describes the software implementation.

A word does not become technical merely because software also uses it. `Request`, for example, works perfectly well here because requesting a wine list is a natural business interaction. The test is whether the language still makes sense when the computers are removed.

## Rule 4: Make the automation fit the language

Never make the business language awkward merely because it makes the automation easier to implement. Yadda provides mechanisms specifically intended to let the implementation accommodate natural language, so use them. Steps should be grammatically correct, and if natural English requires several variations of a sentence, support those variations rather than requiring unnatural grammar. Similarly, do not invent strange phrasing simply because it makes a regular expression easier to write or allows an existing step definition to be reused.

The feature is the specification. Implementation complexity belongs below it. See [Rule 4: Prefer dictionaries to regular expressions](#rule-4-prefer-dictionaries-to-regular-expressions) and [Rule 7: Support natural grammar](#rule-7-support-natural-grammar) for implementation techniques that help preserve natural feature language.

## Rule 5: Make scenarios interesting

The main happy path matters, but it is often the most obvious behaviour. A useful specification explores what happens around that path: alternative happy paths, boundary conditions, edge cases, validation rules, error conditions and interactions between business rules.

For example, confirming that an available bottle can be ordered is necessary but unsurprising. More interesting behaviour occurs when the customer's first choice is unavailable:

```feature
Scenario: An alternative is offered when a wine has sold out

    Given an extensive wine list
    And the Sancerre "Les Baronnes" 2023 has sold out
    And Pouilly-Fumé "La Moynerie" 2023 is the closest alternative

    When the customer requests the wine list
    And asks for the Sancerre "Les Baronnes" 2023

    Then they are told that it is unavailable
    And offered the Pouilly-Fumé "La Moynerie" 2023
```

This is an alternative happy path. The customer's original request cannot be fulfilled, but the business still provides useful behaviour. A scenario should also centre on one coherent behavioural idea. It may contain several assertions where necessary to demonstrate that behaviour, but avoid turning it into a tour through unrelated functionality.

## Rule 6: Prefer concrete examples

BDD works best when business rules are demonstrated through concrete examples rather than merely restated. The wine scenario above does not say:

```feature
Given a wine is unavailable
And another wine is a suitable alternative
```

It identifies particular wines. Concrete examples make scenarios easier to reason about and expose assumptions that abstract statements can conceal. Use realistic names and values where they improve comprehension, and avoid arbitrary test terminology such as `item1`, `userA` and `value2` when a meaningful example would be clearer.

Realism is not a goal in itself, however. Details that do not contribute to understanding the behaviour are noise. This is another application of [Rule 1: Simplicity above all](#rule-1-simplicity-above-all).

## Rule 7: Keep important values visible

Values that matter to the behaviour should normally appear explicitly in the scenario. Notice that the wine scenario establishes:

```feature
And Pouilly-Fumé "La Moynerie" 2023 is the closest alternative
```

and later asserts:

```feature
And offered the Pouilly-Fumé "La Moynerie" 2023
```

The expectation is visible. The reader does not need to know that some hidden fixture happens to define that wine as the closest alternative, at least in this scenario. Avoid magical values that exist only inside the step implementation.

There is an important exception when the setup itself is large. For example:

```feature
Given an extensive wine list
```

might establish dozens or hundreds of wines, including their vintages, prices, regions, availability and relationships to suitable alternatives. Making all of that data explicit would add noise rather than meaning.

Use meaningful named datasets for this kind of setup, but make the values actually being tested explicit. Named datasets should provide context, not hidden expectations.

## Rule 8: Structure features around behaviour

Use features and rules to organise related behaviour rather than allowing a feature to become a long collection of loosely related scenarios. A feature can contain scenarios directly and can also contain rules. Rules can group scenarios describing a particular business rule and can have their own backgrounds. For example:

```feature
Feature: Ordering wine

    Rule: Wine availability
        ...

    Rule: Alternative recommendations
        ...

    Rule: Age restrictions
        ...
```

Use this hierarchy when the behaviour naturally divides into meaningful groups. Names are part of the specification too. `Scenario: Unavailable wine 1` says very little, whereas `Scenario: An alternative is offered when a wine has sold out` identifies the behaviour that makes the example interesting. A reader scanning only the feature, rule and scenario headings should still get a useful overview of the behaviour being specified.

## Rule 9: Use backgrounds to remove common setup

Backgrounds are a useful way to subtract repeated setup from scenarios. A feature background can establish context common to the feature, while a rule background can establish context shared only by the scenarios within that rule. For example:

```feature
Feature: Ordering wine

    Background:
        Given an extensive wine list

    Rule: Alternative recommendations

        Background:
            Given alternative recommendations are enabled

        Scenario: An alternative is offered when a wine has sold out
            ...
```

Put common setup at the narrowest appropriate level. Do not move setup into a background merely to make scenarios shorter: a background should represent genuine shared context. If understanding a scenario requires repeatedly looking elsewhere to discover important values, the abstraction has probably removed meaning rather than noise.

## Rule 10: Use tables to express variations

When several examples demonstrate the same behaviour using different values, avoid repeating almost identical scenarios. Use an Examples or Where table to make the common behaviour visible and emphasise what varies. For example:

```feature
Scenario: An alternative is offered when a wine has sold out

    Given an extensive wine list
    And $requestedWine has sold out
    And $alternativeWine is the closest alternative

    When the customer requests the wine list
    And asks for $requestedWine

    Then they are told that it is unavailable
    And offered $alternativeWine

    Where:
        requestedWine                 | alternativeWine
        Sancerre "Les Baronnes" 2023 | Pouilly-Fumé "La Moynerie" 2023
        ...                           | ...
```

The scenario describes the behaviour once and the table contains the examples. This is another application of simplicity: subtract the repetitive structure and emphasise the meaningful differences.

## Rule 11: Use Yadda's feature syntax expressively

Yadda does not require every step to begin with `Given`, `When` or `Then`, but that does not mean you should avoid them. They are useful when they make the scenario read naturally, as they do in many of the examples above. The important point is not to be constrained by them. Use `Given`, `When`, `Then`, `And`, `But`, bullet points or ordinary sentences according to what communicates the behaviour most naturally.

For example, a list may sometimes be clearer than a sequence of artificial `And` steps:

```feature
Given the wine list includes:

    - Sancerre "Les Baronnes" 2023
    - Pouilly-Fumé "La Moynerie" 2023
    - Chablis "Saint Martin" 2022
```

Yadda also supports multiline content associated with the preceding step, including tables, CSV, code blocks, structured text and even ASCII diagrams. These can be useful when complicated input or an assertion is clearer as a single structured block than as many individual steps. Use them selectively because they usually require additional parsing in the implementation, so the improvement in readability should justify that complexity.

## Rule 12: Refactor the specification continuously

Features are not finished merely because they execute. As the specification grows, better language and better abstractions will emerge, so regularly look for repetitive scenarios, duplicated steps, inconsistent or obsolete terminology, unnecessarily technical language, awkward grammar, hidden values, overly broad backgrounds and opportunities to make interesting differences more prominent.

When you discover better terminology for a business concept, apply it retrospectively. Do not preserve inferior language simply because a matching step implementation already exists. Good executable specifications evolve alongside the understanding of the domain.

# Implementing Yadda

The implementation exists to support the specification, not to dictate it. The techniques below are intended to make natural, expressive features practical without allowing the implementation to become unmanageable.

## Rule 1: Organise steps into libraries

A single step library may be convenient initially, but it becomes increasingly difficult to manage as the suite grows. Split steps into coherent libraries based on domain, capability or application layer.

Yadda's library resolution provides another useful property: where otherwise ambiguous step patterns exist in different libraries, Yadda prefers the library that was most recently used. This means similar business-language steps can have different implementations in different libraries without necessarily causing a step clash. Use this deliberately rather than relying on accidental precedence.

## Rule 2: Load only the libraries you need

For small projects, loading all step libraries is usually the simplest approach and there is little benefit in adding extra selection logic.

As the suite grows, however, selectively loading libraries can become useful. Yadda annotations can be used to select the libraries required by a particular specification, keeping the available step vocabulary scoped to the behaviour being exercised and reducing the likelihood that unrelated libraries will introduce step clashes.

Treat this as a technique for managing larger suites rather than something every Yadda project needs from the outset.

## Rule 3: Reuse specifications across interfaces

Good business language is independent of the mechanism used to exercise the application. The same specification:

```feature
When the customer requests the wine list
And asks for the Sancerre "Les Baronnes" 2023

Then they are told that it is unavailable
And offered the Pouilly-Fumé "La Moynerie" 2023
```

could be exercised through an API or through a user interface. Different libraries can provide different implementations of those steps while the business specification remains unchanged.

If a scenario needs substantial rewriting merely because it is being exercised through another interface, implementation language may have leaked into the specification. See [Rule 2: Speak the language of the business](#rule-2-speak-the-language-of-the-business).

## Rule 4: Prefer dictionaries to regular expressions

Avoid embedding anonymous regular-expression captures throughout step patterns. Prefer named Yadda dictionary terms. For example:

```javascript
"When the customer visits $Restaurant"
```

communicates considerably more than a pattern containing an anonymous regular expression intended to capture `The Ivy`, while:

```javascript
"And asks for $Wine"
```

makes the purpose of the captured value immediately apparent.

Dictionary terms make patterns easier to read and more specific, reducing the likelihood of unrelated steps matching the same text. Use meaningful domain names for dictionary terms rather than generic captures wherever possible. This supports [Rule 4: Make the automation fit the language](#rule-4-make-the-automation-fit-the-language).

## Rule 5: Use dictionaries as a domain vocabulary

Dictionaries are more than a readable alternative to inline regular expressions. They provide a vocabulary for values that occur in the domain. In the wine example, terms such as `$Restaurant`, `$Wine`, `$Vintage`, `$Region`, `$Price` and `$Quantity` tell the reader what kind of value a step pattern expects.

As the suite develops, the dictionary becomes part of the implementation vocabulary of the domain. This improves readability and consistency while also making step matching more specific.

## Rule 6: Convert values at the dictionary boundary

Values captured from feature text frequently need converting before they are useful to the implementation, and that conversion should happen in the dictionary where possible. For example, a `$Quantity` dictionary term might match numeric text but use its converter to pass a JavaScript number to the step rather than the original string. Similarly, a `$Price` might parse its textual representation into whatever type the application uses to represent money.

Keeping conversion at the dictionary boundary avoids repetitive parsing in individual step implementations and ensures that the same domain concept is interpreted consistently throughout the suite.

## Rule 7: Support natural grammar

Do not allow implementation convenience to force grammatically incorrect or unnatural steps. Natural English sometimes requires legitimate variations of the same pattern, with the choice between `a` and `an` being a simple example.

A small regular expression can be appropriate where the alternatives are simple and the resulting pattern remains readable. Alternatively, Yadda supports step aliases by allowing an array of step patterns to be supplied instead of a single pattern. Choose whichever keeps the implementation understandable while allowing the specification to remain natural. See [Rule 4: Make the automation fit the language](#rule-4-make-the-automation-fit-the-language).

## Rule 8: Do not optimise for step reuse

Step reuse is useful, but it is not the objective. Do not distort two distinct business concepts into a generic step merely because their implementations happen to be similar. If the business naturally describes two behaviours differently, allow the steps to be different and share implementation code underneath them where appropriate.

Conversely, do not accumulate arbitrary synonyms for precisely the same domain concept. If the business has settled terminology, use it consistently. Reuse code where useful and reuse language where meaningful.

## Rule 9: Use context to support natural references

The Yadda context can allow subsequent steps to refer naturally to things established earlier. For example:

```feature
Given Alice has requested the wine list
When she selects the Sancerre "Les Baronnes" 2023
Then she is told that it is unavailable
```

The first step can place Alice into the context, allowing subsequent implementations to resolve `she` naturally. This can be considerably clearer than repeatedly naming every object or person.

Only do this when the reference is unambiguous. If several customers have been introduced, `she` may no longer be clear; similarly, if several wines have been mentioned, `it` may be ambiguous. The context should support natural language, not create hidden state that the reader has to reconstruct.

## Rule 10: Keep large test worlds behind meaningful names

Some behaviour requires substantial setup, and constructing the entire application world through dozens of steps would obscure the behaviour being tested. In these cases, maintain named fixtures or datasets that hide irrelevant detail. For example:

```feature
Given an extensive wine list
```

might establish a large catalogue containing wines from many regions and vintages, together with prices, stock levels and relationships to suitable alternatives.

The scenario can then customise the particular values that matter:

```feature
Given an extensive wine list
And the Sancerre "Les Baronnes" 2023 has sold out
And Pouilly-Fumé "La Moynerie" 2023 is the closest alternative
```

The fixture supplies the uninteresting world while the scenario makes the interesting facts explicit. See [Rule 7: Keep important values visible](#rule-7-keep-important-values-visible).

## Rule 11: Organise supporting code as the suite grows

A Yadda implementation may begin with a handful of steps but can grow into a substantial body of test infrastructure. Separate different responsibilities rather than allowing everything to accumulate alongside the step definitions. A mature suite may have distinct areas for libraries, dictionaries and converters, parsers, fixtures and named datasets, assertion helpers and utility modules.

The exact directory structure is less important than maintaining clear boundaries. Rich step content may require parsers and shared business assertions may warrant dedicated helpers, but these concerns should not make the step libraries themselves difficult to navigate.

## Rule 12: Refactor the implementation continuously

Step implementations need the same ongoing attention as the specification. As the suite grows, look for duplicate or overly broad step patterns, step clashes, opportunities for dictionary terms, repeated conversion or parsing logic, libraries that have become too large, inappropriate dependencies between libraries and implementation code that has started to dictate feature language.

Failures should remain useful, so where an assertion would otherwise produce a cryptic technical error, add enough domain context to make the violated expectation clear. Yadda's development annotations can also help while working on the suite: pending steps allow behaviour to be written ahead of its implementation or temporarily disabled, while only steps allow work to be focused on a particular step without running the entire suite.

Refactoring should work in both directions. Improvements in the implementation may enable better feature language, while improvements in feature language may expose implementation abstractions that no longer make sense.

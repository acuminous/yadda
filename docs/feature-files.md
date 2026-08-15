# Feature Files

While Yadda can interpret any array of strings you write steps for, it also ships a Gherkin-like feature-file parser supporting features, rules, backgrounds, annotations, multiline steps, example tables and comments. The same specifications can also be written as [GitHub-flavoured markdown](#markdown-feature-files) so they render nicely on GitHub.

A feature parses into a plain object you can iterate over:

```
Feature: 100 Green Bottles

Background:

  Given a 6ft wall

Scenario: Bottles should fall from the wall

  Given 100 green bottles are standing on the wall
  When 1 green bottle accidentally falls
  Then there are 99 green bottles standing on the wall

@Pending
Scenario: Plastic bottles should not break

  Given 100 plastic bottles are standing on the wall
  When 1 plastic bottle accidentally falls
  Then it does not break
```

parses to:

```js
{
  title: '100 Green Bottles',
  scenarios: [
    {
      annotations: {},
      title: 'Bottles should fall from the wall',
      steps: [
        'Given a 6ft wall',
        'Given 100 green bottles are standing on the wall',
        'When 1 green bottle accidentally falls',
        'Then there are 99 green bottles standing on the wall',
      ],
    },
    {
      annotations: { pending: true },
      title: 'Plastic bottles should not break',
      steps: [
        'Given a 6ft wall',
        'Given 100 plastic bottles are standing on the wall',
        'When 1 plastic bottle accidentally falls',
        'Then it does not break',
      ],
    },
  ],
}
```

## Features

```
@Annotation
Feature: Some title
An optional description potentially spanning multiple lines

Scenario: Some title
  ...
```

- Features are optional — you can go straight into scenarios if you want.
- Any text before the feature is ignored.
- Feature descriptions are optional, may span multiple lines, and are terminated by a blank line.
- Features may be preceded by one or more annotations.
- A feature must include one or more scenarios.

## Scenarios

```
@Annotation
Scenario: Some title

  Given some step
  And another step
  When I do something
  Then expect some side effect
```

- Scenarios may be preceded by one or more annotations.
- A scenario must have one or more steps.
- Blank lines are ignored (unless they occur within a multiline step).

## Rules

Yadda supports the Gherkin `Rule` keyword for grouping scenarios that belong to a single business rule. A rule may declare its own `Background`, whose steps are prepended (after any feature-level background) to each of the rule's scenarios.

```
Feature: Highlander

  Background:

    Given a game with 2 immortals

  Rule: There can be only one

    Background:

      Given the immortals fight

    Scenario: One remains

      Then there is 1 immortal left
```

Parsed features expose a `rules` array alongside the top-level `scenarios` array (scenarios declared before the first `Rule` remain in `scenarios`). The [plugins](plugins.md) provide `rule`/`rules` helpers so rules nest as their own group.

## Steps

```
Scenario: Some title

  Given some precondition
  And another precondition
  When I do something
  Then expect some side effect
  However some other side effect should not occur
```

- Steps do not have to start with Given, When, Then, And or But.
- Steps are trimmed (left and right).
- Steps do not support annotations.
- Implement steps with [step libraries](step-libraries.md) and [dictionaries](dictionaries.md).

### Multiline Steps

```
Scenario: Some title

  Given a poem
  --------------
  A stormy night, with lashing waves,
  To send the sailors to their graves.
  --------------
  Then expect the poem to have two lines
```

- A multiline step must be preceded by a leading single-line step (e.g. `Given a poem`); the multiline content is appended to it, separated by a line break (`\n`).
- Multiline steps are demarcated by three or more consecutive dashes.
- If the multiline step is the last step in the scenario, the terminating dashed line is optional.
- Content is left-trimmed to the start of the dashed line and right-trimmed.

### Structured Multiline Steps

Multiline content can hold structured data — tables, CSV, XML, JSON — which you parse with a [converter](dictionaries.md#custom-converters):

```
Scenario: Some title

  Given some csv
  --------------
  First Name,Last Name,Age
  Joe,Bloggs,23
  John,Smith,41
  --------------
  Then expect Joe to be younger than John
```

## Annotations

```
@Pending
@Browsers=chrome,safari
Feature: Some title
  ...
```

- Annotations start with `@` followed by one or more word characters.
- They can be tags (`@Pending`) or name/value pairs separated by `=` (`@Browsers=chrome`).
- Tags are assigned a value of `true`.
- Annotations are supported on features, scenarios and example-table rows.
- The plugins honour `@Pending` and `@Only` annotations.

Access them programmatically (the parser lowercases annotation names):

```js
import Yadda from 'yadda';

const { parsers } = Yadda;

const feature = new parsers.FeatureParser().parse(specification);
if (feature.annotations.pending) {
  // Do stuff
}
```

## Backgrounds

```
Background: Some title

  Given some step
  And another step
```

- A feature may have zero or one background.
- Background steps are prepended to every scenario in the feature.
- Backgrounds do not support annotations or example tables.
- Otherwise a background behaves like a scenario.

## Example Tables

Each data row generates a new scenario, with `[Column]` placeholders substituted from that row.

```
Scenario: Year of birth

  Given the current year is 2015
  And [First Name] [Last Name] is [Age]
  Then [First Name] [Last Name]'s year of birth is [Year Of Birth]

Where:

  ------------------------------------------------
  | First Name | Last Name | Age | Year Of Birth |
  | John       | Smith     | 41  | 1974          |
  | Joe        | Bloggs    | 23  | 1992          |
  ------------------------------------------------
```

- Columns are demarcated by the pipe (`|`) or box-drawing (`┆`) characters.
- Horizontal borders start with an optional column separator followed by three or more dashes.
- Outer borders are optional.
- A table must contain a single header row.
- For single-line tables there must be **no** horizontal border after the header row (that signals a multiline table — see below).
- Values are left-trimmed to the position of the column heading; trailing whitespace is removed.
- `Where:` and `Examples:` are interchangeable.

### Multiline Example Tables

A horizontal border **after** the header row switches the table into multiline mode, where rows are separated by horizontal borders and cells may span several lines:

```
Where:

  ----------------------------------------------------
  | Name       | Verses | Poem                        |
  |------------|--------|-----------------------------|
  | Good Times | 2      | May we go our separate ways |
  |            |        | Finding fortune and friends |
  |------------|--------|-----------------------------|
  | Ode        | 1      | Should the not so British   |
  |            |        | Rail come to fail           |
  ----------------------------------------------------
```

### Row Annotations

Both single-line and multiline table rows support annotations (e.g. `@Pending` on the line above a row).

### Example Table Metadata

Yadda decorates each example table with extra fields you can reference from steps: `[<name>.index]`, `[<name>.start.line]` and `[<name>.start.column]`.

## Comments

### Single-line

```
# This is a single-line comment
```

Any line starting with `#` is a single-line comment.

### Multiline

```
#####################
This is a
multiline comment
#####################
```

Multiline comments are demarcated by three or more consecutive `#` characters. Comments may appear anywhere in a feature specification.

## Markdown Feature Files

`MarkdownFeatureParser` parses specifications written as [GitHub-flavoured markdown](https://github.github.com/gfm/), so a feature file renders as a well-formatted document on GitHub rather than as plain text. It produces exactly the same parsed object as `FeatureParser` — a markdown feature and its equivalent `.feature` are interchangeable — so everything described above about features, rules, backgrounds, scenarios, example tables and annotations still applies. Only the surface syntax differs:

```markdown
@issue=1234

# Feature: 100 Green Bottles

## Background:

- Given a 6ft wall

## Scenario: Bottles should fall from the wall

- Given 100 green bottles are standing on the wall
- When 1 green bottle accidentally falls
- Then there are 99 green bottles standing on the wall
```

Parse it with `MarkdownFeatureParser` (or `MarkdownFeatureFileParser` for a file):

```js
import Yadda from 'yadda';

const { parsers } = Yadda;

const feature = new parsers.MarkdownFeatureParser().parse(specification);
```

| Construct | Markdown syntax |
|---|---|
| Feature, Rule, Scenario, Background | A heading whose text is the keyword line, e.g. `# Feature: Title`, `## Scenario: Title`. The heading level is cosmetic — only the keyword matters. |
| Steps | List items, e.g. `- Given some step`. Inside a scenario any plain line is also treated as a step (Yadda scenarios have no description), but the list marker reads best and lets feature/rule descriptions stay as ordinary paragraphs. |
| Descriptions | Ordinary paragraphs beneath a `Feature:` or `Rule:` heading. |
| Doc-strings (multiline steps) | A [fenced code block](https://github.github.com/gfm/#fenced-code-blocks) following a step. Its content is captured verbatim (no entity decoding), replacing the `---` dashed delimiters used in `.feature` files. |
| Example tables | [GitHub tables](https://github.github.com/gfm/#tables-extension-). The `\|---\|` separator row is ignored. |
| Annotations | `@tag` / `@name=value` on their own line above a construct, exactly as in `.feature` files. |
| Comments | `>` blockquotes are **visible** comments that render as callouts on GitHub; `<!-- -->` blocks are **hidden** comments a viewer does not render. Both free `#` to mean "heading". |

### Entities

Because markdown renderers treat `<` as the start of an HTML tag, authors typically write entities like `&lt;`, `&gt;` and `&amp;` for literal characters. These are decoded back to `<`, `>` and `&` in prose (titles, steps, descriptions and table cells) so your step implementations receive the rendered text, but left **verbatim** inside fenced doc-strings, where content must be preserved exactly.

> **Note:** entities inside inline code spans (`` `&lt;x&gt;` ``) are decoded along with the surrounding prose. If you need a literal entity, put it in a fenced doc-string.

See the runnable [markdown example](../examples/markdown) for a feature exercising every construct.

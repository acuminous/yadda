# Contributing

We're delighted to accept pull requests, but would also like to keep the Yadda codebase consistent with the following principles and conventions. Feel free to ignore them (especially if you're fixing a bug), but don't be offended if your code gets re-written before it's merged.

### Doing One Thing (Well)

An application should do one thing well. Yadda's "one thing" is to map lines of text to function calls. It's not a test runner or a test framework, but it should integrate with other tools easily. It shouldn't have a rigid "Given, When, Then" syntax either.

### Feature Improvements

Before working on an improvement, consider creating an issue for it. It may be something a maintainer or another contributor has already given thought to and can help with.

### Zero Dependencies

We don't want to force Yadda's users to install a utility or async library, so even though such libraries can be convenient we resist depending on them. Yadda ships with zero runtime dependencies and we intend to keep it that way.

### Very Small Functions

The average function in the Yadda codebase is only a few lines long. We'd like to keep it this way.

### Else Considered Harmful

Guard conditions (an `if` near the top of a function that returns immediately or throws) are fine, but try very hard to avoid `else` or `switch`. They typically hide a fork in behaviour that is better handled with polymorphism.

### Booleans Make Bad Parameters

Passing booleans as parameters leads to `else` statements. Else statements are bad. Use polymorphism instead.

### Avoid Inheritance

We prefer composition, mixins or duck typing to classic Java-style inheritance hierarchies.

### Encapsulate, Encapsulate, Encapsulate

Did you know the NASA Mars Climate Orbiter disintegrated because a quantity wasn't encapsulated? The ground system sent thrust instructions in pound-seconds, but the flight system expected newton-seconds. When your software leaks primitives, bad things happen. Please keep your behaviour and data as private as possible. Yadda uses closures rather than classes precisely so that state stays private — there are no accessors or mutators.

### No Comment

The only valid reason for a comment is to explain why confusing code cannot be simplified — maybe you're working around a bug in a third-party library, or implementing a naturally complicated algorithm (e.g. [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance)). If you're using a comment to explain _what_ code does, take the time to simplify the code instead.

### Automated Tests

Yadda's codebase is well tested and will continue to be so. Please include tests with your pull request. Run the suite with:

```
npm test
```

and check coverage with:

```
npm run coverage
```

### Syntax

Yadda was originally written just after its author completed a Ruby course, which is why some of the internals `read_more_like_ruby` than idiomatic JavaScript. It's probably a mistake, but we'd like to keep the codebase looking consistent.

### Formatting and Linting

Formatting and linting are handled by [Biome](https://biomejs.dev/). Before committing:

```
npm run format
npm run lint
```

A [lefthook](https://github.com/evilmartians/lefthook) pre-commit hook runs these automatically.

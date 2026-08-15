# Dictionaries

Dictionaries simplify steps, let you re-use regular expressions, and convert parameters to whatever type you need. They are one of the features that most sets Yadda apart from Gherkin-based tools: a dictionary term can not only _match_ text but also _transform_ or even _source_ the resulting value.

## Simple Definitions

```js
import Yadda from 'yadda';

const { Dictionary, ContextParamLibrary, converters, localisation: { English } } = Yadda;

const dictionary = new Dictionary().define('gender', /(male|female)/);

const library = English.localise(new ContextParamLibrary(dictionary))
  .given('A $gender user', (ctx, gender) => {
    // Code goes here
  });
```

## Nested Definitions

Terms may refer to other terms, so you can build complex patterns from small, reusable pieces:

```js
import Yadda from 'yadda';

const { Dictionary, ContextParamLibrary, localisation: { English } } = Yadda;

const dictionary = new Dictionary()
  .define('address', '$street, $postcode')
  .define('street', /(\d+ \w+)/)
  .define('postcode', /([A-Z]{1,2}\d{1,2} \d[A-Z]{2})/);

const library = English.localise(new ContextParamLibrary(dictionary))
  .given('An $address', (ctx, street, postcode) => {
    // Code goes here
  });
```

## Converters

A converter turns matched text into a richer value:

```js
import Yadda from 'yadda';

const { Dictionary, ContextParamLibrary, converters, localisation: { English } } = Yadda;

const dictionary = new Dictionary().define('num', /(\d+)/, converters.integer);

const library = English.localise(new ContextParamLibrary(dictionary))
  .given('A whole number $num', (ctx, number) => {
    // `number` is an integer rather than a string
  });
```

Yadda bundles the following converters, available under `Yadda.converters`:

| Converter | Turns matched text into |
|---|---|
| `integer` | An integer |
| `float` | A floating-point number |
| `date` | A `Date` |
| `list` | An array |
| `table` | An array of row objects (see [data tables](feature-files.md#example-tables)) |
| `pass_through` | The unchanged string (the default) |

## Custom Converters

Writing your own converter is trivial — define a function that takes one argument per matching group, plus a callback:

```js
import Yadda from 'yadda';

const { Dictionary, ContextParamLibrary, localisation: { English } } = Yadda;

function quantityConverter(amount, units, cb) {
  cb(null, { amount: Number(amount), units });
}

const dictionary = new Dictionary().define('quantity', /(\d+) (\w+)/, quantityConverter);

const library = English.localise(new ContextParamLibrary(dictionary))
  .given('a delay of $quantity', (ctx, quantity) => {
    // `quantity` is an object with `amount` and `units` fields
  });
```

## Sourcing Data

Because converters are **asynchronous** (they receive a callback), they can do more than reshape literals — they can _source_ the value. Combined with [multiline steps](feature-files.md#multiline-steps), a converter can parse an entire document (CSV, XML, JSON, a data table), or fetch an entity from a remote system before the step ever runs:

```js
import Yadda from 'yadda';

const { Dictionary, ContextParamLibrary, localisation: { English } } = Yadda;

function userConverter(id, cb) {
  db.findUser(id, (err, user) => cb(err, user));
}

const dictionary = new Dictionary().define('user', /(\w+)/, userConverter);

const library = English.localise(new ContextParamLibrary(dictionary))
  .when('$user logs in', (ctx, user) => {
    // `user` is the entity fetched by userConverter, not just its id
  });
```

This is why dictionaries reduce step conflicts _and_ keep steps readable: the messy matching and data-loading lives in the dictionary, and the step signature stays clean.

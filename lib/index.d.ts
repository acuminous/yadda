// Type definitions for Yadda 3.0
// Yadda has zero runtime dependencies. These hand-written definitions cover
// the public API reached through `require('yadda')`.

export = Yadda;

declare namespace Yadda {
  /** Node-style callback used to signal completion (or error) of async work. */
  type Callback = (err?: unknown) => void;

  /** The mutable object shared between the steps of a scenario. */
  type Properties = Record<string, unknown>;

  /**
   * A step signature: a string or RegExp, or an array of either to alias
   * several phrasings onto the same step function.
   */
  type Signature = string | RegExp | Array<string | RegExp>;

  /**
   * A step accepted by `run`/`yadda`: the step text, or the runnable
   * ({@link PluginStep}) a step-level plugin passes to its `steps` iterator.
   */
  type Step = string | PluginStep;

  /** How Yadda should treat a step function's return/arguments. */
  type StepMode = 'sync' | 'async' | 'promise';

  interface DefineOptions {
    mode?: StepMode;
  }

  /**
   * A dictionary converter. Either receives the captured groups followed by a
   * Node-style callback and yields the converted value via `cb(err, value)`,
   * or is an `async` function that receives the captured groups and returns
   * (or resolves to) the converted value.
   */
  type Converter = CallbackConverter | AsyncConverter;

  type CallbackConverter = (...args: [...groups: string[], cb: ConverterCallback]) => void;

  type AsyncConverter = (...groups: string[]) => Promise<unknown>;

  type ConverterCallback = (err: unknown, value?: unknown) => void;

  // --- Interpreter -----------------------------------------------------------

  /**
   * The interpreter. Usually created via `Yadda.createInstance`. Maps the lines
   * of a scenario onto the step functions provided by one or more libraries.
   */
  class Yadda {
    constructor(libraries?: BaseLibrary | BaseLibrary[], interpreterContext?: Properties);

    interpreter: Interpreter;

    /** Adds more libraries to the interpreter. Returns `this`. */
    requires(libraries: BaseLibrary | BaseLibrary[]): this;

    /**
     * Interprets a scenario (an array of steps, or a single step). `context`
     * merges over the interpreter context. Omit `next` for a synchronous run.
     */
    yadda(scenario: Step | Step[], context?: Properties, next?: Callback): void;
    yadda(scenario: Step | Step[], next: Callback): void;
    yadda(): this;

    /** Alias for {@link yadda}. */
    run(scenario: Step | Step[], context?: Properties, next?: Callback): void;
    run(scenario: Step | Step[], next: Callback): void;
    run(): this;
  }

  class Interpreter {
    constructor(libraries?: BaseLibrary | BaseLibrary[]);
    requires(libraries: BaseLibrary | BaseLibrary[]): this;
    validate(scenario: string[]): void;
    interpret(scenario: string[], scenarioContext: Properties, next?: Callback): void;
    interpret_step(step: string, scenarioContext: Properties, next?: Callback): void;
  }

  /** Constructs an object that macros are bound to (or merged into) before execution. */
  class Context {
    constructor(properties?: Record<string, unknown>);
    properties: Record<string, unknown>;
    merge(other?: Context | Record<string, unknown>): Context;
  }

  // --- Step libraries --------------------------------------------------------

  /**
   * Common step-library surface. A localisation (e.g. `English.localise`) adds
   * `given`, `when` and `then`, each behaving like `define` with the keyword
   * prefixed onto the signature.
   */
  interface BaseLibrary {
    /**
     * Maps a signature to a step function. Omit `fn` for a pending (skipped)
     * step. Returns the library.
     */
    define(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;

    /** Returns the macro identified by a signature, if any. */
    get_macro(signature: string | RegExp): Macro | undefined;

    /** Returns the macros that can interpret a step. */
    find_compatible_macros(step: string): Macro[];

    /** Localised shorthand for `define`, added when wrapped by a localisation. */
    given?(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
    when?(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
    then?(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
  }

  /** A step function. The signature varies by library type and mode. */
  type StepFunction = (...args: any[]) => unknown;

  interface Macro {
    library: BaseLibrary;
    is_identified_by(signature: string | RegExp): boolean;
    can_interpret(step: string): boolean;
    interpret(step: string, scenarioContext: Properties, next?: Callback): void;
    toString(): string;
  }

  /**
   * A step library that passes the scenario context as the first argument to
   * every step, so steps can be plain arrow functions and never need `this`.
   */
  class ContextParamLibrary implements BaseLibrary {
    constructor(dictionary?: Dictionary);
    define(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
    get_macro(signature: string | RegExp): Macro | undefined;
    find_compatible_macros(step: string): Macro[];
    given(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
    when(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
    then(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
  }

  /**
   * A step library that binds the scenario context to `this`. Steps must be
   * `function` expressions, not arrow functions.
   */
  class ContextBoundLibrary implements BaseLibrary {
    constructor(dictionary?: Dictionary);
    define(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
    get_macro(signature: string | RegExp): Macro | undefined;
    find_compatible_macros(step: string): Macro[];
    given(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
    when(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
    then(signatures: Signature, fn?: StepFunction, macroContext?: Properties, options?: DefineOptions): this;
  }

  /** Deprecated alias for {@link ContextBoundLibrary}, retained for backwards compatibility. */
  const Library: typeof ContextBoundLibrary;
  type Library = ContextBoundLibrary;

  // --- Dictionary ------------------------------------------------------------

  /** Reusable terms and converters. */
  class Dictionary {
    constructor(prefix?: string);

    /**
     * Defines a term. The pattern may reference other terms (e.g.
     * `'$street, $postcode'`). A converter reshapes or sources the matched
     * value. Returns the dictionary.
     */
    define(name: string, pattern?: string | RegExp, converters?: Converter | Converter[]): this;

    /** Merges another dictionary (with the same prefix) into a new dictionary. */
    merge(other: Dictionary): Dictionary;

    /** Expands the terms within a signature into their underlying patterns. */
    expand(signature: string | RegExp): { pattern: string; converters: Converter[] };
  }

  // --- Converters ------------------------------------------------------------

  interface Converters {
    date: Converter;
    integer: Converter;
    float: Converter;
    list: Converter;
    table: Converter;
    pass_through: Converter;
  }

  const converters: Converters;

  // --- File search -----------------------------------------------------------

  /** Searches directories (recursively) for files matching one or more patterns. */
  class FileSearch {
    constructor(directories: string | string[], patterns?: RegExp | RegExp[]);
    each(iterator: (file: string) => void): void;
    list(): string[];
  }

  /** Finds `.feature` (also `.spec`, `.specification`) files under a directory. */
  class FeatureFileSearch extends FileSearch {
    constructor(directories: string | string[]);
  }

  // --- Event bus -------------------------------------------------------------

  interface Event<T = unknown> {
    name: string;
    data: T;
  }

  interface EventBusInstance {
    send(eventName: string, eventData?: Record<string, unknown>, next?: Callback): this;
    on(eventPattern: string | RegExp, callback: (event: Event) => void): this;
  }

  interface EventBusStatic {
    instance(): EventBusInstance;
    ON_SCENARIO: string;
    ON_STEP: string;
    ON_EXECUTE: string;
    ON_DEFINE: string;
  }

  const EventBus: EventBusStatic;

  // --- Parsers ---------------------------------------------------------------

  interface ParsedScenario {
    title: string;
    annotations: Record<string, unknown>;
    description: string[];
    steps: string[];
  }

  interface ParsedRule {
    title: string;
    annotations: Record<string, unknown>;
    description: string[];
    scenarios: ParsedScenario[];
  }

  interface ParsedFeature {
    title: string;
    annotations: Record<string, unknown>;
    description: string[];
    scenarios: ParsedScenario[];
    rules: ParsedRule[];
  }

  interface FeatureParserOptions {
    language?: Language;
    leftPlaceholderChar?: string;
    rightPlaceholderChar?: string;
  }

  class StepParser {
    parse(text: string): string[];
    parse(text: string, next: (steps: string[]) => void): void;
  }

  class FeatureParser {
    constructor(options?: FeatureParserOptions | Language);
    parse(text: string): ParsedFeature;
    parse(text: string, next: (feature: ParsedFeature) => void): void;
  }

  class FeatureFileParser {
    constructor(options?: FeatureParserOptions | Language);
    parse(file: string): ParsedFeature;
    parse(file: string, next: (feature: ParsedFeature) => void): void;
  }

  class MarkdownFeatureParser {
    constructor(options?: FeatureParserOptions | Language);
    parse(text: string): ParsedFeature;
    parse(text: string, next: (feature: ParsedFeature) => void): void;
  }

  class MarkdownFeatureFileParser {
    constructor(options?: FeatureParserOptions | Language);
    parse(file: string): ParsedFeature;
    parse(file: string, next: (feature: ParsedFeature) => void): void;
  }

  interface Parsers {
    StepParser: typeof StepParser;
    FeatureParser: typeof FeatureParser;
    FeatureFileParser: typeof FeatureFileParser;
    MarkdownFeatureParser: typeof MarkdownFeatureParser;
    MarkdownFeatureFileParser: typeof MarkdownFeatureFileParser;
  }

  const parsers: Parsers;

  // --- Localisation ----------------------------------------------------------

  /** A localisation. Wrap a library with `localise` to gain `given`/`when`/`then`. */
  interface Language {
    is_language: true;
    localise<T extends BaseLibrary>(library: T): T;
    /**
     * @deprecated Constructs a context-bound library. Prefer
     * `localise(new ContextParamLibrary(dictionary))` for arrow-friendly steps.
     */
    library(dictionary?: Dictionary): ContextBoundLibrary;
    translate(keyword: string): string;
    supports(keyword: string): boolean;
  }

  interface LanguageConstructor {
    new (name: string, vocabulary: Record<string, unknown>): Language;
  }

  interface Localisation {
    Chinese: Language;
    English: Language;
    French: Language;
    German: Language;
    Dutch: Language;
    Norwegian: Language;
    Pirate: Language;
    Ukrainian: Language;
    Polish: Language;
    Spanish: Language;
    Russian: Language;
    Portuguese: Language;
    default: Language;
    Language: LanguageConstructor;
  }

  const localisation: Localisation;

  // --- Plugins ---------------------------------------------------------------

  interface PluginOptions {
    container?: object;
    language?: Language;
    parser?: FeatureParser | FeatureFileParser;
    runner?: unknown;
    [key: string]: unknown;
  }

  /**
   * Helpers returned by a plugin's `init()`. Mocha/Jasmine also install these
   * on the container (defaulting to `global`); node:test returns them for
   * destructuring.
   */
  /**
   * The step passed to a step-level plugin's `steps` iterator. Coerces to its
   * text wherever a step string is expected, and exposes `skip()` to skip the
   * step (and abort the remaining steps) at runtime.
   */
  interface PluginStep {
    name: string;
    skip(message?: string): void;
  }

  interface PluginHelpers {
    featureFiles(files: string | string[], iterator: (feature: ParsedFeature) => void): void;
    featureFile(files: string | string[], iterator: (feature: ParsedFeature) => void): void;
    features(features: ParsedFeature | ParsedFeature[], iterator: (feature: ParsedFeature) => void): void;
    feature(features: ParsedFeature | ParsedFeature[], iterator: (feature: ParsedFeature) => void): void;
    rules(rules: ParsedRule | ParsedRule[], iterator: (rule: ParsedRule) => void): void;
    rule(rules: ParsedRule | ParsedRule[], iterator: (rule: ParsedRule) => void): void;
    scenarios(scenarios: ParsedScenario | ParsedScenario[], iterator: (scenario: ParsedScenario, done?: Callback) => void): void;
    scenario(scenarios: ParsedScenario | ParsedScenario[], iterator: (scenario: ParsedScenario, done?: Callback) => void): void;
    steps?(steps: string[], iterator: (step: PluginStep, done?: Callback) => void): void;
  }

  interface Plugin {
    init(options?: PluginOptions): PluginHelpers;
  }

  interface RunnerPlugins {
    ScenarioLevelPlugin: Plugin;
    StepLevelPlugin: Plugin;
  }

  interface Plugins {
    mocha: RunnerPlugins;
    jasmine: RunnerPlugins;
    nodetest: RunnerPlugins;
  }

  const plugins: Plugins;

  // --- Factory ---------------------------------------------------------------

  /** Creates a {@link Yadda} interpreter for one or more libraries. */
  function createInstance(libraries?: BaseLibrary | BaseLibrary[], interpreterContext?: Properties): Yadda;
}

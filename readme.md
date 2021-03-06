# Cliff-isms in a TypeScript world

in no particular order...

## Use `const` lambdas

in JavaScript the following are (ignoring `this` binding) the same:

```JavaScript
export function foo(a, b) {
    // some complex code so this isn't a trival expression...
    return a + b;
}

export const foo = (a, b) => {
    // some complex code so this isn't a trival expression...
    return a + b;
};
```

in TypeScript the addition of types makes the lambda form more "friendly" because the return types for lambda
expressions are automatically inferred.

```TypeScript
export function foo(a: number, b: number): number {
  // some complex code so this isn't a trival expression...
  return a + b;
}

export const foo = (a: number, b: number) => {
  // some complex code so this isn't a trival expression...
  return a + b;
};
```

Partial evaluation setup is also more compact in this form:

```TypeScript
export const addN = (n: number) => (v: number) => n + v;
export const add2 = addN(2);
```

All the constructors (`Ctor`) I use are basically a form a partial application of the external abstractions the module
uses. When I refer to "constructor" I am *not* talking about the `constructor` keyword, but the actual english word. I
will often say this like "see" "tor".

## `Ctor` vs `Factory` vs "just a function"

`Ctor` is used in bootstrap only. So all calls to the `Ctor` functions happen as part of the execution context starting
and in the main thread (not really relevant for node apps).

`Factory` functions are called after bootstrap (or during) and typically return something that isn't primitive (or if
primitive have special properties not enforced by the type system). They are typically impure functions using bound
dependencies to produce what they return.

Functions with out decoration are typically pure. If not (e.g. bound to a closure context and impure) it should be clear
from their usage.

## Internal Module Structure & Testability

**Rule 1**: Internal modules *must* only define pure functions (const lambdas).

Running any code during initialization makes in impossible to test the module without also running that code, so limit
top level module code to declaring pure functions or memoizing functions.

Pure functions rely solely on their input. Any time a function uses an imported definition that is not a pure function
it *must* export out a partial applicaion constructor (`Ctor`) and shadow the import into a parameter variable of the
same name. In cases where the import itself is pure you may skip this if the function is relatively simple and stubbing
it in a test would be more complex that using the real thing. (e.g. `Math.sin`)

Anything that does IO is impure. That includes (but not limited to):

- Reading the clock
- Accessing the disk
- Accessing the network
- Outputting to `console.log`
- Creating threads

**Rule 2**: `Ctor`s should not call their dependencies, but instead return functions that do. Since a `Ctor` executes
during Bootstrap only part of the execution context will be initialised. It is not usually safe to call into any of the
dependencies at this point as a further `Ctor`s could fail leaving the dependencies in a bad state. `Ctor`s are usually
called once per execution context. Return a `Factory` from `Ctor` for cases that manger shorter lifetimes.

**Rule 3**: Figure out Bootstrap

There are two primary approaches to bootstrapping an execution context. My preferred way is to have a single `bootstrap.ts`
file (per execution context) that creates instances of modules and chains them together in leaf-to-root order. The other
approach is to use singleton providers defined in a `foo.provider.ts` companion module. (for tests, `foo.test.ts`, the
bootstrap of the test set is inline with the tests)

An execution context is usually one of:

- A server on the network
- A tool run on the command line
- A test case

Libraries/Modules are not execution contexts, and are used by execution contexts. They should not have any bootstrap
files themselves.

For the singleton approach, anywhere you see `fooProvider` it'll be using `memoize` against the modules `fooCtor`. Unit
tests don't call the provider function and instead use the constructor directly providing stubs for the modules
dependencies. This isolates the code under test to the module's code.

In single threaded languages, like TypeScript, using the lazy singleton provider approach is safe, but in a
multithreaded language it is not. That is the primary reason to prefer the single file style of bootstrapping as it
ensures bootstrap happens solely in the main thread before other threads can be spawnned.

**Rule 4**: **No** `this`, **No** inheritance, **Avoid** `new`.

Implicit `this` is quite possible the worst concept to come out of Comp Sci. Use partial application and closures. In
languages other than JavaScript/TypeScript this can be relaxed to only allow private, init-only fields, to emulate the
closure environment.

The only time `this` should be used is in wrappers around third party code that force us to use it.

Inheritance is quite possible the second worst concept to come out of Comp Sci. Use aggregation and type a bit more to
forward the API... and then think about your life choices, because you probably shouldn't be forwarding the whole API. If
you don't agree go search for "Extends is Evil" and do some reading on how much damage inheritance can cause. To date
I have seen one legitimate use for inheritance, and you probably don't have that use case. (It involves the impact of
data packing on cachelines on memory read performance.)

Since we won't use `this` there is no reason to use `new` unless forced too by third party library code. Before
`async`/`await` a common case was `new Promise(...)`. Use `new` if you have to, but none of the modules we create
should require their consumers to use `new`. Another reason to avoid `new` is `constructor` functions
(JS/TS ones) can not be `async`. `new Date()` would only appear in bootstrap, see Rule 1.

**Rule 5**: **Avoid** `export default`

Default exports lead to inconsistent naming on import as each module that is importing has to provide a name to import
as. This can make finding all the usages of a module more complex. It's better to use named imports and have the default
way of importing use the names given by the module. Some tooling forces the use of default exports (e.g. `.vue` file).

**Rule 6**: **Avoid** `null`

`null` is JavaScript is *not* the `null` of other languages, `undefined` is. The TS team's recommendation is to always
use `undefined`. See https://writingjavascript.com/why-you-should-always-use-undefined-and-never-null

Also, `JSON` is a protocal, and not part of the JS spec, so it's lack of `undefined` is not relavant to JS or TS. The
argument that JSON supports the use of `null` in JavaScript is like arguing that Java's use of some feature is relevant
to JavaScript. Just because the names are similar doesn't mean you should apply rules from one to the other.

## Wrapper Modules

Wrappers around third-party modules and sources of IO are essential. If we can't interact with the code it isn't useful.
By definition, you cannot *unit* test a wrapper. A wrapper always involves some external code, so it must be
*integration* tested. This can be scripted (preferred) or done by hand. One other common testing exception is
"bootstrap" code, where-in if the code fails the execution context will fail to start, making the issue immediately 
apparent to the operator as the execution context exits with an error.

Always minimize the surface area of a wrapper. It is tempting to include far too much in the "wrapper", and get out of
having to write automated unit tests for a bunch of code. For example, you could say that logging can't be unit tested
at all, because it is obviously IO. In truth, the only parts that can't be unit tested are the configuration and the IO
to an output stream where the log is recorded.

Abstracting those into wrappers is trivial:

```TypeScript
const logToConsole = (msg: string) => {
  console.error(msg);
};
const readLogConfigRaw = () => {
  // read from where ever
  return logConfigRaw;
};
```

Parsing the config data should be exported and tested as well and not hidden away in the wrapper around getting the raw
config data.

All the other functionality (channel filtering, formatting, etc.) can be unit tested.

# Notes on setting up WSL2 on Win10

In "Turn Windows Features On & Off" enable **Windows Subsysytem for Linux** and the **Virtual Machine Platform**.

Reboot.

run as Administrator

```
wsl --update
wsl --set-default-version 2
```

Then install Ubuntu from the Microsoft Store.

Use

```
wsl --list --verbose
```

To confirm the wsl version.

If you've installed under version 1 use this to update it:

```
wsl --set-version <distro name> 2
```


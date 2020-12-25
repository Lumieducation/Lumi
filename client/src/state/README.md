# State

This directory contains all of the behavior describing the global application state. Folders within this directory reflect sub-trees of the global state tree, each with their own reducer, actions, and selectors.

The root module exports a singleton-instance of a [Redux store](http://redux.js.org/docs/basics/Store.html). The store instance runs dispatched actions against all known reducers.

## Interface

The `index.ts` also exports the state-interface as `IState`.

## Adding to the tree

All the application information and data in Lumi should go through this data flow. When you are creating a new module with new data requirements, you should add them to this global store.

## Code Structure

We use the domain-style where actions, reducers and selectors are grouped by domain.

> It's entirely possible (and encouraged) for a reducer defined in one folder to respond to an action defined in another folder.

[here](https://redux.js.org/faq/code-structure#code-structure)

### Example

```text
state/<domain>/
├── __tests__
├── actions.ts
├── index.ts
├── reducer.ts
├── selectors.ts
└── types.ts
```

-   `__tests__` - unit tests run by jest
-   `actions.ts` - redux actions.
-   `index.ts` - imports the module's actions, reducer and selectors and exports them in one object.
-   `reducer.ts` - redux reudcer.
-   `selectors.ts` - redux selectors
-   `types.ts` - type definitions

### Business logic

https://redux.js.org/faq/code-structure#how-should-i-split-my-logic-between-reducers-and-action-creators-where-should-my-business-logic-go

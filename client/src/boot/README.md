# Boot

This is where all the client-side magic starts.

There is a single entry point for the Webpack client build: `src/index.tsx`, which imports the boot-module from `src/boot/` and calls it immediately.

Those are in roughly chronological order:

- Setting up Sentry for bug reports
- Initializing redux store by importing it from `state/store`.
- Initial rendering the react-root-component from `views/`.
- Creates an empty global window.editor object.

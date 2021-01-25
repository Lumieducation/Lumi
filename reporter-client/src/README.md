# Client

This is the heart of Lumi, the client side application. It's pieced together with webpack from different components.

## Main modules

These are some of the key modules of the application, kept in `client`'s root for clarity:

- `boot` - the booting file that sets up the application.
- `helpers` - helpers used by different modules.
- `state` - the `/state` folder holds the structure of the application global state and data flows.
- `theme` - style options as theme used by [Material-UI](https://material-ui.com/customization/theming/)
- `views` - react components and containers that build up different apps like the H5P Editor

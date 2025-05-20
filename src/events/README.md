# Events

The events folder holds the

- app: events fired from the electron app instance.
  See https://www.electronjs.org/docs/latest/api/app#events for possible events. These events are setup via `src/events/app/setup_app_events.ts`, which is called directly from `src/main.ts`.

- window: events fired from a specific window instance.
  See https://www.electronjs.org/docs/latest/api/browser-window#instance-events for possible events. The window events are setup via `src/events/window/setup_window_events.ts` for a window-instance when creating the window. The window-instance is created from the `window_open` operation in `src/ops/window_open.ts`, which calls `setup_window_events`.

- websocket: events received via websocket. These event come from the client via websockets. Websocket events are initialized via `src/events/websocket/setup_websocket_events.ts`, which is called while booting the websocket-server in `src/boot/websocket.ts`.

/*
Emitted when the user wants to open a file with the application. 
The open-file event is usually emitted when the application is already open and the OS wants to reuse the application to open the file. 
open-file is also emitted when a file is dropped onto the dock and the application is not yet running. 
Make sure to listen for the open-file event very early in your application startup to handle this case (even before the ready event is emitted).
*/

import { app } from 'electron';

export default function open_file(log: any, files: string[]) {
  app.once('open-file', async (event, path) => {
    log.debug('open-file', { path });
    files.push(path);
    event.preventDefault();
  });
}

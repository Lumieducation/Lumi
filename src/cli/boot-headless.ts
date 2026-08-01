import fs from 'fs';
import os from 'os';
import path from 'path';
import bunyan from 'bunyan';

import { Context } from '../boot';
// eslint-disable-next-line import/no-named-as-default
import bootH5PEditor from '../boot/h5p-editor';
import H5PConfig from '../../config/h5p-config';

export interface HeadlessContext extends Context {
  cleanup: () => Promise<void>;
}

export class CliEnvironmentError extends Error {}

/**
 * Boots a minimal, Electron-free Context that reuses the real ops
 * (content_import, content_export_as_html, exportH5P) unchanged.
 *
 * The library cache is the shared one at %APPDATA%\Lumi\libraries (the same
 * cache the GUI and the Python curriculum generator use). Content and
 * temporary files live in a fresh temp directory per run so CLI activity
 * never shows up in the GUI's content list.
 */
export default async function bootHeadless(options?: {
  librariesDir?: string;
}): Promise<HeadlessContext> {
  const log = bunyan.createLogger({
    name: 'lumi-cli',
    stream: process.stderr,
    level: (process.env.LUMI_CLI_LOG_LEVEL as bunyan.LogLevel) ?? 'warn'
  });

  const appData = process.env.APPDATA;
  if (!appData) {
    throw new CliEnvironmentError(
      '%APPDATA% is not set; cannot locate the Lumi library cache.'
    );
  }

  const librariesDir =
    options?.librariesDir ?? path.join(appData, 'Lumi', 'libraries');

  if (!fs.existsSync(librariesDir)) {
    throw new CliEnvironmentError(
      `Library cache not found at "${librariesDir}". Install/open Lumi at least once, ` +
        `or pass --libraries <dir> to point at an existing cache.`
    );
  }

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lumi-cli-'));
  const contentDir = path.join(tmpRoot, 'content');
  const tmpDir = path.join(tmpRoot, 'tmp');
  fs.mkdirSync(contentDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const paths = {
    settings: path.join(tmpRoot, 'settings.json'),
    content: contentDir,
    libraries: librariesDir,
    app: `${__dirname}/../../../`,
    tmp: tmpDir
  };

  const config = await new H5PConfig().load();

  const h5pEditor = await bootH5PEditor(
    config,
    paths.libraries,
    paths.content,
    paths.tmp,
    (key) => key,
    { skipContentTypeCacheUpdate: true }
  );

  const context: HeadlessContext = {
    menu: 'content',
    h5pEditor,
    h5pPlayer: null,
    log,
    is_development: false,
    is_test: false,
    ws: null,
    port: 0,
    translate: ((key: string) => key) as Context['translate'],
    language_code: 'en',
    open_files: [],
    show_no_update_message: true,
    paths,
    update: {
      downloaded: false,
      quit_and_install: false
    },
    cleanup: async () => {
      await fs.promises.rm(tmpRoot, { recursive: true, force: true });
    }
  };

  return context;
}

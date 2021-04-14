import express from 'express';
import { BrowserWindow, dialog } from 'electron';
import * as Sentry from '@sentry/electron';
import fs from 'fs';
import recursiveReaddir from 'recursive-readdir';

import objectHash from 'object-hash';

import { getInteractions, getResult } from '../helpers/xAPI';

import _path from 'path';

export default function (browserWindow: BrowserWindow): express.Router {
    const router = express.Router();

    router.get('/', async (req: express.Request, res) => {
        try {
            const openDialog = await dialog.showOpenDialog(browserWindow, {
                properties: ['openDirectory']
            });

            if (openDialog.canceled) {
                return res.status(499).end();
            }

            const filePath = openDialog.filePaths[0];

            const files = await recursiveReaddir(filePath, ['!*.lumi']);

            if (files.length === 0) {
                return res.status(404).json({
                    message: 'no-valid-files-found'
                });
            }

            const processedFiles = files.map((file) => {
                let data;
                let fileData: any = { file };

                try {
                    fileData = {
                        ...fileData,
                        name: _path.basename(file, '.lumi')
                    };
                } catch (error) {
                    return {
                        ...fileData,
                        error: true,
                        code: 'determine-name'
                    };
                }

                try {
                    data = JSON.parse(
                        fs.readFileSync(file, { encoding: 'utf-8' })
                    );
                } catch (error) {
                    return {
                        file,
                        error: true,
                        code: 'json-parse-error'
                    };
                }

                try {
                    fileData = {
                        ...fileData,
                        contentHash: objectHash(data.contentJson)
                    };
                } catch (error) {
                    return {
                        ...fileData,
                        error: true,
                        code: 'no-content-json'
                    };
                }

                try {
                    const interactions = [];
                    getInteractions(data.contentJson, interactions);

                    if (interactions.length < 1) {
                        interactions.push({
                            name: data.library
                                .replace('H5P.', '')
                                .split(' ')[0],
                            id: 'skip'
                        });
                    }

                    fileData = {
                        ...fileData,
                        interactions
                    };
                } catch (error) {
                    return {
                        ...fileData,
                        error: true,
                        code: 'invalid-interactions'
                    };
                }

                try {
                    const statements = data.xapi;
                    const results = fileData.interactions.map(
                        (interaction) =>
                            getResult(
                                statements,
                                interaction.id === 'skip'
                                    ? undefined
                                    : interaction.id
                            ).score.scaled
                    );

                    fileData = {
                        ...fileData,
                        results
                    };
                } catch (error) {
                    return {
                        ...fileData,
                        error: true,
                        code: 'invalid-statements'
                    };
                }

                return fileData;
            });

            res.status(200).json(processedFiles);
        } catch (error) {
            res.status(500).end();
            Sentry.captureException(error);
        }
    });

    return router;
}

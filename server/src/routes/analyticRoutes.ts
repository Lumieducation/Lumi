import express from 'express';
import { dialog } from 'electron';
import fs from 'fs';
import recursiveReaddir from 'recursive-readdir';

import objectHash from 'object-hash';

import {
    getInteractions,
    IInteraction,
    getResult
} from '@lumieducation/xapi-aggregator';

import _path from 'path';

export default function (): express.Router {
    const router = express.Router();

    router.get('/', async (req: express.Request, res) => {
        const openDialog = await dialog.showOpenDialog({
            filters: [
                {
                    extensions: ['lumi'],
                    name: 'Lumi Report'
                }
            ],
            properties: ['openDirectory']
        });

        if (openDialog.canceled) {
            return res.status(499).end();
        }

        try {
            recursiveReaddir(
                openDialog.filePaths[0],
                ['!*.lumi'],
                (err, files) => {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    if (files.length === 0) {
                        return res.status(404).end();
                    }
                    const userStatements = {};
                    let contentJson;
                    let library: string;
                    let error: boolean = false;

                    files.forEach((f) => {
                        const d = JSON.parse(
                            fs.readFileSync(f, { encoding: 'utf-8' })
                        );

                        userStatements[_path.basename(f, '.lumi')] = d.xapi;

                        if (contentJson && d.contentJson) {
                            if (
                                objectHash(contentJson) !==
                                objectHash(d.contentJson)
                            ) {
                                error = true;
                                res.status(400).json({
                                    message: `${f} is from a different content`
                                });
                            }
                        }

                        contentJson = d.contentJson;
                        library = d.library;
                    });

                    if (error) {
                        return;
                    }
                    const interactions: IInteraction[] = [];

                    try {
                        getInteractions(contentJson, interactions);
                    } catch (error) {
                        return res.status(500).json(error);
                    }

                    if (interactions.length === 0) {
                        interactions.push({
                            name: library.replace('H5P.', '').split(' ')[0],
                            id: 'skip'
                        });
                    }

                    const users = Object.keys(userStatements).map((key) => {
                        return {
                            name: key,
                            id: userStatements[key][0].actor.account.name,
                            results: interactions.map(
                                (interaction) =>
                                    getResult(
                                        userStatements[key],
                                        interaction.id === 'skip'
                                            ? undefined
                                            : interaction.id
                                    ).score.scaled
                            )
                        };
                    });

                    res.status(200).json({
                        interactions,
                        users
                    });
                }
            );
        } catch (error) {
            res.status(500).json(error);
        }
    });

    return router;
}

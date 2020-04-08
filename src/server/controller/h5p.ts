import express from 'express';
import fsExtra from 'fs-extra';
import * as H5P from 'h5p-nodejs-library';

import appConfig from '../config/app-config';
import PlayerRenderer from '../h5p/Player.renderer';
import Logger from '../helper/Logger';

const log = new Logger('controller:h5p');

export default class H5PController {
    constructor(private h5pLibrary: H5P.H5PEditor) {
        log.info(`initialize`);
    }

    public loadPackage = (
        req: express.Request,
        res: express.Response
    ): void => {
        const { contentId } = req.params;

        log.info(`loading package with contentId ${contentId}`);
        this.h5pLibrary
            .getContent(contentId)
            .then(content => {
                log.info(`sending package-data for contentId ${contentId} `);
                res.status(200).json(content);
            })
            .catch(error => {
                log.warn(error);
                res.status(404).end();
            });
    };

    public renderPackage = async (
        req: express.Request,
        res: express.Response
    ): Promise<any> => {
        const { contentId } = req.params;

        log.info(`rendering package with contentId ${contentId}`);

        const player = new H5P.H5PPlayer(
            this.h5pLibrary.libraryStorage,
            this.h5pLibrary.contentStorage,
            this.h5pLibrary.config
        );
        player.setRenderer(PlayerRenderer);

        try {
            const h5pObject = await fsExtra.readFile(
                `${appConfig.workingCachePath}/${contentId}/h5p.json`,
                'utf8'
            );
            const contentObject = await fsExtra.readFile(
                `${appConfig.workingCachePath}/${contentId}/content.json`,
                'utf8'
            );

            const content = JSON.parse(contentObject);
            const h5p = JSON.parse(h5pObject);
            player
                .render(contentId, content, h5p)
                .then(h5pPage => {
                    res.status(200).end(h5pPage);
                })
                .catch(error => {
                    log.error(error);
                    res.status(404).end();
                });
        } catch (error) {
            log.warn(error);
            res.status(404).end();
        }
    };
}

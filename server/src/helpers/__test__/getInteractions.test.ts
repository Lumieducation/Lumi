import { getInteractions } from '../xAPI';

import interactiveVideoContentJson from './data//interactiveVideo/content.json';
import interactiveVideoInteractions from './data/interactiveVideo/interactions.json';

import interactiveBookContent from './data/interactiveBook/content.json';
import interactiveBookInteractions from './data/interactiveBook/interactions.json';

import coursePresentationContent from './data/coursePresentation/content.json';
import coursePresentationInteractions from './data/coursePresentation/interactions.json';

describe('interactions', () => {
    it('ignores the H5P.Image library', (done) => {
        let interactions = [];

        const test = {
            test: {
                library: 'H5P.Image 1.1',
                subContentId: 'a'
            },
            abc: {
                library: 'H5P.TEST 1.66',
                subContentId: 'm'
            }
        };

        getInteractions(test, interactions);

        expect(interactions).toStrictEqual([
            { id: 'm', name: 'TEST', title: undefined }
        ]);
        done();
    });

    it('ignores the H5P.Text library', (done) => {
        let interactions = [];

        const test = {
            test: {
                library: 'H5P.Text 1.1',
                subContentId: 'a'
            },
            abc: {
                library: 'H5P.TEST 1.66',
                subContentId: 'm'
            }
        };

        getInteractions(test, interactions);

        expect(interactions).toStrictEqual([
            { id: 'm', name: 'TEST', title: undefined }
        ]);
        done();
    });

    it('ignores the H5P.Column library', (done) => {
        let interactions = [];

        const test = {
            test: {
                library: 'H5P.Column 1.1',
                subContentId: 'a'
            },
            abc: {
                library: 'H5P.TEST 1.66',
                subContentId: 'm'
            }
        };

        getInteractions(test, interactions);

        expect(interactions).toStrictEqual([
            { id: 'm', name: 'TEST', title: undefined }
        ]);
        done();
    });

    it('ignores the H5P.AdvancedText library', (done) => {
        let interactions = [];

        const test = {
            test: {
                library: 'H5P.AdvancedText 1.1',
                subContentId: 'a'
            },
            abc: {
                library: 'H5P.TEST 1.66',
                subContentId: 'm'
            }
        };

        getInteractions(test, interactions);

        expect(interactions).toStrictEqual([
            { id: 'm', name: 'TEST', title: undefined }
        ]);
        done();
    });

    it('ignores the H5P.Table library', (done) => {
        let interactions = [];

        const test = {
            test: {
                library: 'H5P.Table 1.1',
                subContentId: 'a'
            },
            abc: {
                library: 'H5P.TEST 1.66',
                subContentId: 'm'
            }
        };

        getInteractions(test, interactions);

        expect(interactions).toStrictEqual([
            { id: 'm', name: 'TEST', title: undefined }
        ]);
        done();
    });

    it('ignores the H5P.Video library', (done) => {
        let interactions = [];

        const test = {
            test: {
                library: 'H5P.Video 1.1',
                subContentId: 'a'
            },
            abc: {
                library: 'H5P.TEST 1.66',
                subContentId: 'm'
            }
        };

        getInteractions(test, interactions);

        expect(interactions).toStrictEqual([
            { id: 'm', name: 'TEST', title: undefined }
        ]);
        done();
    });

    it('ignores the H5P.Nil library', (done) => {
        let interactions = [];

        const test = {
            test: {
                library: 'H5P.Nil 1.1',
                subContentId: 'a'
            },
            abc: {
                library: 'H5P.TEST 1.66',
                subContentId: 'm'
            }
        };

        getInteractions(test, interactions);

        expect(interactions).toStrictEqual([
            { id: 'm', name: 'TEST', title: undefined }
        ]);
        done();
    });

    it('[interactive video]: gets all interactions', (done) => {
        let interactions = [];

        getInteractions(interactiveVideoContentJson, interactions);

        expect(interactions).toStrictEqual(interactiveVideoInteractions);
        done();
    });

    it('[interactive book]: gets all interactions ', (done) => {
        let interactions = [];

        getInteractions(interactiveBookContent, interactions);

        expect(interactions).toStrictEqual(interactiveBookInteractions);
        done();
    });

    it('[course presentation]: gets all interactions', (done) => {
        // let interactions = [];

        const interactions = getInteractions(coursePresentationContent, []);

        expect(interactions).toStrictEqual(coursePresentationInteractions);
        done();
    });
});

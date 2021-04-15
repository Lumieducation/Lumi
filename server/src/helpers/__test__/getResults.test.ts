import { getResult } from '../xAPI';

import InteractiveVideoxAPIStatements from './data/interactiveVideo/xAPIStatements.json';
import EssayxAPIStatements from './data/essay/xAPIStatements.json';
import FindTheHotspotxAPIStatement from './data/findTheHotSpot/xAPIStatements.json';

describe('getResult', () => {
    it('gets the result from an xAPI Statements Array with given subContentId', (done) => {
        expect(
            getResult(
                InteractiveVideoxAPIStatements as any,
                '373ad145-4ea2-438a-9575-af316cec1149'
            )
        ).toStrictEqual({
            score: { min: 0, max: 3, raw: 1, scaled: 0.3333 },
            completion: true,
            success: false,
            duration: 'PT23.44S',
            response: '2'
        });
        done();
    });

    it('returns an uncompleted result if not found', (done) => {
        expect(
            getResult(
                InteractiveVideoxAPIStatements as any,
                'wiojefnvqiwenvwqioenv'
            )
        ).toStrictEqual({
            score: { min: 0, max: 0, raw: 0, scaled: 0 },
            completion: false,
            success: false,
            duration: '',
            response: ''
        });
        done();
    });

    it('[essay]: it returns results', (done) => {
        expect(getResult(EssayxAPIStatements as any)).toStrictEqual({
            score: { min: 0, max: 5, raw: 0, scaled: 0 },
            completion: true,
            success: true,
            duration: 'PT5.62S',
            response: 'test '
        });

        done();
    });

    it('[find-the-hotspot]: it returns results', (done) => {
        expect(getResult(FindTheHotspotxAPIStatement as any)).toStrictEqual({
            score: { min: 0, max: 1, raw: 0, scaled: 0 },
            completion: true,
            duration: 'PT3.09S'
        });
        done();
    });
});

import { pieReduce } from '../Data';

describe('pieReduce', () => {
    it('transforms H5P data into Rechart readable pieChart data', done => {
        const data = [
            {
                contentId: 'j2BzrOIUc',
                finished: '1577646562',
                maxScore: '2',
                opened: '1577646520',
                score: '0'
            },
            {
                contentId: 'j2BzrOIUc',
                finished: '1577646586',
                maxScore: '2',
                opened: '1577646582',
                score: '1'
            },
            {
                contentId: 'j2BzrOIUc',
                finished: '1577646586',
                maxScore: '2',
                opened: '1577646582',
                score: '2'
            },
            {
                contentId: 'j2BzrOIUc',
                finished: '1577646586',
                maxScore: '2',
                opened: '1577646582',
                score: '2'
            }
        ];

        const result = pieReduce(data);

        expect(result.length).toBe(3);
        expect(result[0].name).toBe('0 %');
        expect(result[1].name).toBe('100 %');
        expect(result[2].name).toBe('50 %');

        expect(result[0].value).toBe(1);
        expect(result[1].value).toBe(2);
        expect(result[2].value).toBe(1);

        done();
    });
});

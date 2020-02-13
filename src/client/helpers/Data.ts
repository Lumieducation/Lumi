export function pieReduce(data?: any[]): any[] {
    if (!data) {
        return [];
    }
    const o: any = {};

    data.forEach(d => {
        const p = d.score / d.maxScore;

        // tslint:disable-next-line
        if (o[p]) {
            o[p] = o[p] + 1;
        } else {
            o[p] = 1;
        }
    });

    const r = [];

    // tslint:disable-next-line: forin
    for (const k in o) {
        r.push({
            name: `${(parseFloat(k) * 100).toFixed(0)} %`,
            value: o[k]
        });
    }

    return r.sort();
}

export function convert(data: any[]): any[] {
    return data.map(d => {
        return {
            ...d,
            finished: parseInt(d.finished, 10) * 1000,
            maxScore: parseInt(d.maxScore, 10),
            opened: parseInt(d.opened, 10) * 1000,
            score: parseInt(d.score, 10)
        };
    });
}

// export function group(data: any[], type: 'day' | 'hour' | 'month'): any[] {}

export function gradeColor(p: number): string {
    if (p === null) {
        return '#FFFFFF';
    }
    if (p >= 0.85) {
        return '#2ecc71';
    }
    if (p >= 0.7) {
        return '#27ae60';
    }
    if (p >= 0.55) {
        return '#f1c40f';
    }
    if (p >= 0.45) {
        return '#e67e22';
    }
    if (p >= 0.2) {
        return '#e74c3c';
    }
    return '#c0392b';
}

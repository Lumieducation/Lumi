export interface IInteraction {
    id: string;
    name: string;
    title?: string;
}

export interface IxAPIStatementResult {
    score: {
        min: number;
        max: number;
        raw: number;
        scaled: number;
    };
    completion: boolean;
    success?: boolean;
    duration: string;
    response?: string;
}

export interface IxAPIStatement {
    actor: {
        account: string;
        objectType: string;
    };
    verb: {
        id: string;
        display: any;
    };
    object: {
        id: string;
    };
    result?: IxAPIStatementResult;
}

const ignoredInteractionLibraries = [
    'H5P.Image',
    'H5P.Text',
    'H5P.Column',
    'H5P.AdvancedText',
    'H5P.Table',
    'H5P.Video',
    'H5P.Nil',
    'H5P.Link'
];

export function getInteractions(
    data: any,
    interactions: IInteraction[]
): IInteraction[] {
    if (!data) {
        return interactions;
    }
    if (data.subContentId && data.library) {
        if (
            ignoredInteractionLibraries.indexOf(data.library.split(' ')[0]) ===
            -1
        ) {
            interactions.push({
                id: data.subContentId,
                name: data.library.replace('H5P.', '').split(' ')[0],
                title: data.metadata?.title
            });
        }
    }

    if (typeof data === 'object') {
        Object.keys(data).forEach((key) => {
            getInteractions(data[key], interactions);
        });
    }

    return interactions;
}

export function getResult(
    xAPIStatements: IxAPIStatement[],
    subContentId?: string
): IxAPIStatementResult {
    let results = [];
    if (subContentId) {
        results = xAPIStatements.filter(
            (statement) =>
                statement.object.id.indexOf(subContentId) > -1 &&
                statement.result
        );
    } else {
        results = xAPIStatements.filter((statement) => statement.result);
    }

    return results[0] && results[0].result
        ? results[0].result
        : {
              score: { min: 0, max: 0, raw: 0, scaled: 0 },
              completion: false,
              success: false,
              duration: '',
              response: ``
          };
}

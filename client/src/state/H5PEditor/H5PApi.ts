import superagent from 'superagent';

export function loadPlayerContent(
    contentId: string
): Promise<superagent.Response> {
    return superagent.get(`/api/v1/h5p/${contentId}/play`);
}

export function exportContent(
    contentId: string,
    includeReporter: boolean,
    format: 'bundle' | 'external' | 'scorm',
    options: {
        cssPath: string;
        marginX: number;
        marginY: number;
        masteryScore?: string;
        maxWidth: number;
        restrictWidthAndCenter: boolean;
        showEmbed: boolean;
        showRights: boolean;
    }
): Promise<superagent.Response> {
    return superagent.get(
        `/api/v1/h5p/${contentId}/export?includeReporter=${includeReporter}&format=${format}${
            options.masteryScore ? `&masteryScore=${options.masteryScore}` : ''
        }&showRights=${options.showRights.toString()}&showEmbed=${options.showEmbed.toString()}&marginX=${
            options.marginX
        }&marginY=${
            options.marginY
        }&restrictWidthAndCenter=${options.restrictWidthAndCenter.toString()}&maxWidth=${
            options.maxWidth
        }`
    );
}

export function loadEditorContent(
    contentId: string
): Promise<superagent.Response> {
    return superagent.get(`/api/v1/h5p/${contentId}/edit`);
}

export function saveContent(
    contentId: string,
    requestBody: { library: string; params: any }
): Promise<superagent.Response> {
    return superagent
        .patch(`/api/v1/h5p/${contentId}/`)
        .send(requestBody)
        .set('Content-Type', 'application/json');
}

export function createContent(requestBody: {
    library: string;
    params: any;
}): Promise<superagent.Response> {
    return superagent
        .post(`/api/v1/h5p`)
        .send(requestBody)
        .set('Content-Type', 'application/json');
}

export function deleteH5P(contentId: string): Promise<superagent.Response> {
    return superagent.delete(`/api/v1/lumi?contentId=${contentId}`);
}

export function exportH5P(
    contentId: string,
    path?: string
): Promise<superagent.Response> {
    return superagent.get(`/api/v1/lumi?contentId=${contentId}&path=${path}`);
}

export function importH5P(path: string): Promise<superagent.Response> {
    return superagent.post(`/api/v1/lumi`).send({
        path
    });
}

export function updateH5P(
    content: any,
    contentId?: string
): Promise<superagent.Response> {
    return superagent
        .patch(`/api/v1/lumi?contentId=${contentId}`)
        .send(content);
}

export function openFiles(): Promise<superagent.Response> {
    return superagent.get('/api/v1/lumi/open_files');
}

/**
 * Gets the core H5P overview for a single library from the H5P API endpoint.
 * @param ubernameWithWhitespace The ubername with whitespace as separator (e.g.
 * H5P.Example 1.0")
 * @returns a superagent response with the answer in the body. (answer = array
 * of structures)
 */
export function getLibraryOverview(
    ubernameWithWhitespace: string
): Promise<superagent.Response> {
    return superagent
        .post('/api/v1/h5p/ajax?action=libraries')
        .send({ libraries: [ubernameWithWhitespace] });
}

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
    options: { masteryScore?: string }
): Promise<superagent.Response> {
    return superagent.get(
        `/api/v1/h5p/${contentId}/export?includeReporter=${includeReporter}&format=${format}${
            options.masteryScore ? `&masteryScore=${options.masteryScore}` : ''
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

export function getLibraryOverview(
    ubername: string
): Promise<superagent.Response> {
    return superagent
        .post('/api/v1/h5p/ajax?action=libraries')
        .send({ libraries: [ubername] });
}

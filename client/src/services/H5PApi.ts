import superagent from 'superagent';

export function loadPlayerContent(
    contentId: string
): Promise<superagent.Response> {
    return superagent.get(`/api/v1/h5p/${contentId}/play`);
}

export function loadEditorContent(
    contentId: string
): Promise<superagent.Response> {
    return superagent.get(`/api/v1/h5p/${contentId}/edit`);
}

export function updateContent(
    contentId: string,
    requestBody: { library: string; params: any }
): Promise<superagent.Response> {
    return superagent
        .patch(`/api/v1/h5p/${contentId}`)
        .set('Content-Type', 'application/json')
        .send(requestBody);
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
    return superagent.delete(`/api/v1/h5p/${contentId}`);
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
        .post('/h5p/ajax?action=libraries')
        .send({ libraries: [ubernameWithWhitespace] });
}

export async function updateContentTypeCache(): Promise<superagent.Response> {
    return superagent.get(`/api/v1/h5p/content-type-cache/update`);
}

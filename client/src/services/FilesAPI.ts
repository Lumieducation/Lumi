import superagent from 'superagent';

export function exportContent(
    contentId: string,
    includeReporter: boolean,
    format: 'bundle' | 'external' | 'scorm',
    options: {
        addCss: boolean;
        cssFileHandleId: string;
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
        `/api/v1/files/export?contentId=${contentId}&includeReporter=${includeReporter}&format=${format}${
            options.masteryScore ? `&masteryScore=${options.masteryScore}` : ''
        }&showRights=${options.showRights.toString()}&showEmbed=${options.showEmbed.toString()}&marginX=${
            options.marginX
        }&marginY=${
            options.marginY
        }&restrictWidthAndCenter=${options.restrictWidthAndCenter.toString()}&maxWidth=${
            options.maxWidth
        }${options.addCss ? `&cssFileHandleId=${options.cssFileHandleId}` : ''}`
    );
}

export function exportH5P(
    contentId: string,
    fileHandleId?: string
): Promise<superagent.Response> {
    return superagent.post(
        `/api/v1/files/save?contentId=${contentId}&fileHandleId=${fileHandleId}`
    );
}

export function importH5P(fileHandleId: string): Promise<superagent.Response> {
    return superagent.get(`/api/v1/files/open?fileHandleId=${fileHandleId}`);
}

export function pickH5PFiles(): Promise<superagent.Response> {
    return superagent.get('/api/v1/files/pick_h5p_files');
}

export function pickCSSFile(): Promise<superagent.Response> {
    return superagent.get('/api/v1/files/pick_css_file');
}

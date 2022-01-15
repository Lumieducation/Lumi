import { IContentMetadata } from '@lumieducation/h5p-server';
import superagent from 'superagent';

export enum Result {
    Success,
    Cancelled,
    Error
}

/**
 * Calls the export route.
 * @returns the status
 * @throws an error if occurred on the server
 */

export async function exportContent(
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
): Promise<Result> {
    try {
        await superagent.get(
            `/api/v1/files/export?contentId=${contentId}&includeReporter=${includeReporter}&format=${format}${
                options.masteryScore
                    ? `&masteryScore=${options.masteryScore}`
                    : ''
            }&showRights=${options.showRights.toString()}&showEmbed=${options.showEmbed.toString()}&marginX=${
                options.marginX
            }&marginY=${
                options.marginY
            }&restrictWidthAndCenter=${options.restrictWidthAndCenter.toString()}&maxWidth=${
                options.maxWidth
            }${
                options.addCss
                    ? `&cssFileHandleId=${options.cssFileHandleId}`
                    : ''
            }`
        );
    } catch (error: any) {
        if (error.status === 499) {
            return Result.Cancelled;
        }
        throw error;
    }
    return Result.Success;
}

export async function save(
    contentId: string,
    fileHandleId?: string
): Promise<{
    errorText?: string;
    fileHandleId?: string;
    path?: string;
    status: Result;
}> {
    try {
        const result = await superagent.post(
            `/api/v1/files/save?contentId=${contentId}&fileHandleId=${fileHandleId}`
        );
        return {
            status: Result.Success,
            fileHandleId: result.body.fileHandleId,
            path: result.body.path
        };
    } catch (error: any) {
        if (error.status === 499) {
            return {
                status: Result.Cancelled
            };
        }
        return {
            status: Result.Error,
            errorText: `Error while saving H5P: ${error.text}`
        };
    }
}

export async function open(fileHandleId: string): Promise<{
    id: string;
    library: string;
    metadata: IContentMetadata;
    parameters: any;
}> {
    const result = await superagent.get(
        `/api/v1/files/open?fileHandleId=${fileHandleId}`
    );
    if (result.status === 200) {
        return result.body;
    }
    throw new Error('Error while opening H5P');
}

export async function pickH5PFiles(): Promise<
    { fileHandleId: string; path: string }[]
> {
    const result = await superagent.get('/api/v1/files/pick_h5p_files');
    return result.body;
}

export async function pickCSSFile(): Promise<{
    fileHandleId?: string;
    filename?: string;
    status: Result;
}> {
    try {
        const result = await superagent.get('/api/v1/files/pick_css_file');
        return { ...result.body, status: Result.Success };
    } catch (error: any) {
        if (error.status === 499) {
            return { status: Result.Cancelled };
        }
        return { status: Result.Error };
    }
}

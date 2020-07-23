// tslint:disable

import * as request from 'superagent';
import { SuperAgentStatic, SuperAgentRequest, Response } from 'superagent';

export type RequestHeaders = {
    [header: string]: string;
};
export type RequestHeadersHandler = (headers: RequestHeaders) => RequestHeaders;

export type ConfigureAgentHandler = (
    agent: SuperAgentStatic
) => SuperAgentStatic;

export type ConfigureRequestHandler = (
    agent: SuperAgentRequest
) => SuperAgentRequest;

export type CallbackHandler = (err: any, res?: request.Response) => void;

export type H5P = {
    id?: number;
    parameters: {} & {
        [key: string]: any;
    };
    metadata: {} & {
        [key: string]: any;
    };
    library: string;
} & {
    [key: string]: any;
};

export type Filetree = {
    name: string;
    path: string;
    type: string;
    children?: Array<Filetree>;
} & {
    [key: string]: any;
};

export type inline_response_200 = {
    path?: string;
} & {
    [key: string]: any;
};

export type body = {
    path?: string;
} & {
    [key: string]: any;
};

export type body_1 = {
    path?: string;
    name?: string;
    type?: string;
} & {
    [key: string]: any;
};

export type inline_response_201 = {
    path?: string;
    type?: string;
} & {
    [key: string]: any;
};

export type Logger = {
    log: (line: string) => any;
};

export interface ResponseWithBody<S extends number, T> extends Response {
    status: S;
    body: T;
}

export type QueryParameters = {
    [param: string]: any;
};

export interface CommonRequestOptions {
    $queryParameters?: QueryParameters;
    $domain?: string;
    $path?: string | ((path: string) => string);
    $retries?: number; // number of retries; see: https://github.com/visionmedia/superagent/blob/master/docs/index.md#retrying-requests
    $timeout?: number; // request timeout in milliseconds; see: https://github.com/visionmedia/superagent/blob/master/docs/index.md#timeouts
    $deadline?: number; // request deadline in milliseconds; see: https://github.com/visionmedia/superagent/blob/master/docs/index.md#timeouts
}

/**
 * Lumi
 * @class LumiEditorAPI
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export class LumiEditorAPI {
    private domain: string =
        'https://virtserver.swaggerhub.com/JPSchellenberg/Lumi/1.0.0';
    private errorHandlers: CallbackHandler[] = [];
    private requestHeadersHandler?: RequestHeadersHandler;
    private configureAgentHandler?: ConfigureAgentHandler;
    private configureRequestHandler?: ConfigureRequestHandler;

    constructor(domain?: string, private logger?: Logger) {
        if (domain) {
            this.domain = domain;
        }
    }

    getDomain() {
        return this.domain;
    }

    addErrorHandler(handler: CallbackHandler) {
        this.errorHandlers.push(handler);
    }

    setRequestHeadersHandler(handler: RequestHeadersHandler) {
        this.requestHeadersHandler = handler;
    }

    setConfigureAgentHandler(handler: ConfigureAgentHandler) {
        this.configureAgentHandler = handler;
    }

    setConfigureRequestHandler(handler: ConfigureRequestHandler) {
        this.configureRequestHandler = handler;
    }

    private request(
        method: string,
        url: string,
        body: any,
        headers: RequestHeaders,
        queryParameters: QueryParameters,
        form: any,
        reject: CallbackHandler,
        resolve: CallbackHandler,
        opts: CommonRequestOptions
    ) {
        if (this.logger) {
            this.logger.log(`Call ${method} ${url}`);
        }

        const agent = this.configureAgentHandler
            ? this.configureAgentHandler(request.default)
            : request.default;

        let req = agent(method, url);
        if (this.configureRequestHandler) {
            req = this.configureRequestHandler(req);
        }

        req = req.query(queryParameters);

        if (body) {
            req.send(body);

            if (
                typeof body === 'object' &&
                !(body.constructor.name === 'Buffer')
            ) {
                headers['Content-Type'] = 'application/json';
            }
        }

        if (Object.keys(form).length > 0) {
            req.type('form');
            req.send(form);
        }

        if (this.requestHeadersHandler) {
            headers = this.requestHeadersHandler({
                ...headers
            });
        }

        req.set(headers);

        if (opts.$retries && opts.$retries > 0) {
            req.retry(opts.$retries);
        }

        if (
            (opts.$timeout && opts.$timeout > 0) ||
            (opts.$deadline && opts.$deadline > 0)
        ) {
            req.timeout({
                deadline: opts.$deadline,
                response: opts.$timeout
            });
        }

        req.end((error, response) => {
            // an error will also be emitted for a 4xx and 5xx status code
            // the error object will then have error.status and error.response fields
            // see superagent error handling: https://github.com/visionmedia/superagent/blob/master/docs/index.md#error-handling
            if (error) {
                reject(error);
                this.errorHandlers.forEach((handler) => handler(error));
            } else {
                resolve(response);
            }
        });
    }

    private convertParameterCollectionFormat<T>(
        param: T,
        collectionFormat: string | undefined
    ): T | string {
        if (Array.isArray(param) && param.length >= 2) {
            switch (collectionFormat) {
                case 'csv':
                    return param.join(',');
                case 'ssv':
                    return param.join(' ');
                case 'tsv':
                    return param.join('\t');
                case 'pipes':
                    return param.join('|');
                default:
                    return param;
            }
        }

        return param;
    }

    exportH5PURL(
        parameters: {
            path: string;
            contentId: number;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['path'] !== undefined) {
            queryParameters['path'] = this.convertParameterCollectionFormat(
                parameters['path'],
                ''
            );
        }

        if (parameters['contentId'] !== undefined) {
            queryParameters[
                'contentId'
            ] = this.convertParameterCollectionFormat(
                parameters['contentId'],
                ''
            );
        }

        if (parameters.$queryParameters) {
            queryParameters = {
                ...queryParameters,
                ...parameters.$queryParameters
            };
        }

        let keys = Object.keys(queryParameters);
        return (
            domain +
            path +
            (keys.length > 0
                ? '?' +
                  keys
                      .map(
                          (key) =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
     * exports a .h5p file to the filesystem
     * @method
     * @name LumiEditorAPI#exportH5P
     * @param {string} path - Lumi
     * @param {number} contentId - Lumi
     */
    exportH5P(
        parameters: {
            path: string;
            contentId: number;
        } & CommonRequestOptions
    ): Promise<
        ResponseWithBody<200, inline_response_200> | ResponseWithBody<403, void>
    > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        let body: any;
        let queryParameters: QueryParameters = {};
        let headers: RequestHeaders = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['path'] !== undefined) {
                queryParameters['path'] = this.convertParameterCollectionFormat(
                    parameters['path'],
                    ''
                );
            }

            if (parameters['path'] === undefined) {
                reject(new Error('Missing required  parameter: path'));
                return;
            }

            if (parameters['contentId'] !== undefined) {
                queryParameters[
                    'contentId'
                ] = this.convertParameterCollectionFormat(
                    parameters['contentId'],
                    ''
                );
            }

            if (parameters['contentId'] === undefined) {
                reject(new Error('Missing required  parameter: contentId'));
                return;
            }

            if (parameters.$queryParameters) {
                queryParameters = {
                    ...queryParameters,
                    ...parameters.$queryParameters
                };
            }

            this.request(
                'GET',
                domain + path,
                body,
                headers,
                queryParameters,
                form,
                reject,
                resolve,
                parameters
            );
        });
    }

    importH5PURL(
        parameters: {
            body: body;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters.$queryParameters) {
            queryParameters = {
                ...queryParameters,
                ...parameters.$queryParameters
            };
        }

        queryParameters = {};

        let keys = Object.keys(queryParameters);
        return (
            domain +
            path +
            (keys.length > 0
                ? '?' +
                  keys
                      .map(
                          (key) =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
     * imports h5p from the filesystem to the working cache
     * @method
     * @name LumiEditorAPI#importH5P
     * @param {} body - path
     */
    importH5P(
        parameters: {
            body: body;
        } & CommonRequestOptions
    ): Promise<
        | ResponseWithBody<200, H5P>
        | ResponseWithBody<404, void>
        | ResponseWithBody<406, void>
    > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        let body: any;
        let queryParameters: QueryParameters = {};
        let headers: RequestHeaders = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['body'] !== undefined) {
                body = parameters['body'];
            }

            if (parameters['body'] === undefined) {
                reject(new Error('Missing required  parameter: body'));
                return;
            }

            if (parameters.$queryParameters) {
                queryParameters = {
                    ...queryParameters,
                    ...parameters.$queryParameters
                };
            }

            form = queryParameters;
            queryParameters = {};

            this.request(
                'POST',
                domain + path,
                body,
                headers,
                queryParameters,
                form,
                reject,
                resolve,
                parameters
            );
        });
    }

    deleteH5PURL(
        parameters: {
            contentId: number;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['contentId'] !== undefined) {
            queryParameters[
                'contentId'
            ] = this.convertParameterCollectionFormat(
                parameters['contentId'],
                ''
            );
        }

        if (parameters.$queryParameters) {
            queryParameters = {
                ...queryParameters,
                ...parameters.$queryParameters
            };
        }

        let keys = Object.keys(queryParameters);
        return (
            domain +
            path +
            (keys.length > 0
                ? '?' +
                  keys
                      .map(
                          (key) =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
     * removes a h5p from working cache
     * @method
     * @name LumiEditorAPI#deleteH5P
     * @param {number} contentId - Lumi
     */
    deleteH5P(
        parameters: {
            contentId: number;
        } & CommonRequestOptions
    ): Promise<
        | ResponseWithBody<200, void>
        | ResponseWithBody<404, void>
        | ResponseWithBody<500, void>
    > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        let body: any;
        let queryParameters: QueryParameters = {};
        let headers: RequestHeaders = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['contentId'] !== undefined) {
                queryParameters[
                    'contentId'
                ] = this.convertParameterCollectionFormat(
                    parameters['contentId'],
                    ''
                );
            }

            if (parameters['contentId'] === undefined) {
                reject(new Error('Missing required  parameter: contentId'));
                return;
            }

            if (parameters.$queryParameters) {
                queryParameters = {
                    ...queryParameters,
                    ...parameters.$queryParameters
                };
            }

            this.request(
                'DELETE',
                domain + path,
                body,
                headers,
                queryParameters,
                form,
                reject,
                resolve,
                parameters
            );
        });
    }

    updateH5PURL(
        parameters: {
            contentId?: number;
            h5P?: H5P;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['contentId'] !== undefined) {
            queryParameters[
                'contentId'
            ] = this.convertParameterCollectionFormat(
                parameters['contentId'],
                ''
            );
        }

        if (parameters.$queryParameters) {
            queryParameters = {
                ...queryParameters,
                ...parameters.$queryParameters
            };
        }

        let keys = Object.keys(queryParameters);
        return (
            domain +
            path +
            (keys.length > 0
                ? '?' +
                  keys
                      .map(
                          (key) =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
    * by patching a h5p you either update a given h5p by its id or if you omit the id you create a new one.

    * @method
    * @name LumiEditorAPI#updateH5P
         * @param {number} contentId - pass an optional contentId
         * @param {} h5P - Lumi
    */
    updateH5P(
        parameters: {
            contentId?: number;
            h5P?: H5P;
        } & CommonRequestOptions
    ): Promise<ResponseWithBody<200, H5P> | ResponseWithBody<400, void>> {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        let body: any;
        let queryParameters: QueryParameters = {};
        let headers: RequestHeaders = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['contentId'] !== undefined) {
                queryParameters[
                    'contentId'
                ] = this.convertParameterCollectionFormat(
                    parameters['contentId'],
                    ''
                );
            }

            if (parameters['h5P'] !== undefined) {
                body = parameters['h5P'];
            }

            if (parameters.$queryParameters) {
                queryParameters = {
                    ...queryParameters,
                    ...parameters.$queryParameters
                };
            }

            this.request(
                'PATCH',
                domain + path,
                body,
                headers,
                queryParameters,
                form,
                reject,
                resolve,
                parameters
            );
        });
    }

    getFiletreeURL(
        parameters: {
            path?: string;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/fs';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['path'] !== undefined) {
            queryParameters['path'] = this.convertParameterCollectionFormat(
                parameters['path'],
                ''
            );
        }

        if (parameters.$queryParameters) {
            queryParameters = {
                ...queryParameters,
                ...parameters.$queryParameters
            };
        }

        let keys = Object.keys(queryParameters);
        return (
            domain +
            path +
            (keys.length > 0
                ? '?' +
                  keys
                      .map(
                          (key) =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
    * getting the filetree for a given path

    * @method
    * @name LumiEditorAPI#getFiletree
         * @param {string} path - pass an optional path
    */
    getFiletree(
        parameters: {
            path?: string;
        } & CommonRequestOptions
    ): Promise<ResponseWithBody<200, Filetree> | ResponseWithBody<404, void>> {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/fs';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        let body: any;
        let queryParameters: QueryParameters = {};
        let headers: RequestHeaders = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['path'] !== undefined) {
                queryParameters['path'] = this.convertParameterCollectionFormat(
                    parameters['path'],
                    ''
                );
            }

            if (parameters.$queryParameters) {
                queryParameters = {
                    ...queryParameters,
                    ...parameters.$queryParameters
                };
            }

            this.request(
                'GET',
                domain + path,
                body,
                headers,
                queryParameters,
                form,
                reject,
                resolve,
                parameters
            );
        });
    }

    createFSURL(
        parameters: {
            body: body_1;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/fs';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters.$queryParameters) {
            queryParameters = {
                ...queryParameters,
                ...parameters.$queryParameters
            };
        }

        queryParameters = {};

        let keys = Object.keys(queryParameters);
        return (
            domain +
            path +
            (keys.length > 0
                ? '?' +
                  keys
                      .map(
                          (key) =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
    * create a folder at a given path

    * @method
    * @name LumiEditorAPI#createFS
         * @param {} body - path, name and type of the file/directory to be created
    */
    createFS(
        parameters: {
            body: body_1;
        } & CommonRequestOptions
    ): Promise<
        ResponseWithBody<201, inline_response_201> | ResponseWithBody<404, void>
    > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/fs';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        let body: any;
        let queryParameters: QueryParameters = {};
        let headers: RequestHeaders = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['body'] !== undefined) {
                body = parameters['body'];
            }

            if (parameters['body'] === undefined) {
                reject(new Error('Missing required  parameter: body'));
                return;
            }

            if (parameters.$queryParameters) {
                queryParameters = {
                    ...queryParameters,
                    ...parameters.$queryParameters
                };
            }

            form = queryParameters;
            queryParameters = {};

            this.request(
                'POST',
                domain + path,
                body,
                headers,
                queryParameters,
                form,
                reject,
                resolve,
                parameters
            );
        });
    }

    deleteFSURL(
        parameters: {
            path: string;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/fs';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['path'] !== undefined) {
            queryParameters['path'] = this.convertParameterCollectionFormat(
                parameters['path'],
                ''
            );
        }

        if (parameters.$queryParameters) {
            queryParameters = {
                ...queryParameters,
                ...parameters.$queryParameters
            };
        }

        let keys = Object.keys(queryParameters);
        return (
            domain +
            path +
            (keys.length > 0
                ? '?' +
                  keys
                      .map(
                          (key) =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
    * delete a driectory or file

    * @method
    * @name LumiEditorAPI#deleteFS
         * @param {string} path - name for the folder/file to be deleted
    */
    deleteFS(
        parameters: {
            path: string;
        } & CommonRequestOptions
    ): Promise<ResponseWithBody<200, void> | ResponseWithBody<400, void>> {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/fs';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        let body: any;
        let queryParameters: QueryParameters = {};
        let headers: RequestHeaders = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['path'] !== undefined) {
                queryParameters['path'] = this.convertParameterCollectionFormat(
                    parameters['path'],
                    ''
                );
            }

            if (parameters['path'] === undefined) {
                reject(new Error('Missing required  parameter: path'));
                return;
            }

            if (parameters.$queryParameters) {
                queryParameters = {
                    ...queryParameters,
                    ...parameters.$queryParameters
                };
            }

            this.request(
                'DELETE',
                domain + path,
                body,
                headers,
                queryParameters,
                form,
                reject,
                resolve,
                parameters
            );
        });
    }

    mvURL(
        parameters: {
            old: string;
            new: string;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/fs';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['old'] !== undefined) {
            queryParameters['old'] = this.convertParameterCollectionFormat(
                parameters['old'],
                ''
            );
        }

        if (parameters['new'] !== undefined) {
            queryParameters['new'] = this.convertParameterCollectionFormat(
                parameters['new'],
                ''
            );
        }

        if (parameters.$queryParameters) {
            queryParameters = {
                ...queryParameters,
                ...parameters.$queryParameters
            };
        }

        let keys = Object.keys(queryParameters);
        return (
            domain +
            path +
            (keys.length > 0
                ? '?' +
                  keys
                      .map(
                          (key) =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
    * rename a folder or file

    * @method
    * @name LumiEditorAPI#mv
         * @param {string} old - name for the folder/file to be moved
         * @param {string} new - path where the folder/file should be moved
    */
    mv(
        parameters: {
            old: string;
            new: string;
        } & CommonRequestOptions
    ): Promise<ResponseWithBody<200, void> | ResponseWithBody<400, void>> {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/fs';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        let body: any;
        let queryParameters: QueryParameters = {};
        let headers: RequestHeaders = {};
        let form: any = {};
        return new Promise((resolve, reject) => {
            headers['Accept'] = 'application/json';

            if (parameters['old'] !== undefined) {
                queryParameters['old'] = this.convertParameterCollectionFormat(
                    parameters['old'],
                    ''
                );
            }

            if (parameters['old'] === undefined) {
                reject(new Error('Missing required  parameter: old'));
                return;
            }

            if (parameters['new'] !== undefined) {
                queryParameters['new'] = this.convertParameterCollectionFormat(
                    parameters['new'],
                    ''
                );
            }

            if (parameters['new'] === undefined) {
                reject(new Error('Missing required  parameter: new'));
                return;
            }

            if (parameters.$queryParameters) {
                queryParameters = {
                    ...queryParameters,
                    ...parameters.$queryParameters
                };
            }

            this.request(
                'PATCH',
                domain + path,
                body,
                headers,
                queryParameters,
                form,
                reject,
                resolve,
                parameters
            );
        });
    }
}

export default LumiEditorAPI;

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

export type Analytics = {
    contentId: string;
    score: string;
    maxScore: string;
    opened: string;
    finished: string;
} & {
    [key: string]: any;
};

export type H5P = {
    id: string;
    metadata?: {} & {
        [key: string]: any;
    };
    parameters?: {} & {
        [key: string]: any;
    };
} & {
    [key: string]: any;
};

export type Error = {
    code: string;
    status: number;
    message: string;
} & {
    [key: string]: any;
};

export type inline_response_201 = {
    analytics_id?: string;
    h5p_id?: string;
} & {
    [key: string]: any;
};

export type inline_response_200 = {
    _id?: string;
    data?: Array<Analytics>;
    h5p_id?: string;
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
 * LumiRun API
 * @class LumiRunAPI
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export class LumiRunAPI {
    private domain: string = '';
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
                this.errorHandlers.forEach(handler => handler(error));
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

    runh5pURL(
        parameters: {
            id: string;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/v0/h5p';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['id'] !== undefined) {
            queryParameters['id'] = this.convertParameterCollectionFormat(
                parameters['id'],
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
                          key =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
    * Renders H5P

    * @method
    * @name LumiRunAPI#runh5p
         * @param {string} id - H5P id
    */
    runh5p(
        parameters: {
            id: string;
        } & CommonRequestOptions
    ): Promise<ResponseWithBody<200, void> | ResponseWithBody<404, Error>> {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/v0/h5p';
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
            headers['Accept'] = 'text/html';

            if (parameters['id'] !== undefined) {
                queryParameters['id'] = this.convertParameterCollectionFormat(
                    parameters['id'],
                    ''
                );
            }

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
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

    addh5pURL(
        parameters: {
            h5P?: {};
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/v0/h5p';
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
                          key =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
     * Upload a valid H5P to Lumi Run
     * @method
     * @name LumiRunAPI#addh5p
     * @param {file} h5P - The file to upload.
     */
    addh5p(
        parameters: {
            h5P?: {};
        } & CommonRequestOptions
    ): Promise<
        | ResponseWithBody<201, inline_response_201>
        | ResponseWithBody<400, Error>
    > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/v0/h5p';
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
            headers['Content-Type'] = 'multipart/form-data';

            if (parameters['h5P'] !== undefined) {
                form['h5p'] = parameters['h5P'];
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

    getAnalyticsURL(
        parameters: {
            id: string;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/v0/analytics';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['id'] !== undefined) {
            queryParameters['id'] = this.convertParameterCollectionFormat(
                parameters['id'],
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
                          key =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
    * Returns analytics

    * @method
    * @name LumiRunAPI#getAnalytics
         * @param {string} id - Analytics id
    */
    getAnalytics(
        parameters: {
            id: string;
        } & CommonRequestOptions
    ): Promise<
        | ResponseWithBody<200, inline_response_200>
        | ResponseWithBody<404, Error>
    > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/v0/analytics';
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

            if (parameters['id'] !== undefined) {
                queryParameters['id'] = this.convertParameterCollectionFormat(
                    parameters['id'],
                    ''
                );
            }

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
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

    postAnalyticsURL(
        parameters: {
            h5PId: string;
            body: Analytics;
        } & CommonRequestOptions
    ): string {
        let queryParameters: QueryParameters = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/v0/analytics';
        if (parameters.$path) {
            path =
                typeof parameters.$path === 'function'
                    ? parameters.$path(path)
                    : parameters.$path;
        }

        if (parameters['h5PId'] !== undefined) {
            queryParameters['h5p_id'] = this.convertParameterCollectionFormat(
                parameters['h5PId'],
                ''
            );
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
                          key =>
                              key +
                              '=' +
                              encodeURIComponent(queryParameters[key])
                      )
                      .join('&')
                : '')
        );
    }

    /**
    * Returns analytics

    * @method
    * @name LumiRunAPI#postAnalytics
         * @param {string} h5PId - H5P id
         * @param {} body - LumiRun API
    */
    postAnalytics(
        parameters: {
            h5PId: string;
            body: Analytics;
        } & CommonRequestOptions
    ): Promise<ResponseWithBody<200, void> | ResponseWithBody<404, Error>> {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/v0/analytics';
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

            if (parameters['h5PId'] !== undefined) {
                queryParameters[
                    'h5p_id'
                ] = this.convertParameterCollectionFormat(
                    parameters['h5PId'],
                    ''
                );
            }

            if (parameters['h5PId'] === undefined) {
                reject(new Error('Missing required  parameter: h5PId'));
                return;
            }

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
}

export default LumiRunAPI;

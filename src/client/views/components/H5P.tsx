// tslint:disable
import * as React from 'react';

import Logger from '../../helpers/Logger';

import H5PView from './H5PView';

import { Modes } from 'state/ui/types';

declare var window: any, H5PEditor: any, H5P: any, H5PIntegration: any;

const log = new Logger('components:Editor');

interface IPassedProps {
    contentId?: number;
    tabId: string;
    update: (prarms: any, library: string) => void;
    mode: Modes;
}

interface IStateProps extends IPassedProps {}

interface IDispatchProps {}
interface IProps extends IStateProps, IDispatchProps {}

interface IComponentState {}

export default class Editor extends React.Component<IProps, IComponentState> {
    constructor(props: IProps) {
        super(props);

        this.state = {};
    }

    private editor: any;

    public componentWillUnmount(): void {
        log.info(`unmounting`);
    }

    public componentDidMount(): void {
        const self = this;
        var ns = H5PEditor;

        (function($) {
            H5PEditor.init = function() {
                H5PEditor.$ = H5P.jQuery;
                H5PEditor.basePath = H5PIntegration.editor.libraryUrl;
                H5PEditor.fileIcon = H5PIntegration.editor.fileIcon;
                H5PEditor.ajaxPath = H5PIntegration.editor.ajaxPath;
                H5PEditor.filesPath = H5PIntegration.editor.filesPath;
                H5PEditor.apiVersion = H5PIntegration.editor.apiVersion;

                // Semantics describing what copyright information can be stored for media.
                H5PEditor.copyrightSemantics =
                    H5PIntegration.editor.copyrightSemantics;
                H5PEditor.metadataSemantics =
                    H5PIntegration.editor.metadataSemantics;

                // Required styles and scripts for the editor
                H5PEditor.assets = H5PIntegration.editor.assets;

                H5PEditor.filesPath = `/api/v0/h5p/content/${self.props.contentId}/content`;

                // Required for assets
                H5PEditor.baseUrl = '/api/v0/h5p';

                if (H5PIntegration.editor.nodeVersionId !== undefined) {
                    H5PEditor.contentId = H5PIntegration.editor.nodeVersionId;
                }

                var $editor = $('.h5p-editor');

                $.ajax({
                    type: 'GET',
                    url: '/api/v0/h5p/package/' + self.props.contentId,
                    success: function(res: any) {
                        window.editor[self.props.tabId] = new ns.Editor(
                            res.library,
                            JSON.stringify(res.params),
                            $editor[0]
                        );
                    },
                    error: function(res: any) {
                        window.editor[self.props.tabId] = new ns.Editor(
                            undefined,
                            undefined,
                            $editor[0]
                        );
                    }
                });
            };

            H5PEditor.getAjaxUrl = function(action: any, parameters: any) {
                var url = H5PIntegration.editor.ajaxPath + action;

                if (parameters !== undefined) {
                    for (var property in parameters) {
                        if (parameters.hasOwnProperty(property)) {
                            url += '&' + property + '=' + parameters[property];
                        }
                    }
                }

                url += window.location.search.replace(/\?/g, '&');
                return url;
            };

            $(document).ready(H5PEditor.init);
        })(H5P.jQuery);
    }

    public render(): JSX.Element {
        const { contentId, mode } = this.props;

        return (
            <div id="h5p">
                {mode === Modes.view ? (
                    <H5PView contentId={contentId || 0} />
                ) : null}

                <div
                    style={{
                        display: mode === Modes.edit ? 'block' : 'none'
                    }}
                >
                    <div className="h5p-editor" />
                </div>
            </div>
        );
    }
}

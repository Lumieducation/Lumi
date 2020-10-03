export type ContentId = number;
export type TabState =
    | 'savingSuccess'
    | 'savingError'
    | 'saving'
    | 'error'
    | 'closing'
    | 'opening'
    | 'success';

export const TABS_OPEN_TAB = 'TABS_OPEN_TAB';
export const TABS_CLOSE_TAB = 'TABS_CLOSE_TAB';
export const TABS_SELECT_TAB = 'TABS_SELECT_TAB';
export const TABS_RESET_SAVINGSTATE = 'TABS_RESET_SAVINGSTATE';
export const TABS_UPDATE_TAB = 'TABS_UPDATE_TAB';

export interface ITab {
    contentId?: ContentId;
    id: string;
    loadingIndicator: boolean;
    mainLibrary: string;
    name: string;
    path?: string;
    state: TabState;
}
export interface ITabState {
    activeTabIndex: number;
    list: ITab[];
}

export interface IState {
    tabs: ITabState;
}
export interface IOpenTabAction {
    payload: {
        tab: ITab;
    };
    type: typeof TABS_OPEN_TAB;
}

export interface ITabUpdateAction {
    payload: {
        tabId: string;
        update: any;
    };
    type: typeof TABS_UPDATE_TAB;
}
export interface ICloseTabAction {
    payload: {
        id: string;
    };
    type: typeof TABS_CLOSE_TAB;
}

export interface ITabResetSavingState {
    payload: {
        contentId: ContentId;
    };
    type: typeof TABS_RESET_SAVINGSTATE;
}

export interface ISelectTabAction {
    payload: {
        value: number;
    };
    type: typeof TABS_SELECT_TAB;
}
export type TabActionTypes =
    | ITabResetSavingState
    | ICloseTabAction
    | IOpenTabAction
    | ISelectTabAction
    | ITabUpdateAction;

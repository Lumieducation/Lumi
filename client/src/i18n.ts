interface ITranslation {
    editor: {
        tab: {
            view: string;
            edit: string;
        };
        sidebar: {
            open: string;
            create: string;
            noOpenFiles: string;
        };
        startPage: {
            welcomeMessage: string;
            open: string;
            create: string;
            start: string;
        };
    };
    analytics: {
        startPage: {
            welcomeMessage: string;
            open: string;
        };
    };
}

const en: ITranslation = {
    editor: {
        tab: {
            view: 'View',
            edit: 'Edit'
        },
        sidebar: {
            open: 'Open H5P File',
            create: 'New H5P file',
            noOpenFiles: 'No opened files'
        },
        startPage: {
            welcomeMessage:
                "Lumi's H5P Editor is a standalone application that lets you view, edit and create H5P.",
            open: 'Open existing H5P',
            create: 'create new H5P',
            start: 'start'
        }
    },
    analytics: {
        startPage: {
            welcomeMessage:
                "Lumi's Analytics tool lets you import user reports and visualizes them for you",
            open: 'Import .lumi files'
        }
    }
};
// const de: ITranslation = {
//     editor: {
//         tab: {
//             view: 'Ansehen',
//             edit: 'Bearbeiten'
//         },
//         sidebar: {
//             open: 'H5P Datei öffnen',
//             create: 'Neue H5P Datei erstellen',
//             noOpenFiles: 'Keine geöffneten Dateien'
//         },
//         startPage: {
//             welcomeMessage:
//                 "Lumi's H5P Editor lässt dich H5P erstellen, ansehen und editieren",
//             open: 'Existierende H5P öffnen',
//             create: 'Neues H5P erstellen',
//             start: 'Start'
//         }
//     }
// };

const translations = {
    en
};

export default translations as any;

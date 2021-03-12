// Imports the Google Cloud client library
const { Translate } = require("@google-cloud/translate").v2;
const fs = require("fs-extra");

const i18n = {
  editor: {
    tab: {
      view: "View",
      edit: "Edit",
    },
    sidebar: {
      open: "Open H5P File",
      create: "New H5P file",
      noOpenFiles: "No opened files",
    },
    startPage: {
      title: "H5P Editor",
      welcomeMessage:
        "Lumi's H5P Editor is a standalone application that lets you view, edit and create H5P.",
      open: "Open existing H5P",
      create: "create new H5P",
      start: "start",
    },
  },
  settings: {
    appbar: {
      label: "Settings",
      save: "Save",
    },
    enable: "Enable",
  },
  analytics: {
    startPage: {
      title: "Lumi Analytics",
      welcomeMessage:
        "Lumi's Analytics tool lets you import user reports and visualizes them for you",
      open: "Import .lumi files",
      start: "Start",
      learn_more: "learn more",
    },
  },
  bug_report: {
    title: "Bug & Crash Reports",
    description:
      "Help us improve our software and services by sending anonymous crash & bug reports.",
    consent: "I allow this application to send bug & crash reports.",
  },
  usage_statistics: {
    title: "Usage Statistics",
    description:
      " Help us improve our software and services by sending anonymous usage statistics.",
    consent: "I allow this application to send anonymous usage statistics.",
  },
  updates: {
    title: "Automatic Updates",
    description: "Get the latest version automatically.",
    consent: "I allow this application to automatically check for updates.",
  },
  language: {
    title: "Language",
    description: "Change the language of the application.",
  },
  privacy_policy: {
    title: "Privacy Policy",
    consent: "I have read and consent to the privacy policy.",
  },
  setup_dialog: {
    description:
      "Protecting the individual's privacy is important for us. We only collect the information you choose to give us, and we process it with your consent. We want to be as transparent as possible. However Lumi relies on some connections and data transfers to work.",
    save: "Save",
    consent_warning:
      "You need to at least consent to the privacy policy to use this application.",
  },
  menu: {
    file: {
      label: "File",
      open: "Open Analytic Files",
      save: "Save",
      save_as: "Save as...",
      export: "Export...",
      edit: "Edit",
      undo: "Undo",
      redo: "Redo",
      cut: "Cut",
      copy: "Copy",
      paste: "Paste",
      select_all: "Select All",
    },
    h5peditor: {
      new: "New H5P",
      open: "Open H5P",
    },
    help: {
      label: "Help",
      report_issue: "Report Issue",
      toggle_developer_tools: "Toggle Developer Tools",
      follow_us_on_twitter: "Follow Us on Twitter",
    },
  },
};

// Creates a client
const translate = new Translate();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// const text = "The text to translate, e.g. Hello, world!";
// const target = "cs"; // 'The target language, e.g. ru';

const targets = [
  "bg",
  "bs",
  "ca",
  "cs",
  "de",
  "el",
  "et",
  "eu",
  "fi",
  "fr",
  "it",
  "km",
  "ko",
  "nb",
  "nl",
  "nn",
  "pt",
  "ru",
  "sl",
  "sv",
  "tr",
  "zh",
];
async function translateText(o, target) {
  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.

  for (let key in o) {
    if (typeof o[key] === "string") {
      //   console.log("translating", o[key]);
      let [translations] = await translate.translate(o[key], target);
      //   translations = Array.isArray(translations)
      //     ? translations
      //     : [translations];

      o[key] = translations;
    } else if (typeof o[key] === "object") {
      await translateText(o[key], target);
    }
  }

  //   console.log(o);
  //   console.log('Translations:');
  //   translations.forEach((translation, i) => {
  //     console.log(`${text[i]} => (${target}) ${translation}`);
  //   });
}

async function test() {
  for (var i in targets) {
    const t = {
      editor: {
        default_name: "new H5P",
        tab: {
          view: "View",
          edit: "Edit",
        },
        sidebar: {
          open: "Open H5P File",
          create: "New H5P file",
          noOpenFiles: "No opened files",
        },
        startPage: {
          title: "H5P Editor",
          welcomeMessage:
            "Lumi's H5P Editor is a standalone application that lets you view, edit and create H5P.",
          open: "Open existing H5P",
          create: "create new H5P",
          start: "start",
        },
      },
      settings: {
        appbar: {
          label: "Settings",
          save: "Save",
        },
        enable: "Enable",
      },
      analytics: {
        startPage: {
          title: "Lumi Analytics",
          welcomeMessage:
            "Lumi's Analytics tool lets you import user reports and visualizes them for you",
          open: "Import .lumi files",
          start: "Start",
          learn_more: "learn more",
        },
      },
      bug_report: {
        title: "Bug & Crash Reports",
        description:
          "Help us improve our software and services by sending anonymous crash & bug reports.",
        consent: "I allow this application to send bug & crash reports.",
      },
      usage_statistics: {
        title: "Usage Statistics",
        description:
          " Help us improve our software and services by sending anonymous usage statistics.",
        consent: "I allow this application to send anonymous usage statistics.",
      },
      updates: {
        title: "Automatic Updates",
        description: "Get the latest version automatically.",
        consent: "I allow this application to automatically check for updates.",
      },
      language: {
        title: "Language",
        description: "Change the language of the application.",
        help_translate: "Help us translate!",
      },
      privacy_policy: {
        title: "Privacy Policy",
        consent: "I have read and consent to the privacy policy.",
      },
      setup_dialog: {
        description:
          "Protecting the individual's privacy is important for us. We only collect the information you choose to give us, and we process it with your consent. We want to be as transparent as possible. However Lumi relies on some connections and data transfers to work.",
        save: "Save",
        consent_warning:
          "You need to at least consent to the privacy policy to use this application.",
      },
      menu: {
        quit: "Quit",
        file: {
          label: "File",
          open: "Open Analytic Files",
          save: "Save",
          save_as: "Save as...",
          export: "Export...",
          edit: "Edit",
          undo: "Undo",
          redo: "Redo",
          cut: "Cut",
          copy: "Copy",
          paste: "Paste",
          select_all: "Select All",
        },
        h5peditor: {
          new: "New H5P",
          open: "Open H5P",
        },
        help: {
          label: "Help",
          report_issue: "Report Issue",
          toggle_developer_tools: "Toggle Developer Tools",
          follow_us_on_twitter: "Follow Us on Twitter",
        },
      },
      notifications: {
        analytics: {
          import: {
            error: "No valid files found",
            success: "Imported report files",
          },
        },
        h5peditor: {
          save: {
            success: "H5P saved!",
            error: "H5P could not be saved.",
          },
          open: {
            error: "Could not open H5P.",
          },
          export_as_html: {
            success: "H5P successfully exported as HTML",
            error: "Could not export H5P as HTML",
          },
        },
        export_as_html: {
          dialog: {
            title: "Lumi reporter",
            description:
              "Do you want to include a reporter in your html? Learn more about it",
            yes: "yes",
            no: "no",
            here: "here",
          },
        },
      },
    };

    console.log(targets[i]);
    await translateText(t, targets[i]);

    await fs.writeJSON(`${__dirname}/${targets[i]}.json`, t);
  }
}

test();

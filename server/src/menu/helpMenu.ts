import electron, { dialog } from 'electron';
import i18next from 'i18next';
import { getPlatformInformation } from '../services/platformInformation';

export default function (window: electron.BrowserWindow): any {
    return {
        label: i18next.t('lumi:menu.help.label'),
        submenu: [
            {
                click: () => {
                    electron.shell.openExternal(
                        `mailto:c@lumi.education?subject=${encodeURI(
                            i18next.t('lumi:bug_report.email.subject')
                        )}&body=${encodeURI(
                            i18next.t('lumi:bug_report.email.body')
                        )}`
                    );
                },
                label: i18next.t('lumi:menu.help.report_issue')
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    window.webContents.openDevTools();
                },
                label: i18next.t('lumi:menu.help.toggle_developer_tools')
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    electron.shell.openExternal(
                        'https://www.twitter.com/Lumieducation'
                    );
                },
                label: i18next.t('lumi:menu.help.follow_us_on_twitter')
            },
            {
                label: i18next.t('lumi:privacy_policy.title'),
                click: () => {
                    electron.shell.openExternal(
                        `https://www.lumi.education/app/privacy-policy?lng=${i18next.language}`
                    );
                }
            },
            process.platform === 'linux'
                ? {
                      label: i18next.t('lumi:menu.help.about'),
                      click: () => {
                          const platformInfo = getPlatformInformation();
                          dialog.showMessageBox(window, {
                              message: `Lumi v${electron.app.getVersion()} - ${
                                  platformInfo?.package ?? 'unknown package'
                              }\n(C) 2022 Lumi Education GbR Jan Philip Schellenberg und Sebastian Rettig\nAGPL 3.0 License`
                          });
                      }
                  }
                : { label: i18next.t('lumi:menu.help.about'), role: 'about' }
        ]
    };
}

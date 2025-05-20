import electron from 'electron';
import { IH5PConfig } from '@lumieducation/h5p-server';

/**
 * Hard-codes configuration options and literals that are used by H5P and that
 * are not user-configurable. We don't want any configurable H5P settings, so we
 * hard-code all of them here. This makes later updates easier.
 */
export default class H5PConfig implements IH5PConfig {
  public ajaxUrl: string = '/ajax';

  public baseUrl: string = '/h5p';

  public contentFilesUrl: string = '/content';

  public contentFilesUrlPlayerOverride: string;

  public contentHubContentEndpoint: string = '';

  public contentHubEnabled: boolean = false;

  public contentHubMetadataEndpoint: string = '';

  public contentHubMetadataRefreshInterval: number = 1 * 1000 * 60 * 60 * 24;

  public contentTypeCacheRefreshInterval: number = 1 * 1000 * 60 * 60 * 24;

  public setFinishedEnabled: boolean;

  public contentUserStateSaveInterval: number | boolean = false;

  public contentUserDataUrl: string = '/contentUserData';

  public contentWhitelist: string =
    'json png jpg jpeg gif bmp tif tiff svg eot ttf woff woff2 otf webm mp4 ogg mp3 m4a wav txt pdf rtf doc docx xls xlsx ppt pptx odt ods odp xml csv diff patch swf md textile vtt webvtt gltf glb';

  public coreApiVersion: { major: number; minor: number } = {
    major: 1,
    minor: 27
  };

  public coreUrl: string = '/core';

  public customization: {
    global: {
      editor?: {
        scripts?: string[];
        styles?: string[];
      };
      player?: {
        scripts?: string[];
        styles?: string[];
      };
    };
  } = {
    global: {
      editor: {
        scripts: [],
        styles: []
      },
      player: {
        scripts: [],
        styles: []
      }
    }
  };

  public disableFullscreen: boolean = false;

  public downloadUrl: string = '/download';

  public editorAddons?: {
    [machineName: string]: string[];
  } = {
    'H5P.CoursePresentation': ['H5P.MathDisplay'],
    'H5P.InteractiveVideo': ['H5P.MathDisplay'],
    'H5P.DragQuestion': ['H5P.MathDisplay']
  };

  public editorLibraryUrl: string = '/editor';

  public enableLrsContentTypes: boolean = true;

  public exportMaxContentPathLength: number = 255;

  public fetchingDisabled: 0 | 1 = 0;

  public h5pVersion: string = '1.27';

  public hubContentTypesEndpoint: string =
    'https://api.h5p.org/v1/content-types/';

  public hubRegistrationEndpoint: string = 'https://api.h5p.org/v1/sites';

  public installLibraryLockMaxOccupationTime: number = 30000;

  public installLibraryLockTimeout: number = 60000;

  public librariesUrl: string = '/libraries';

  public libraryConfig: { [machineName: string]: any };

  public libraryWhitelist: string = 'js css';

  public lrsContentTypes: string[] = [
    'H5P.Questionnaire',
    'H5P.FreeTextQuestion'
  ];

  public maxFileSize: number = 2048 * 1024 * 1024;

  public maxTotalSize: number = 2048 * 1024 * 1024;

  public paramsUrl: string = '/params';

  public platformName: string = 'Lumi Desktop Editor';

  public platformVersion: string = electron.app?.getVersion() ?? '0.1';

  public playerAddons?: {
    [machineName: string]: string[];
  };

  public playUrl: string = '/play';

  public proxy?: {
    host: string;
    port: number;
    protocol?: 'http' | 'https';
  };

  public sendUsageStatistics: boolean = false;

  public setFinishedUrl: string = '/setFinished';

  public siteType: 'local' | 'network' | 'internet' = 'local';

  public temporaryFileLifetime: number = 1 * 60 * 1000; // 120 minutes

  public temporaryFilesUrl: string = '/temp-files';

  // The only user-configurable setting.
  public uuid: string = '';

  public async load(): Promise<H5PConfig> {
    // this.uuid = (await this.settingsCache.getSettings()).h5pUuid ?? "";
    return this;
  }

  public async save(): Promise<void> {
    //     const settings = await this.settingsCache.getSettings();
    //     if (settings.h5pUuid !== this.uuid) {
    //       settings.h5pUuid = this.uuid;
    //       await this.settingsCache.saveSettings(settings);
    // }
  }
}

import { app } from 'electron';

const default_settings = {
  language: app.getLocale(),
  prerelease_features: true,
  updates_automatic: true,

  show_setup: true,

  theme_mode: 'light',
  theme_direction: 'ltr',
  theme_contrast: 'default',
  theme_layout: 'vertical',
  theme_color_presets: 'default',
  theme_stretch: false,

  https_proxy: '',
  http_proxy: '',

  hub_content_types_endpoint: 'https://hub-api.h5p.org/v1/content-types/',
  hub_registration_endpoint: 'https://hub-api.h5p.org/v1/sites'
};

export default default_settings;

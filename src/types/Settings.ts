export default interface Settings {
  language: string;
  prerelease_features: boolean;
  updates_automatic: boolean;

  show_setup: boolean;

  theme_mode: string;
  theme_direction: string;
  theme_contrast: string;
  theme_layout: string;
  theme_color_presets: string;
  theme_stretch: boolean;

  https_proxy: string;
  http_proxy: string;

  hub_content_types_endpoint: string;
  hub_registration_endpoint: string;
}

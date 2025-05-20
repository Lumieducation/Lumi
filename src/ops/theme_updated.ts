export default function theme_updated(payload: any): boolean {
  return Boolean(
    payload.theme_mode ||
      payload.theme_direction ||
      payload.theme_contrast ||
      payload.theme_layout ||
      payload.theme_color_presets ||
      payload.theme_stretch
  );
}

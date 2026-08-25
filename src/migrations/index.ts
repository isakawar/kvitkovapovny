import * as migration_20260825_103829_initial_schema from './20260825_103829_initial_schema';
import * as migration_20260825_123310_add_design_theme_to_site_settings from './20260825_123310_add_design_theme_to_site_settings';

export const migrations = [
  {
    up: migration_20260825_103829_initial_schema.up,
    down: migration_20260825_103829_initial_schema.down,
    name: '20260825_103829_initial_schema'
  },
  {
    up: migration_20260825_123310_add_design_theme_to_site_settings.up,
    down: migration_20260825_123310_add_design_theme_to_site_settings.down,
    name: '20260825_123310_add_design_theme_to_site_settings'
  },
];

import * as migration_20260825_103829_initial_schema from './20260825_103829_initial_schema';
import * as migration_20260825_123310_add_design_theme_to_site_settings from './20260825_123310_add_design_theme_to_site_settings';
import * as migration_20260825_125545_add_feature_strip_and_how_it_works from './20260825_125545_add_feature_strip_and_how_it_works';
import * as migration_20260826_150506_add_feature_strip_and_formats_headings from './20260826_150506_add_feature_strip_and_formats_headings';

export const migrations = [
  {
    up: migration_20260825_103829_initial_schema.up,
    down: migration_20260825_103829_initial_schema.down,
    name: '20260825_103829_initial_schema',
  },
  {
    up: migration_20260825_123310_add_design_theme_to_site_settings.up,
    down: migration_20260825_123310_add_design_theme_to_site_settings.down,
    name: '20260825_123310_add_design_theme_to_site_settings',
  },
  {
    up: migration_20260825_125545_add_feature_strip_and_how_it_works.up,
    down: migration_20260825_125545_add_feature_strip_and_how_it_works.down,
    name: '20260825_125545_add_feature_strip_and_how_it_works',
  },
  {
    up: migration_20260826_150506_add_feature_strip_and_formats_headings.up,
    down: migration_20260826_150506_add_feature_strip_and_formats_headings.down,
    name: '20260826_150506_add_feature_strip_and_formats_headings'
  },
];

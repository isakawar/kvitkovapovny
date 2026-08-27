import * as migration_20260825_103829_initial_schema from './20260825_103829_initial_schema';
import * as migration_20260825_123310_add_design_theme_to_site_settings from './20260825_123310_add_design_theme_to_site_settings';
import * as migration_20260825_125545_add_feature_strip_and_how_it_works from './20260825_125545_add_feature_strip_and_how_it_works';
import * as migration_20260826_150506_add_feature_strip_and_formats_headings from './20260826_150506_add_feature_strip_and_formats_headings';
import * as migration_20260826_163117_add_google_rating_and_stat_to_site_settings from './20260826_163117_add_google_rating_and_stat_to_site_settings';
import * as migration_20260826_164338_add_telegram_url_to_site_settings from './20260826_164338_add_telegram_url_to_site_settings';
import * as migration_20260826_175326_restructure_content_globals from './20260826_175326_restructure_content_globals';
import * as migration_20260826_182232_add_occasion_tags_to_products from './20260826_182232_add_occasion_tags_to_products';
import * as migration_20260826_183405_add_custom_bouquet_requests from './20260826_183405_add_custom_bouquet_requests';
import * as migration_20260826_184218_add_card_subtitle_to_products from './20260826_184218_add_card_subtitle_to_products';
import * as migration_20260826_190231_add_subscription_delivery_windows from './20260826_190231_add_subscription_delivery_windows';
import * as migration_20260826_190915_consolidate_subscription_pricing_into_products from './20260826_190915_consolidate_subscription_pricing_into_products';
import * as migration_20260826_192259_add_google_maps_url_to_site_settings from './20260826_192259_add_google_maps_url_to_site_settings';
import * as migration_20260826_192853_add_wedding_page_subscription_fields from './20260826_192853_add_wedding_page_subscription_fields';
import * as migration_20260826_194634_add_business_inquiries from './20260826_194634_add_business_inquiries';
import * as migration_20260826_195855_add_tiktok_url_to_site_settings from './20260826_195855_add_tiktok_url_to_site_settings';
import * as migration_20260826_200500_backfill_rebrand_content from './20260826_200500_backfill_rebrand_content';
import * as migration_20260827_090000_backfill_real_nap_data from './20260827_090000_backfill_real_nap_data';
import * as migration_20260827_094019_add_threads_url_to_site_settings from './20260827_094019_add_threads_url_to_site_settings';

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
    name: '20260826_150506_add_feature_strip_and_formats_headings',
  },
  {
    up: migration_20260826_163117_add_google_rating_and_stat_to_site_settings.up,
    down: migration_20260826_163117_add_google_rating_and_stat_to_site_settings.down,
    name: '20260826_163117_add_google_rating_and_stat_to_site_settings',
  },
  {
    up: migration_20260826_164338_add_telegram_url_to_site_settings.up,
    down: migration_20260826_164338_add_telegram_url_to_site_settings.down,
    name: '20260826_164338_add_telegram_url_to_site_settings',
  },
  {
    up: migration_20260826_175326_restructure_content_globals.up,
    down: migration_20260826_175326_restructure_content_globals.down,
    name: '20260826_175326_restructure_content_globals',
  },
  {
    up: migration_20260826_182232_add_occasion_tags_to_products.up,
    down: migration_20260826_182232_add_occasion_tags_to_products.down,
    name: '20260826_182232_add_occasion_tags_to_products',
  },
  {
    up: migration_20260826_183405_add_custom_bouquet_requests.up,
    down: migration_20260826_183405_add_custom_bouquet_requests.down,
    name: '20260826_183405_add_custom_bouquet_requests',
  },
  {
    up: migration_20260826_184218_add_card_subtitle_to_products.up,
    down: migration_20260826_184218_add_card_subtitle_to_products.down,
    name: '20260826_184218_add_card_subtitle_to_products',
  },
  {
    up: migration_20260826_190231_add_subscription_delivery_windows.up,
    down: migration_20260826_190231_add_subscription_delivery_windows.down,
    name: '20260826_190231_add_subscription_delivery_windows',
  },
  {
    up: migration_20260826_190915_consolidate_subscription_pricing_into_products.up,
    down: migration_20260826_190915_consolidate_subscription_pricing_into_products.down,
    name: '20260826_190915_consolidate_subscription_pricing_into_products',
  },
  {
    up: migration_20260826_192259_add_google_maps_url_to_site_settings.up,
    down: migration_20260826_192259_add_google_maps_url_to_site_settings.down,
    name: '20260826_192259_add_google_maps_url_to_site_settings',
  },
  {
    up: migration_20260826_192853_add_wedding_page_subscription_fields.up,
    down: migration_20260826_192853_add_wedding_page_subscription_fields.down,
    name: '20260826_192853_add_wedding_page_subscription_fields',
  },
  {
    up: migration_20260826_194634_add_business_inquiries.up,
    down: migration_20260826_194634_add_business_inquiries.down,
    name: '20260826_194634_add_business_inquiries',
  },
  {
    up: migration_20260826_195855_add_tiktok_url_to_site_settings.up,
    down: migration_20260826_195855_add_tiktok_url_to_site_settings.down,
    name: '20260826_195855_add_tiktok_url_to_site_settings',
  },
  {
    up: migration_20260826_200500_backfill_rebrand_content.up,
    down: migration_20260826_200500_backfill_rebrand_content.down,
    name: '20260826_200500_backfill_rebrand_content',
  },
  {
    up: migration_20260827_090000_backfill_real_nap_data.up,
    down: migration_20260827_090000_backfill_real_nap_data.down,
    name: '20260827_090000_backfill_real_nap_data',
  },
  {
    up: migration_20260827_094019_add_threads_url_to_site_settings.up,
    down: migration_20260827_094019_add_threads_url_to_site_settings.down,
    name: '20260827_094019_add_threads_url_to_site_settings'
  },
];

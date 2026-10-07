import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import { fr } from './fr';

export const i18n = new I18n({ fr });
i18n.defaultLocale = 'fr';
// French first: other locales fall back to it until translations exist.
i18n.locale = getLocales()[0]?.languageCode ?? 'fr';
i18n.enableFallback = true;

export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

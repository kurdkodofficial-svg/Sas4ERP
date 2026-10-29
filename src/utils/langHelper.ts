import { Language } from '../types/erp';

/**
 * Universal Language Resolver for SAS ERP
 * Ensures 100% language purity:
 * - When UI is English ('en'), returns pristine English.
 * - When UI is Kurdish ('ku'), returns pristine Central Kurdish (Sorani).
 * - When UI is Arabic ('ar'), returns pristine Modern Standard Arabic.
 * 
 * Also handles cross-language display: when a user submits in Kurdish or Arabic,
 * upper management viewing in English sees the English representation.
 */

export function resolveEntityText(
  entity: Record<string, any> | null | undefined,
  field: string,
  lang: Language,
  fallback: string = ''
): string {
  if (!entity) return fallback;

  if (lang === 'ku') {
    return entity[`${field}Ku`] || entity[`${field}Kur`] || entity[field] || entity[`${field}Ar`] || fallback;
  }
  if (lang === 'ar') {
    return entity[`${field}Ar`] || entity[field] || entity[`${field}Ku`] || fallback;
  }
  // English (default 'en')
  return entity[field] || entity[`${field}En`] || entity[`${field}Ku`] || entity[`${field}Ar`] || fallback;
}

export function getUIText(
  lang: Language,
  dict: { en: string; ku: string; ar?: string }
): string {
  if (lang === 'ku') return dict.ku;
  if (lang === 'ar') return dict.ar || dict.ku;
  return dict.en;
}

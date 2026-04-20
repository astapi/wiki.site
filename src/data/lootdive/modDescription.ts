import { t, type Lang } from '../../i18n/site'

export interface ModLike {
  type: string
  value?: number
  min?: number
  max?: number
}

// Returns a localized description for the given MOD. String templates live in
// src/i18n/lootdive/{lang}.json under `modDescriptions`. Returns '' for unknown
// types (preserves existing behavior).
export function getModDescription(mod: ModLike, lang: Lang = 'ja'): string {
  const hasRange = typeof mod.min === 'number' && typeof mod.max === 'number'
  const val = hasRange ? `${mod.min}~${mod.max}` : String(mod.value ?? 0)
  const numeric = typeof mod.value === 'number' ? mod.value : 0
  const sign = hasRange ? '' : numeric >= 0 ? '+' : ''

  // Existence check: only known types have a template in the dictionary.
  const template = t(lang, `modDescriptions.${mod.type}`)
  if (template === `modDescriptions.${mod.type}`) return ''

  return t(lang, `modDescriptions.${mod.type}`, { value: val, sign })
}

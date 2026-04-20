import ja from './locales/ja.json'
import ko from './locales/ko.json'
import zh from './locales/zh.json'
import en from './locales/en.json'
import type { Lang } from '../../i18n/site'

type LocaleEntry = { name?: string } | undefined
type LocaleDict = Record<string, unknown>

const LOCALES: Record<Lang, LocaleDict> = {
  ja: ja as LocaleDict,
  ko: ko as LocaleDict,
  zh: zh as LocaleDict,
  en: en as LocaleDict,
}

function entry(lang: Lang, ns: string, id: string): LocaleEntry {
  const nsObj = LOCALES[lang]?.[ns] as Record<string, unknown> | undefined
  return nsObj?.[id] as LocaleEntry
}

function nameOf(lang: Lang, ns: string, id: string): string {
  return (
    entry(lang, ns, id)?.name ??
    entry('ja', ns, id)?.name ??
    id
  )
}

export function itemName(id: string, lang: Lang = 'ja'): string {
  return nameOf(lang, 'items', id)
}

export function monsterName(id: string, lang: Lang = 'ja'): string {
  return nameOf(lang, 'monsters', id)
}

export function dungeonName(id: string, lang: Lang = 'ja'): string {
  return nameOf(lang, 'dungeons', id)
}

export function dungeonDescription(id: string, lang: Lang = 'ja'): string {
  const e = entry(lang, 'dungeons', id) as { description?: string } | undefined
  const jaE = entry('ja', 'dungeons', id) as { description?: string } | undefined
  return e?.description ?? jaE?.description ?? ''
}

export function skillName(id: string, lang: Lang = 'ja'): string {
  return nameOf(lang, 'skills', id)
}

export function modName(type: string, lang: Lang = 'ja'): string {
  const v = (LOCALES[lang]?.mods as Record<string, unknown> | undefined)?.[type]
  if (typeof v === 'string') return v
  const jaV = (LOCALES.ja.mods as Record<string, unknown> | undefined)?.[type]
  return typeof jaV === 'string' ? jaV : type
}

export function slotName(slot: string, lang: Lang = 'ja'): string {
  const v = (LOCALES[lang]?.slots as Record<string, unknown> | undefined)?.[slot]
  if (typeof v === 'string') return v
  const jaV = (LOCALES.ja.slots as Record<string, unknown> | undefined)?.[slot]
  return typeof jaV === 'string' ? jaV : slot
}

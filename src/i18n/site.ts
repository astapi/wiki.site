import ja from './lootdive/ja.json'
import ko from './lootdive/ko.json'
import zh from './lootdive/zh.json'
import en from './lootdive/en.json'

export type Lang = 'ja' | 'ko' | 'zh' | 'en'

export const DEFAULT_LANG: Lang = 'ja'
export const SUPPORTED_LANGS: Lang[] = ['ja', 'ko', 'zh', 'en']
export const NON_DEFAULT_LANGS: Exclude<Lang, 'ja'>[] = ['ko', 'zh', 'en']

const DICTS: Record<Lang, unknown> = { ja, ko, zh, en }

function lookup(dict: unknown, path: string[]): unknown {
  let cur: unknown = dict
  for (const k of path) {
    if (cur && typeof cur === 'object') cur = (cur as Record<string, unknown>)[k]
    else return undefined
  }
  return cur
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = vars[k]
    return v === undefined || v === null ? '' : String(v)
  })
}

export function t(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>
): string {
  const path = key.split('.')
  const v = lookup(DICTS[lang], path) ?? lookup(DICTS.ja, path)
  if (typeof v === 'string') return interpolate(v, vars)
  return key
}

export function tArray(lang: Lang, key: string): string[] {
  const path = key.split('.')
  const v = lookup(DICTS[lang], path) ?? lookup(DICTS.ja, path)
  return Array.isArray(v) ? (v as string[]) : []
}

// Resolve a lang-agnostic relative path (like '/monsters/') to a URL under the game
// slug, prefixing non-default languages. e.g.:
//   localeHref('ja', '/lootdive', '/monsters/') -> '/lootdive/monsters/'
//   localeHref('ko', '/lootdive', '/monsters/') -> '/lootdive/ko/monsters/'
export function localeHref(lang: Lang, gameBase: string, path: string): string {
  const base = gameBase.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  if (lang === DEFAULT_LANG) return `${base}${p}`
  return `${base}/${lang}${p}`
}

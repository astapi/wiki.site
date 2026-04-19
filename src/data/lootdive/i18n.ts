import ja from './locales/ja.json'

type LocaleEntry = { name?: string } | undefined

function pick(ns: Record<string, unknown> | undefined, id: string): LocaleEntry {
  return ns?.[id] as LocaleEntry
}

export function itemName(id: string): string {
  return pick(ja.items as Record<string, unknown>, id)?.name ?? id
}

export function monsterName(id: string): string {
  return pick(ja.monsters as Record<string, unknown>, id)?.name ?? id
}

export function dungeonName(id: string): string {
  return pick(ja.dungeons as Record<string, unknown>, id)?.name ?? id
}

export function skillName(id: string): string {
  return pick(ja.skills as Record<string, unknown>, id)?.name ?? id
}

export function modName(type: string): string {
  const v = (ja.mods as Record<string, unknown>)?.[type]
  return typeof v === 'string' ? v : type
}

export function slotName(slot: string): string {
  const v = (ja.slots as Record<string, unknown>)?.[slot]
  return typeof v === 'string' ? v : slot
}


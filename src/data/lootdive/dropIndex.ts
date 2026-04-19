// ビルド時に「アイテム → 入手元」の逆引きインデックスを構築
import dungeonsData from './game/dungeons.json'
import monstersData from './game/monsters.json'
import itemsData from './game/items.json'

export interface DungeonDropSource {
  dungeonId: string
  dungeonName: string
  category: 'common' | 'dungeon'
  dropRate: number
}

export interface MonsterDropSource {
  monsterId: string
  monsterName: string
  dropRate: number
}

type DungeonEntry = {
  id: string
  name: string
  dropTable?: {
    common?: { itemId: string; dropRate: number }[]
    dungeon?: { itemId: string; dropRate: number }[]
  }
}

type MonsterEntry = {
  id: string
  name: string
  uniqueDrop?: { itemId: string; dropRate: number } | null
  uniqueDrops?: { itemId: string; dropRate: number }[]
}

const dungeonDrops: Record<string, DungeonDropSource[]> = {}
const monsterDrops: Record<string, MonsterDropSource[]> = {}

for (const [key, v] of Object.entries(dungeonsData.dungeons as Record<string, unknown>)) {
  if (key.startsWith('_') || key.startsWith('debug_')) continue
  const d = v as DungeonEntry
  if (!d?.id) continue
  for (const cat of ['common', 'dungeon'] as const) {
    const list = d.dropTable?.[cat] ?? []
    for (const drop of list) {
      if (!dungeonDrops[drop.itemId]) dungeonDrops[drop.itemId] = []
      dungeonDrops[drop.itemId].push({
        dungeonId: d.id,
        dungeonName: d.name,
        category: cat,
        dropRate: drop.dropRate,
      })
    }
  }
}

for (const [key, v] of Object.entries(monstersData.monsters as Record<string, unknown>)) {
  if (key.startsWith('_')) continue
  const m = v as MonsterEntry
  if (!m?.id) continue
  const drops = m.uniqueDrops?.length
    ? m.uniqueDrops
    : m.uniqueDrop
      ? [m.uniqueDrop]
      : []
  for (const drop of drops) {
    if (!monsterDrops[drop.itemId]) monsterDrops[drop.itemId] = []
    monsterDrops[drop.itemId].push({
      monsterId: m.id,
      monsterName: m.name,
      dropRate: drop.dropRate,
    })
  }
}

const commonDropIds = new Set<string>((itemsData.commonDrops as string[]) ?? [])

export function isCommonDrop(itemId: string): boolean {
  return commonDropIds.has(itemId)
}

export function getDungeonSources(itemId: string): DungeonDropSource[] {
  return dungeonDrops[itemId] ?? []
}

export function getMonsterSources(itemId: string): MonsterDropSource[] {
  return monsterDrops[itemId] ?? []
}

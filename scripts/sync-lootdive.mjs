#!/usr/bin/env node
// LootDive のマスターデータ・ロケール・画像を hakuslaDungeon リポジトリから同期する
// 使い方: pnpm sync:lootdive
// 既定のソースパス: ../ReactNativeExpo/hakuslaDungeon
// 上書きするときは HAKUSLA_DUNGEON_ROOT 環境変数で指定:
//   HAKUSLA_DUNGEON_ROOT=~/projects/ReactNativeExpo/hakuslaDungeon pnpm sync:lootdive

import { cpSync, existsSync, mkdirSync, renameSync, statSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const DEFAULT_SRC = resolve(ROOT, '..', 'ReactNativeExpo', 'hakuslaDungeon')
const SRC = process.env.HAKUSLA_DUNGEON_ROOT
  ? resolve(process.env.HAKUSLA_DUNGEON_ROOT.replace(/^~/, process.env.HOME ?? ''))
  : DEFAULT_SRC

if (!existsSync(SRC)) {
  console.error(`✗ hakuslaDungeon が見つかりません: ${SRC}`)
  console.error('  HAKUSLA_DUNGEON_ROOT 環境変数でパスを指定してください')
  process.exit(1)
}

console.log(`[sync:lootdive] source: ${SRC}`)
console.log(`[sync:lootdive] dest:   ${ROOT}`)
console.log('')

let copied = 0
let skipped = 0

function copy(from, to, opts = {}) {
  const src = resolve(SRC, from)
  const dest = resolve(ROOT, to)
  if (!existsSync(src)) {
    console.warn(`  skip (見つからない): ${from}`)
    skipped += 1
    return
  }
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(src, dest, { recursive: true, force: true, ...opts })
  const isDir = statSync(src).isDirectory()
  console.log(`  ${isDir ? '📁' : '📄'} ${from} → ${to}`)
  copied += 1
}

const excludeNoise = (src) => {
  const name = basename(src)
  return name !== '.DS_Store' && name !== 'Thumbs.db'
}

// ---- 1. ゲームマスターデータ JSON ----
console.log('[1/4] マスターデータJSON')
const GAME_FILES = [
  'badges.json',
  'dungeonList.json',
  'dungeons.json',
  'items.json',
  'mods.json',
  'monsters.json',
  'passiveTree.json',
  'uberTree.json',
]
for (const f of GAME_FILES) {
  copy(`data/json/${f}`, `src/data/lootdive/game/${f}`)
}

// ---- 2. 多言語ロケール ----
console.log('')
console.log('[2/4] ロケールJSON')
const LOCALES = ['ja.json', 'en.json', 'de.json', 'es.json', 'fr.json', 'ko.json', 'zh.json']
for (const f of LOCALES) {
  copy(`locales/${f}`, `src/data/lootdive/locales/${f}`)
}

// ---- 3. 型定義 ----
console.log('')
console.log('[3/4] 型定義')
copy('types/index.ts', 'src/data/lootdive/types.ts')

// ---- 4. 画像アセット ----
console.log('')
console.log('[4/4] 画像アセット')
const IMAGE_DIRS = ['monsters', 'items', 'characters', 'passive', 'chests']
for (const d of IMAGE_DIRS) {
  copy(`assets/images/${d}`, `public/lootdive/images/${d}`, { filter: excludeNoise })
}

// ---- 4.5. モンスター画像のエイリアス ----
// hakuslaDungeon/data/images.ts で require() マップしている論理名 → 実ファイル名のずれを
// 論理名のコピーとして吸収する (SSG なので URL = ファイル名になる)
console.log('')
console.log('[+] モンスター画像エイリアス')
const MONSTER_IMAGE_ALIASES = {
  demon: 'daemon.png',
  dark_treant: 'treant.png',
  uruk_hai: 'Uruk-hai.png',
  cyclops: 'Cyclops.png',
  kraken: 'Kraken.png',
  lava_slime: 'larva_slime.png',
  griffon: 'griffin.png',
  demon_lord: 'daemon_load.png',
}
const monstersDir = resolve(ROOT, 'public/lootdive/images/monsters')
for (const [logical, actualFile] of Object.entries(MONSTER_IMAGE_ALIASES)) {
  const src = resolve(monstersDir, actualFile)
  const dest = resolve(monstersDir, `${logical}.png`)
  if (!existsSync(src)) {
    console.warn(`  skip (元ファイル無し): ${actualFile}`)
    skipped += 1
    continue
  }
  const caseOnlyDiff = src.toLowerCase() === dest.toLowerCase()
  if (caseOnlyDiff) {
    // 大文字小文字違いだけの時は macOS のケースインセンシティブFSで src===dest 扱いになるので
    // temp 経由でリネーム。Linux (CF Pages) では別ファイル扱いなので確実に小文字化する必要あり。
    const tmp = resolve(monstersDir, `__tmp_${logical}.png`)
    renameSync(src, tmp)
    renameSync(tmp, dest)
  } else {
    // 非・ケース差分 (例: Uruk-hai.png → uruk_hai.png) もリネーム。
    // 原本はwikiでは使わないので残さない方がgit履歴的にクリーン。
    renameSync(src, dest)
  }
  console.log(`  🔤 ${actualFile} → ${logical}.png`)
  copied += 1
}

console.log('')
console.log(`✓ 完了 (${copied} 件コピー, ${skipped} 件スキップ)`)

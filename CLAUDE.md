# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

astapi Games のゲームタイトル別データリファレンス (攻略wiki) サイト。**1リポジトリで複数ゲーム** を `wiki.astapi.net/<game>/...` のパス方式で配信する SSG (Astro 6 + Tailwind 4)。Cloudflare Pages にデプロイ。現在配信中のゲームは `lootdive` (ルートダイブ) のみ。

## よく使うコマンド

```bash
pnpm install
pnpm dev           # http://localhost:4321
pnpm sync          # hakuslaDungeon から最新マスターデータを同期
pnpm build         # dist/ に静的ファイル生成
pnpm build:fresh   # sync + build (リリース前に推奨)
pnpm preview       # ビルド結果のプレビュー
```

Node.js は `.node-version` で **22.12.0** 固定。テストフレームワークは導入されていない (型チェックは `pnpm astro check`、ただし依存に astro-check は明示インストールされていないので必要なら追加)。

## アーキテクチャ要点

### データの源 (Single Source of Truth)

LootDive のマスターデータは **このリポジトリの正本ではない**。`~/projects/ReactNativeExpo/hakuslaDungeon` (アプリ本体) が正で、`scripts/sync-lootdive.mjs` が以下を一方向にコピーしてくる:

| 区分 | from (hakuslaDungeon) | to (wiki) |
|---|---|---|
| マスターJSON | `data/json/*.json` (8本) | `src/data/lootdive/game/` |
| ロケール | `locales/*.json` (7言語) | `src/data/lootdive/locales/` |
| 型定義 | `types/index.ts` | `src/data/lootdive/types.ts` |
| 画像 | `assets/images/{monsters,items,characters,passive,chests}/` | `public/lootdive/images/` |

**重要**: `src/data/lootdive/game/`, `src/data/lootdive/locales/`, `src/data/lootdive/types.ts`, `public/lootdive/images/` の中身を **手で編集してはいけない** (sync で上書きされる)。修正は hakuslaDungeon 側で行い、`pnpm sync` でこちらに反映する。ソースパスは `HAKUSLA_DUNGEON_ROOT` 環境変数で上書き可能。

### モンスター画像のエイリアス

アプリ側 (`hakuslaDungeon/data/images.ts`) が `require()` で論理名 → 実ファイル名のマッピングを持っているため、wiki 側 (SSG なので URL = ファイル名) では `scripts/sync-lootdive.mjs` の `MONSTER_IMAGE_ALIASES` で論理名へリネームしている。新しいエイリアスが必要になったらここを更新する。**macOS のケースインセンシティブ FS と Linux (CF Pages) のずれを吸収するため tmp 経由のリネームを行っている** ので、ロジックを安易に簡略化しないこと。

### 同期でカバーされない手動メンテ対象

以下は同期スクリプトの対象外。hakuslaDungeon 側の変更に追従して手で更新する必要がある:

- 新MOD type → `src/data/lootdive/modDescription.ts` の switch case 追加 (アプリの図鑑表示ロジックを移植したもの)
- 新ボス種 → `src/data/lootdive/bossSkills.ts` の `BOSS_ABILITIES_MAP` / `UBER_BOSS_BY_BASE` / `UBER_UBER_BY_UBER` 追加
- ボスのワンポイント攻略 → `src/data/lootdive/bossTips.ts` の `BOSS_TIPS` 追加
- 画像ファイル名エイリアス → `scripts/sync-lootdive.mjs` の `MONSTER_IMAGE_ALIASES` 追加

### ページ生成パターン

詳細ページはすべて `getStaticPaths` で全件静的生成 (`src/pages/lootdive/{monsters,items,dungeons}/[id].astro`)。マスターJSONを反復するときは **`key.startsWith('_')` (および `debug_`) を除外する規約** がある (アプリ内部用のメタデータ entry 対策)。`dropIndex.ts` がビルド時に「アイテム → 入手元 (モンスター/ダンジョン)」の逆引きインデックスを構築しており、アイテム詳細ページはこれを使ってドロップソースを表示する。

### Uber ボスのスキル解決

`bossSkills.ts` は `uber_xxx` / `uber_uber_xxx` プレフィクスをベースID (`xxx`) に解決して同じスキル定義を参照させる構造。`isUberUberOnly` / `isUberOnly` フラグや `descKeyUberUber` / `triggerTypeUberUber` で UberUber 限定スキルや上位版の文言・トリガを切り替える。スキル名・説明文は `locales/ja.json` の `bossSkills` ネームスペースから引く。

### レイアウト / SEO

- `src/layouts/BaseLayout.astro`: HTML shell + canonical, OG, Twitter, JSON-LD などの SEO メタ。`Astro.site` (= `https://wiki.astapi.net`) を基準に絶対URLを組み立てる。
- `src/layouts/GameLayout.astro`: ゲーム個別の header/footer/nav。`gameSlug` プロパティで `/<slug>/...` に nav リンクを生成。
- `@astrojs/sitemap` が `dist/sitemap-index.xml` を自動生成。
- スタイルは Tailwind 4 + `src/styles/global.css` の CSS カスタムプロパティ (`--color-bg` 等)。色を直書きせずカスタムプロパティを使う方針。

## 新規ゲーム追加

`src/data/<slug>/`, `src/pages/<slug>/`, `public/<slug>/images/` を同じ構造で追加し、必要なら `scripts/` に同期スクリプトを足す。トップページ (`src/pages/lootdive/index.astro`) と JSON-LD パターンを参考にする。

## デプロイ

Cloudflare Pages (Framework preset: Astro / Build command: `pnpm run build` / Output: `dist` / `NODE_VERSION=22.12.0`)。`public/_redirects` で apex を astapi.net へ 301 リダイレクト。

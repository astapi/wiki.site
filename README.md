# wiki.astapi.net

astapi Games の各タイトル向けデータリファレンス (Wiki) サイト。
1リポジトリで複数ゲームを配信する構成。

## スタック

- [Astro](https://astro.build/) 6 (static output / SSG)
- Tailwind CSS 4
- Node.js 22.12.0 (`.node-version`)
- デプロイ: Cloudflare Pages

## 開発

```bash
pnpm install
pnpm dev           # http://localhost:4321
pnpm sync          # hakuslaDungeon から最新データを同期
pnpm build         # dist/ に静的ファイル生成
pnpm build:fresh   # sync + build を一括 (リリース前に推奨)
pnpm preview       # ビルド結果のプレビュー
```

## ディレクトリ構成

```
src/
├── data/
│   └── lootdive/                # LootDive マスターデータ
│       ├── game/                # items, monsters, dungeons, mods...
│       ├── locales/             # ja/en/de/es/fr/ko/zh
│       └── types.ts             # hakuslaDungeon の types/index.ts コピー
├── layouts/
│   ├── BaseLayout.astro         # HTML shell (全ページ共通)
│   └── GameLayout.astro         # ゲーム個別の header/footer
├── pages/
│   └── lootdive/                # ゲーム別に1ディレクトリ
│                                # (ルートトップは持たない — 各ゲームのサブドメイン経由で配信)
│       ├── index.astro
│       ├── monsters/
│       │   ├── index.astro      # 一覧
│       │   └── [id].astro       # 詳細 (getStaticPaths で全生成)
│       ├── items/
│       └── dungeons/
└── styles/global.css

public/
├── favicon.ico / favicon.svg
├── _redirects                   # Cloudflare Pages のリダイレクト/リライト
└── lootdive/
    └── images/                  # モンスター・アイテム画像
```

新規ゲーム追加は `src/data/<slug>/` と `src/pages/<slug>/` を同じ構造で足し、
`public/_redirects` に対応サブドメインのリライト行を追加する。

## デプロイ: Cloudflare Pages

### 初回セットアップ

1. Cloudflare Dashboard → Pages → Create a project → Connect Git
2. ビルド設定:
   - Framework preset: **Astro**
   - Build command: `pnpm run build`
   - Build output directory: `dist`
   - Environment variables: `NODE_VERSION=22.12.0`
3. Custom domains:
   - `wiki.<game>.astapi.net` をゲームごとに追加 (例: `wiki.lootdive.astapi.net`)
   - `wiki.astapi.net` (apex) は `_redirects` で `astapi.net` へ 301 転送

### サブドメイン → パス書き換え

将来、ゲームごとにサブドメインで運用したくなったら、
`public/_redirects` の該当行のコメントを外す:

```
https://wiki.lootdive.astapi.net/* /lootdive/:splat 200
```

status code `200` = rewrite (URLバー変更なし)。
各サブドメインを Cloudflare Pages の Custom domain に追加すれば有効化される。

## データ同期

LootDive のマスターデータは `~/projects/ReactNativeExpo/hakuslaDungeon` が正。
更新があったら下記で wiki 側へ反映してから git commit → push:

```bash
pnpm sync              # 既定: ../ReactNativeExpo/hakuslaDungeon を参照
# または環境変数でパスを上書き:
HAKUSLA_DUNGEON_ROOT=~/projects/ReactNativeExpo/hakuslaDungeon pnpm sync
```

同期対象 (`scripts/sync-lootdive.mjs`):

| 区分 | from (hakuslaDungeon) | to (wiki) |
|---|---|---|
| マスターデータ | `data/json/*.json` (8本) | `src/data/lootdive/game/` |
| ロケール | `locales/*.json` (7言語) | `src/data/lootdive/locales/` |
| 型定義 | `types/index.ts` | `src/data/lootdive/types.ts` |
| 画像 | `assets/images/{monsters,items,characters,passive,chests}/` | `public/lootdive/images/` |

### 手動追加が必要なケース

同期スクリプトでカバーされないのは以下のみ。新しいゲーム要素を追加するときは注意:

- **新しいMOD type**: `src/data/lootdive/modDescription.ts` のswitch case追加
- **新しいボス種**: `src/data/lootdive/bossSkills.ts` の `BOSS_ABILITIES_MAP` とマッピング追加
- **新しいゲーム**: `src/pages/<slug>/`, `public/<slug>/images/` を追加、`scripts/` にも同ゲーム向け sync スクリプトを足す

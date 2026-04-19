# wiki.astapi.net

astapi Games の各タイトル向けデータリファレンス (攻略wiki) サイト。
1リポジトリで複数ゲームを配信する構成。URLは `wiki.astapi.net/<game>/...` のパス方式。

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
│       ├── types.ts             # hakuslaDungeon の types/index.ts コピー
│       ├── i18n.ts              # ja.json からの名称取得ヘルパ
│       ├── modDescription.ts    # アプリ形式の MOD 表示文生成
│       ├── bossSkills.ts        # Uber系ボスのスキル情報
│       └── dropIndex.ts         # アイテム→入手元 の逆引きインデックス
├── layouts/
│   ├── BaseLayout.astro         # HTML shell + SEOメタタグ
│   └── GameLayout.astro         # ゲーム個別の header/footer
├── pages/
│   └── lootdive/                # ゲーム別ディレクトリ
│       ├── index.astro
│       ├── monsters/
│       │   ├── index.astro      # 一覧
│       │   └── [id].astro       # 詳細 (getStaticPaths で全生成)
│       ├── items/
│       └── dungeons/
└── styles/global.css

public/
├── favicon.ico / favicon.svg
├── robots.txt
├── _redirects                   # apex は astapi.net へ 301
└── lootdive/
    └── images/                  # モンスター・アイテム画像
```

新規ゲーム追加は `src/data/<slug>/` と `src/pages/<slug>/`, `public/<slug>/images/`
を同じ構造で足す。

## デプロイ: Cloudflare Pages

### 初回セットアップ

1. Cloudflare Dashboard → Pages → Create a project → Connect Git → `astapi/wiki.site`
2. ビルド設定:
   - Framework preset: **Astro**
   - Build command: `pnpm run build`
   - Build output directory: `dist`
   - Environment variables: `NODE_VERSION=22.12.0`
3. Custom domains:
   - `wiki.astapi.net` を追加 (apex)
   - 将来サブドメインで運用したくなったら Custom Domain 追加 + URL書換実装

## SEO

- **canonical / og:url**: `src/layouts/BaseLayout.astro` が `Astro.site` を基に生成
- **sitemap**: `@astrojs/sitemap` が `dist/sitemap-index.xml` を自動生成
- **robots.txt**: `public/robots.txt`
- **JSON-LD**: lootdive トップに `WebSite` + `VideoGame` schema を埋め込み
- **OGデフォルト画像 (未作成)**: `/og-default.png` を参照。1200×630 で用意して `public/og-default.png` に置くこと

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

モンスター画像名のエイリアス (`daemon.png → demon.png` 等、`data/images.ts` の
`require()` マッピング由来) も sync スクリプト内で正規化している。

### 手動追加が必要なケース

同期スクリプトでカバーされないのは以下:

- **新しいMOD type**: `src/data/lootdive/modDescription.ts` のswitch case追加
- **新しいボス種**: `src/data/lootdive/bossSkills.ts` の `BOSS_ABILITIES_MAP` とマッピング追加
- **画像のファイル名エイリアス追加**: `scripts/sync-lootdive.mjs` の `MONSTER_IMAGE_ALIASES` に追加
- **新しいゲーム**: `src/pages/<slug>/`, `src/data/<slug>/`, `public/<slug>/images/` を追加

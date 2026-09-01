# CRUD_sample

社員情報の登録・参照・更新・削除（CRUD）を行うシンプルなサンプルアプリケーションです。
HTML / CSS / JavaScript のみで構成されており、ビルドやサーバーの準備なしにブラウザで動作します。

## 目次

- [概要](#概要)
- [デモ](#デモ)
- [機能](#機能)
- [動作環境](#動作環境)
- [使い方](#使い方)
- [テスト](#テスト)
- [ディレクトリ構成](#ディレクトリ構成)
- [実装メモ](#実装メモ)
- [今後の課題](#今後の課題)
- [ライセンス](#ライセンス)

## 概要

| 項目 | 内容 |
| --- | --- |
| プロジェクト名 | CRUD_sample（社員管理CRUDサンプル） |
| 目的 | CRUD 処理の基本的な流れを学習・確認するためのサンプル |
| 使用技術 | HTML5 / CSS / JavaScript（Vanilla JS） |
| 依存ライブラリ | なし |

## デモ

<!-- 画面キャプチャや GitHub Pages の URL を記載してください -->
<!-- 例: ![画面イメージ](docs/screenshot.png) -->

## 機能

- **Create（登録）** — 氏名とメールアドレスを入力して社員を追加します。
- **Read（一覧表示）** — 登録済みの社員を一覧表で表示します。
- **Update（編集）** — 「編集」ボタンで入力欄に値を読み込み、内容を更新します。
- **Delete（削除）** — 「削除」ボタンで確認ダイアログを表示し、社員を削除します。
- 氏名・メールアドレスの未入力チェック（バリデーション）

## 動作環境

- モダンブラウザ（Google Chrome / Microsoft Edge / Firefox / Safari の最新版）
- サーバーやビルドツールのインストールは不要です。

## 使い方

### 1. リポジトリを取得する

```bash
git clone https://github.com/TakahiroSakuda-c/CRUD_sample.git
cd CRUD_sample
```

### 2. 起動する

`index.html` をブラウザで開くだけで動作します。

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

必要に応じて簡易サーバー経由でも起動できます。

```bash
python3 -m http.server 8000
# http://localhost:8000/ をブラウザで開く
```

### 3. 操作する

1. 「氏名」「メールアドレス」を入力し **登録** ボタンを押すと一覧に追加されます。
2. 一覧の **編集** ボタンを押すと入力欄に値が入り、ボタンが「更新」に変わります。
3. 内容を修正して **更新** ボタンを押すと反映されます。
4. **削除** ボタンを押し、確認ダイアログで OK を選ぶと削除されます。

## テスト

CRUD ロジック（`js/userStore.js`）の単体テストを用意しています。
テストフレームワークは **Node.js 標準のテストランナー**（`node:test` / `node:assert`）を使用しており、
**インストールが必要な依存パッケージはありません**。

```bash
npm test
```

`npm` を使わずに直接実行することもできます。

```bash
node --test test/
```

- 必要な環境: Node.js 18 以上（`node --test` が安定版として利用できるバージョン）
- テスト対象: `js/userStore.js`（Create / Read / Update / Delete とバリデーション）
- DOM 操作を行う `js/app.js` はロジックを持たない薄い層のため、テスト対象外としています。

## ディレクトリ構成

```text
CRUD_sample/
├── .github/
│   └── workflows/
│       └── claude.yml       # GitHub Actions ワークフロー
├── css/
│   └── style.css            # スタイル定義
├── js/
│   ├── userStore.js         # CRUD ロジック（DOM 非依存）
│   └── app.js               # 画面との配線（DOM 操作）
├── test/
│   └── userStore.test.js    # userStore.js の単体テスト
├── index.html               # 画面のマークアップ
├── package.json             # テスト実行用スクリプト（依存パッケージなし）
└── README.md                # 本ファイル
```

HTML（構造）・CSS（見た目）・JavaScript（振る舞い）をファイル単位で分離しています。
さらに JavaScript は「CRUD ロジック（`userStore.js`）」と「DOM 操作（`app.js`）」に分けています。
`index.html` からは `css/style.css` と、`js/userStore.js` → `js/app.js` の順に読み込みます。

## 実装メモ

- データは `js/userStore.js` 内の `users` 配列（メモリ上）で保持しています。
  **ページを再読み込みすると初期データに戻ります。**
- ID は既存データの最大値 + 1 から始まる連番で採番しています。削除しても ID は再利用されません。
- 編集中かどうかは `editingId` で管理し、`null` の場合は新規登録として扱います。
- 一覧の「編集」「削除」ボタンは `data-action` / `data-id` 属性を付与し、
  `tbody` へのイベント委譲で処理しています（HTML 側に JavaScript を記述しないため）。
- `js/userStore.js` は DOM に依存せず、ブラウザでは `window.UserStore`、
  Node.js では `module.exports` として公開されるため、そのまま単体テストできます。

### `js/userStore.js`（CRUD ロジック）

`createUserStore(initialUsers)` でストアを生成します。`initialUsers` を省略すると初期データを使用します。

| メソッド | 役割 |
| --- | --- |
| `getUsers()` | 一覧を取得する（コピーを返す） |
| `getUser(id)` | 対象データを取得する。存在しなければ `null` |
| `getEditingId()` / `isEditing()` | 編集状態を取得する |
| `save(name, email)` | 登録 / 更新を行う。未入力なら `{ ok: false, error }` を返す |
| `startEdit(id)` | 編集モードにする。存在しなければ `null` を返す |
| `cancelEdit()` | 編集モードを解除する |
| `remove(id)` | 対象データを削除する |

### `js/app.js`（画面との配線）

| 関数 | 役割 |
| --- | --- |
| `renderTable()` | 一覧テーブルを再描画する |
| `saveUser()` | 入力値をストアに渡し、結果を画面へ反映する |
| `editUser(id)` | 対象データを入力欄に読み込み、編集モードにする |
| `deleteUser(id)` | 確認のうえ対象データを削除する |

## 今後の課題

- [ ] `localStorage` などによるデータの永続化
- [ ] メールアドレス形式のバリデーション追加
- [ ] 入力値のエスケープ処理（XSS 対策）
- [ ] 検索・並び替え・ページングへの対応
- [ ] バックエンド API との連携

## ライセンス

<!-- 例: MIT License / 社内利用のみ など、適切なライセンスを記載してください -->
未設定

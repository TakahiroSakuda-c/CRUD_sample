# CRUD_sample

社員情報の登録・参照・更新・削除（CRUD）を行うシンプルなサンプルアプリケーションです。
HTML / CSS / JavaScript のみで構成されており、ビルドやサーバーの準備なしにブラウザで動作します。

## 目次

- [概要](#概要)
- [デモ](#デモ)
- [機能](#機能)
- [動作環境](#動作環境)
- [使い方](#使い方)
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

## ディレクトリ構成

```text
CRUD_sample/
├── .github/
│   └── workflows/
│       └── claude.yml   # GitHub Actions ワークフロー
├── css/
│   └── style.css        # スタイル定義
├── js/
│   └── app.js           # CRUD 処理（JavaScript）
├── index.html           # 画面のマークアップ
└── README.md            # 本ファイル
```

HTML（構造）・CSS（見た目）・JavaScript（振る舞い）をファイル単位で分離しています。
`index.html` からは `css/style.css` と `js/app.js` を読み込みます。

## 実装メモ

- データは `js/app.js` 内の `users` 配列（メモリ上）で保持しています。
  **ページを再読み込みすると初期データに戻ります。**
- ID は `nextId` による連番で採番しています。
- 編集中かどうかは `editingId` で管理し、`null` の場合は新規登録として扱います。
- 一覧の「編集」「削除」ボタンは `data-action` / `data-id` 属性を付与し、
  `tbody` へのイベント委譲で処理しています（HTML 側に JavaScript を記述しないため）。

主な関数は以下のとおりです。

| 関数 | 役割 |
| --- | --- |
| `renderTable()` | 一覧テーブルを再描画する |
| `saveUser()` | 新規登録 / 更新を行う |
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

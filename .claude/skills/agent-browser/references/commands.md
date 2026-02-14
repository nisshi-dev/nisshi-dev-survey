# コマンドリファレンス

agent-browser の全コマンドの完全なリファレンスです。クイックスタートと一般的なパターンについては SKILL.md を参照してください。

## ナビゲーション

```bash
agent-browser open <url>      # URL に遷移（エイリアス: goto, navigate）
                              # 対応: https://, http://, file://, about:, data://
                              # プロトコル未指定の場合は https:// を自動付与
agent-browser back            # 戻る
agent-browser forward         # 進む
agent-browser reload          # ページを再読み込み
agent-browser close           # ブラウザを閉じる（エイリアス: quit, exit）
agent-browser connect 9222    # CDP ポート経由でブラウザに接続
```

## スナップショット（ページ分析）

```bash
agent-browser snapshot            # 完全なアクセシビリティツリー
agent-browser snapshot -i         # インタラクティブ要素のみ（推奨）
agent-browser snapshot -c         # コンパクト出力
agent-browser snapshot -d 3       # 深さを 3 に制限
agent-browser snapshot -s "#main" # CSS セレクタでスコープ指定
```

## インタラクション（スナップショットの @ref を使用）

```bash
agent-browser click @e1           # クリック
agent-browser dblclick @e1        # ダブルクリック
agent-browser focus @e1           # 要素にフォーカス
agent-browser fill @e2 "text"     # クリアしてから入力
agent-browser type @e2 "text"     # クリアせずに入力
agent-browser press Enter         # キーを押す（エイリアス: key）
agent-browser press Control+a     # キーの組み合わせ
agent-browser keydown Shift       # キーを押し続ける
agent-browser keyup Shift         # キーを離す
agent-browser hover @e1           # ホバー
agent-browser check @e1           # チェックボックスをオン
agent-browser uncheck @e1         # チェックボックスをオフ
agent-browser select @e1 "value"  # ドロップダウンのオプションを選択
agent-browser select @e1 "a" "b"  # 複数オプションを選択
agent-browser scroll down 500     # ページをスクロール（デフォルト: 下方向 300px）
agent-browser scrollintoview @e1  # 要素が見えるまでスクロール（エイリアス: scrollinto）
agent-browser drag @e1 @e2        # ドラッグ＆ドロップ
agent-browser upload @e1 file.pdf # ファイルをアップロード
```

## 情報の取得

```bash
agent-browser get text @e1        # 要素のテキストを取得
agent-browser get html @e1        # innerHTML を取得
agent-browser get value @e1       # input の値を取得
agent-browser get attr @e1 href   # 属性を取得
agent-browser get title           # ページタイトルを取得
agent-browser get url             # 現在の URL を取得
agent-browser get count ".item"   # マッチする要素の数をカウント
agent-browser get box @e1         # バウンディングボックスを取得
agent-browser get styles @e1      # 算出スタイルを取得（フォント、色、背景など）
```

## 状態の確認

```bash
agent-browser is visible @e1      # 表示されているか確認
agent-browser is enabled @e1      # 有効か確認
agent-browser is checked @e1      # チェックされているか確認
```

## スクリーンショットと PDF

```bash
agent-browser screenshot          # 一時ディレクトリに保存
agent-browser screenshot path.png # 指定パスに保存
agent-browser screenshot --full   # ページ全体
agent-browser pdf output.pdf      # PDF として保存
```

## 動画録画

```bash
agent-browser record start ./demo.webm    # 録画を開始
agent-browser click @e1                   # アクションを実行
agent-browser record stop                 # 録画を停止して動画を保存
agent-browser record restart ./take2.webm # 現在の録画を停止して新規開始
```

## 待機

```bash
agent-browser wait @e1                     # 要素を待機
agent-browser wait 2000                    # ミリ秒待機
agent-browser wait --text "Success"        # テキストを待機（または -t）
agent-browser wait --url "**/dashboard"    # URL パターンを待機（または -u）
agent-browser wait --load networkidle      # ネットワークアイドルを待機（または -l）
agent-browser wait --fn "window.ready"     # JS 条件を待機（または -f）
```

## マウス制御

```bash
agent-browser mouse move 100 200      # マウスを移動
agent-browser mouse down left         # ボタンを押す
agent-browser mouse up left           # ボタンを離す
agent-browser mouse wheel 100         # ホイールスクロール
```

## セマンティックロケータ（ref の代替手段）

```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find text "Sign In" click --exact      # 完全一致のみ
agent-browser find label "Email" fill "user@test.com"
agent-browser find placeholder "Search" type "query"
agent-browser find alt "Logo" click
agent-browser find title "Close" click
agent-browser find testid "submit-btn" click
agent-browser find first ".item" click
agent-browser find last ".item" click
agent-browser find nth 2 "a" hover
```

## ブラウザ設定

```bash
agent-browser set viewport 1920 1080          # ビューポートサイズを設定
agent-browser set device "iPhone 14"          # デバイスをエミュレート
agent-browser set geo 37.7749 -122.4194       # ジオロケーションを設定（エイリアス: geolocation）
agent-browser set offline on                  # オフラインモードの切り替え
agent-browser set headers '{"X-Key":"v"}'     # 追加 HTTP ヘッダー
agent-browser set credentials user pass       # HTTP Basic 認証（エイリアス: auth）
agent-browser set media dark                  # カラースキームをエミュレート
agent-browser set media light reduced-motion  # ライトモード + モーション軽減
```

## Cookie とストレージ

```bash
agent-browser cookies                     # 全 Cookie を取得
agent-browser cookies set name value      # Cookie を設定
agent-browser cookies clear               # Cookie をクリア
agent-browser storage local               # 全 localStorage を取得
agent-browser storage local key           # 特定のキーを取得
agent-browser storage local set k v       # 値を設定
agent-browser storage local clear         # 全てクリア
```

## ネットワーク

```bash
agent-browser network route <url>              # リクエストをインターセプト
agent-browser network route <url> --abort      # リクエストをブロック
agent-browser network route <url> --body '{}'  # レスポンスをモック
agent-browser network unroute [url]            # ルートを削除
agent-browser network requests                 # 追跡中のリクエストを表示
agent-browser network requests --filter api    # リクエストをフィルタ
```

## タブとウィンドウ

```bash
agent-browser tab                 # タブ一覧
agent-browser tab new [url]       # 新しいタブ
agent-browser tab 2               # インデックスでタブを切り替え
agent-browser tab close           # 現在のタブを閉じる
agent-browser tab close 2         # インデックスでタブを閉じる
agent-browser window new          # 新しいウィンドウ
```

## フレーム

```bash
agent-browser frame "#iframe"     # iframe に切り替え
agent-browser frame main          # メインフレームに戻る
```

## ダイアログ

```bash
agent-browser dialog accept [text]  # ダイアログを承認
agent-browser dialog dismiss        # ダイアログを閉じる
```

## JavaScript

```bash
agent-browser eval "document.title"          # シンプルな式のみ
agent-browser eval -b "<base64>"             # 任意の JavaScript（Base64 エンコード）
agent-browser eval --stdin                   # 標準入力からスクリプトを読み込み
```

信頼性の高い実行には `-b`/`--base64` または `--stdin` を使用してください。ネストされた引用符や特殊文字のシェルエスケープはエラーを起こしやすいです。

```bash
# スクリプトを Base64 エンコードしてから:
agent-browser eval -b "ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW3NyYyo9Il9uZXh0Il0nKQ=="

# または複数行スクリプトにはヒアドキュメント付きの標準入力を使用:
cat <<'EOF' | agent-browser eval --stdin
const links = document.querySelectorAll('a');
Array.from(links).map(a => a.href);
EOF
```

## 状態管理

```bash
agent-browser state save auth.json    # Cookie、ストレージ、認証状態を保存
agent-browser state load auth.json    # 保存済みの状態を復元
```

## グローバルオプション

```bash
agent-browser --session <name> ...    # 分離されたブラウザセッション
agent-browser --json ...              # パース用の JSON 出力
agent-browser --headed ...            # ブラウザウィンドウを表示（ヘッドレスではない）
agent-browser --full ...              # ページ全体のスクリーンショット（-f）
agent-browser --cdp <port> ...        # Chrome DevTools Protocol 経由で接続
agent-browser -p <provider> ...       # クラウドブラウザプロバイダ（--provider）
agent-browser --proxy <url> ...       # プロキシサーバーを使用
agent-browser --headers <json> ...    # URL のオリジンにスコープされた HTTP ヘッダー
agent-browser --executable-path <p>   # カスタムブラウザ実行ファイル
agent-browser --extension <path> ...  # ブラウザ拡張機能を読み込み（繰り返し可）
agent-browser --ignore-https-errors   # SSL 証明書エラーを無視
agent-browser --help                  # ヘルプを表示（-h）
agent-browser --version               # バージョンを表示（-V）
agent-browser <command> --help        # コマンドの詳細ヘルプを表示
```

## デバッグ

```bash
agent-browser --headed open example.com   # ブラウザウィンドウを表示
agent-browser --cdp 9222 snapshot         # CDP ポート経由で接続
agent-browser connect 9222                # 代替方法: connect コマンド
agent-browser console                     # コンソールメッセージを表示
agent-browser console --clear             # コンソールをクリア
agent-browser errors                      # ページエラーを表示
agent-browser errors --clear              # エラーをクリア
agent-browser highlight @e1               # 要素をハイライト
agent-browser trace start                 # トレースの記録を開始
agent-browser trace stop trace.zip        # トレースを停止して保存
```

## 環境変数

```bash
AGENT_BROWSER_SESSION="mysession"            # デフォルトのセッション名
AGENT_BROWSER_EXECUTABLE_PATH="/path/chrome" # カスタムブラウザパス
AGENT_BROWSER_EXTENSIONS="/ext1,/ext2"       # カンマ区切りの拡張機能パス
AGENT_BROWSER_PROVIDER="browserbase"         # クラウドブラウザプロバイダ
AGENT_BROWSER_STREAM_PORT="9223"             # WebSocket ストリーミングポート
AGENT_BROWSER_HOME="/path/to/agent-browser"  # カスタムインストール場所
```

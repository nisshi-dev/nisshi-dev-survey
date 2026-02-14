# 認証パターン

ログインフロー、セッション永続化、OAuth、2FA、認証済みブラウジングについて。

**関連**: [session-management.md](session-management.md) で状態永続化の詳細、[SKILL.md](../SKILL.md) でクイックスタートを参照。

## 目次

- [基本的なログインフロー](#basic-login-flow)
- [認証状態の保存](#saving-authentication-state)
- [認証の復元](#restoring-authentication)
- [OAuth / SSO フロー](#oauth--sso-flows)
- [二要素認証](#two-factor-authentication)
- [HTTP Basic 認証](#http-basic-auth)
- [Cookie ベース認証](#cookie-based-auth)
- [トークンリフレッシュ処理](#token-refresh-handling)
- [セキュリティベストプラクティス](#security-best-practices)

## 基本的なログインフロー

```bash
# ログインページに遷移
agent-browser open https://app.example.com/login
agent-browser wait --load networkidle

# フォーム要素を取得
agent-browser snapshot -i
# 出力: @e1 [input type="email"], @e2 [input type="password"], @e3 [button] "Sign In"

# 認証情報を入力
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"

# 送信
agent-browser click @e3
agent-browser wait --load networkidle

# ログイン成功を確認
agent-browser get url  # ログインページではなくダッシュボードであること
```

## 認証状態の保存

ログイン後、再利用のために状態を保存する:

```bash
# まずログインする（上記を参照）
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --url "**/dashboard"

# 認証済み状態を保存
agent-browser state save ./auth-state.json
```

## 認証の復元

保存済みの状態を読み込んでログインをスキップする:

```bash
# 保存済みの認証状態を読み込む
agent-browser state load ./auth-state.json

# 保護されたページに直接遷移
agent-browser open https://app.example.com/dashboard

# 認証済みであることを確認
agent-browser snapshot -i
```

## OAuth / SSO フロー

OAuth リダイレクトの場合:

```bash
# OAuth フローを開始
agent-browser open https://app.example.com/auth/google

# リダイレクトを自動的に処理
agent-browser wait --url "**/accounts.google.com**"
agent-browser snapshot -i

# Google の認証情報を入力
agent-browser fill @e1 "user@gmail.com"
agent-browser click @e2  # 次へボタン
agent-browser wait 2000
agent-browser snapshot -i
agent-browser fill @e3 "password"
agent-browser click @e4  # ログイン

# リダイレクトで戻るのを待つ
agent-browser wait --url "**/app.example.com**"
agent-browser state save ./oauth-state.json
```

## 二要素認証

手動介入による 2FA の処理:

```bash
# 認証情報でログイン
agent-browser open https://app.example.com/login --headed  # ブラウザを表示
agent-browser snapshot -i
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3

# ユーザーが手動で 2FA を完了するのを待つ
echo "ブラウザウィンドウで 2FA を完了してください..."
agent-browser wait --url "**/dashboard" --timeout 120000

# 2FA 完了後に状態を保存
agent-browser state save ./2fa-state.json
```

## HTTP Basic 認証

HTTP Basic 認証を使用するサイトの場合:

```bash
# ナビゲーション前に認証情報を設定
agent-browser set credentials username password

# 保護されたリソースに遷移
agent-browser open https://protected.example.com/api
```

## Cookie ベース認証

認証 Cookie を手動で設定する:

```bash
# 認証 Cookie を設定
agent-browser cookies set session_token "abc123xyz"

# 保護されたページに遷移
agent-browser open https://app.example.com/dashboard
```

## トークンリフレッシュ処理

有効期限付きトークンを持つセッションの場合:

```bash
#!/bin/bash
# トークンリフレッシュを処理するラッパー

STATE_FILE="./auth-state.json"

# 既存の状態を読み込む
if [[ -f "$STATE_FILE" ]]; then
    agent-browser state load "$STATE_FILE"
    agent-browser open https://app.example.com/dashboard

    # セッションがまだ有効か確認
    URL=$(agent-browser get url)
    if [[ "$URL" == *"/login"* ]]; then
        echo "セッションが期限切れです。再認証中..."
        # 新規ログインを実行
        agent-browser snapshot -i
        agent-browser fill @e1 "$USERNAME"
        agent-browser fill @e2 "$PASSWORD"
        agent-browser click @e3
        agent-browser wait --url "**/dashboard"
        agent-browser state save "$STATE_FILE"
    fi
else
    # 初回ログイン
    agent-browser open https://app.example.com/login
    # ... ログインフロー ...
fi
```

## セキュリティベストプラクティス

1. **状態ファイルをコミットしない** - セッショントークンが含まれています
   ```bash
   echo "*.auth-state.json" >> .gitignore
   ```

2. **認証情報には環境変数を使用する**
   ```bash
   agent-browser fill @e1 "$APP_USERNAME"
   agent-browser fill @e2 "$APP_PASSWORD"
   ```

3. **自動化後にクリーンアップする**
   ```bash
   agent-browser cookies clear
   rm -f ./auth-state.json
   ```

4. **CI/CD では短命セッションを使用する**
   ```bash
   # CI では状態を永続化しない
   agent-browser open https://app.example.com/login
   # ... ログインしてアクションを実行 ...
   agent-browser close  # セッション終了、何も永続化されない
   ```

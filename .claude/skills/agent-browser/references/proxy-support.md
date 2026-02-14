# プロキシサポート

ジオテスト、レート制限回避、企業環境向けのプロキシ設定。

**関連**: [commands.md](commands.md) でグローバルオプション、[SKILL.md](../SKILL.md) でクイックスタートを参照。

## 目次

- [基本的なプロキシ設定](#basic-proxy-configuration)
- [認証付きプロキシ](#authenticated-proxy)
- [SOCKS プロキシ](#socks-proxy)
- [プロキシバイパス](#proxy-bypass)
- [一般的なユースケース](#common-use-cases)
- [プロキシ接続の確認](#verifying-proxy-connection)
- [トラブルシューティング](#troubleshooting)
- [ベストプラクティス](#best-practices)

## 基本的なプロキシ設定

開始前に環境変数でプロキシを設定する:

```bash
# HTTP プロキシ
export HTTP_PROXY="http://proxy.example.com:8080"
agent-browser open https://example.com

# HTTPS プロキシ
export HTTPS_PROXY="https://proxy.example.com:8080"
agent-browser open https://example.com

# 両方
export HTTP_PROXY="http://proxy.example.com:8080"
export HTTPS_PROXY="http://proxy.example.com:8080"
agent-browser open https://example.com
```

## 認証付きプロキシ

認証が必要なプロキシの場合:

```bash
# URL に認証情報を含める
export HTTP_PROXY="http://username:password@proxy.example.com:8080"
agent-browser open https://example.com
```

## SOCKS プロキシ

```bash
# SOCKS5 プロキシ
export ALL_PROXY="socks5://proxy.example.com:1080"
agent-browser open https://example.com

# 認証付き SOCKS5
export ALL_PROXY="socks5://user:pass@proxy.example.com:1080"
agent-browser open https://example.com
```

## プロキシバイパス

特定のドメインに対してプロキシをスキップする:

```bash
# ローカルアドレスのプロキシをバイパス
export NO_PROXY="localhost,127.0.0.1,.internal.company.com"
agent-browser open https://internal.company.com  # 直接接続
agent-browser open https://external.com          # プロキシ経由
```

## 一般的なユースケース

### ジオロケーションテスト

```bash
#!/bin/bash
# ジオロケーション対応プロキシを使用して異なる地域からサイトをテスト

PROXIES=(
    "http://us-proxy.example.com:8080"
    "http://eu-proxy.example.com:8080"
    "http://asia-proxy.example.com:8080"
)

for proxy in "${PROXIES[@]}"; do
    export HTTP_PROXY="$proxy"
    export HTTPS_PROXY="$proxy"

    region=$(echo "$proxy" | grep -oP '^\w+-\w+')
    echo "テスト中の地域: $region"

    agent-browser --session "$region" open https://example.com
    agent-browser --session "$region" screenshot "./screenshots/$region.png"
    agent-browser --session "$region" close
done
```

### スクレイピング用プロキシローテーション

```bash
#!/bin/bash
# レート制限を回避するためにプロキシリストをローテーション

PROXY_LIST=(
    "http://proxy1.example.com:8080"
    "http://proxy2.example.com:8080"
    "http://proxy3.example.com:8080"
)

URLS=(
    "https://site.com/page1"
    "https://site.com/page2"
    "https://site.com/page3"
)

for i in "${!URLS[@]}"; do
    proxy_index=$((i % ${#PROXY_LIST[@]}))
    export HTTP_PROXY="${PROXY_LIST[$proxy_index]}"
    export HTTPS_PROXY="${PROXY_LIST[$proxy_index]}"

    agent-browser open "${URLS[$i]}"
    agent-browser get text body > "output-$i.txt"
    agent-browser close

    sleep 1  # 礼儀正しい遅延
done
```

### 企業ネットワークアクセス

```bash
#!/bin/bash
# 企業プロキシ経由で内部サイトにアクセス

export HTTP_PROXY="http://corpproxy.company.com:8080"
export HTTPS_PROXY="http://corpproxy.company.com:8080"
export NO_PROXY="localhost,127.0.0.1,.company.com"

# 外部サイトはプロキシ経由
agent-browser open https://external-vendor.com

# 内部サイトはプロキシをバイパス
agent-browser open https://intranet.company.com
```

## プロキシ接続の確認

```bash
# 見かけ上の IP を確認
agent-browser open https://httpbin.org/ip
agent-browser get text body
# 実際の IP ではなく、プロキシの IP が表示されるはず
```

## トラブルシューティング

### プロキシ接続に失敗

```bash
# まずプロキシの接続性をテスト
curl -x http://proxy.example.com:8080 https://httpbin.org/ip

# プロキシが認証を必要としているか確認
export HTTP_PROXY="http://user:pass@proxy.example.com:8080"
```

### プロキシ経由の SSL/TLS エラー

一部のプロキシは SSL インスペクションを実行します。証明書エラーが発生した場合:

```bash
# テスト目的のみ - 本番環境には非推奨
agent-browser open https://example.com --ignore-https-errors
```

### パフォーマンスの低下

```bash
# 必要な場合のみプロキシを使用
export NO_PROXY="*.cdn.com,*.static.com"  # CDN への直接アクセス
```

## ベストプラクティス

1. **環境変数を使用する** - プロキシの認証情報をハードコードしない
2. **NO_PROXY を適切に設定する** - ローカルトラフィックをプロキシ経由にしない
3. **自動化前にプロキシをテストする** - シンプルなリクエストで接続性を確認
4. **プロキシ障害を適切に処理する** - 不安定なプロキシにはリトライロジックを実装
5. **大規模スクレイピングではプロキシをローテーションする** - 負荷を分散しBAN を回避

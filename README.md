# Mural

背景画像の上に時計と日付を表示するデジタルサイネージ用 Web アプリケーションです。Raspberry Pi などに接続したモニタをイントラネット経由で壁掛け時計として利用することを想定しています。

## 機能

- 時刻・日付のリアルタイム表示
- 指定ディレクトリの画像をシーケンシャルまたはランダムに背景として表示
- 画像の切り替え間隔を設定可能
- フォント・文字色・サイズ・表示位置を設定ファイルで変更可能
- 曜日・時間帯ごとの表示スケジュール管理（暗くする / 停止）
- ブラウザから操作できる管理画面

## 技術スタック

- **バックエンド**: Ruby on Rails 8 (API モード)
- **フロントエンド**: HTML / CSS / JavaScript (フレームワークなし)
- **データベース**: MySQL 8
- **Web サーバー**: nginx (本番)

## 必要な環境

- Ruby 3.4 以上
- MySQL 8
- nginx (本番環境)
- Docker / Docker Compose (開発環境)

## セットアップ

### 開発環境

```bash
# リポジトリのクローン
git clone <repository_url>
cd mural

# 画像ディレクトリの作成
mkdir -p images

# コンテナの起動
docker compose up --build

# データベースの作成とマイグレーション
docker compose exec rails bundle exec rails db:create db:migrate
```

| URL | 説明 |
|-----|------|
| http://localhost:3000/clock/ | 時計画面 |
| http://localhost:3000/admin/ | 管理画面 |

### 本番環境

```bash
bundle install --without development test
RAILS_ENV=production bundle exec rails db:create db:migrate
```

nginx の設定例は `config/nginx.conf` を参照してください。

## 設定

`config/mural.yml` で表示内容を変更できます。開発環境ではサーバーの再起動なしに反映されます。

```yaml
default:
  images:
    directory: /var/mural/images  # 背景画像のディレクトリ (環境変数 MURAL_IMAGE_DIR でも指定可)
    mode: sequential              # sequential (順番) または random (ランダム)
    interval_seconds: 300         # 画像の切り替え間隔（秒）

  display:
    font_family: "Noto Sans JP"   # フォント名
    font_url: "https://..."       # Google Fonts の URL
    clock_color: "#ffffff"        # 時刻の文字色
    date_color: "#eeeeee"         # 日付の文字色
    clock_font_size: "10vw"       # 時刻のフォントサイズ
    date_font_size: "1.5vw"       # 日付のフォントサイズ
    show_seconds: false           # 秒を表示するか
    clock_shadow: "0 2px 20px rgba(0,0,0,0.8)"  # 文字の影
    position_x: center            # 水平位置 (left / center / right)
    position_y: bottom            # 垂直位置 (top / center / bottom)
```

### 背景画像

`directory` に指定したディレクトリに JPEG・PNG・GIF・WebP 形式の画像を置くと自動的に使用されます。

## スケジュール管理

管理画面（`/admin/`）から曜日・時間帯ごとに表示のスケジュールを設定できます。

| アクション | 動作 |
|-----------|------|
| dim | 黒いオーバーレイで画面を暗くする（暗さ 0〜100% で調整可能） |
| stop | 画面全体を非表示にする |

- 日をまたぐ時間帯（例: 22:00〜07:00）にも対応
- スケジュールは毎分0秒に評価される

## API

| メソッド | パス | 説明 |
|--------|------|------|
| GET | `/api/images/next` | 次の背景画像の URL を返す |
| GET | `/api/config` | 表示設定を返す |
| GET | `/api/schedule/status` | 現在のスケジュール状態を返す |
| GET | `/api/schedules` | スケジュール一覧を返す |
| POST | `/api/schedules` | スケジュールを作成する |
| PUT | `/api/schedules/:id` | スケジュールを更新する |
| DELETE | `/api/schedules/:id` | スケジュールを削除する |

## nginx 設定

本番環境では nginx が以下を担当します。

- `/clock/` → 時計フロントエンド静的ファイルの配信
- `/admin/` → 管理画面フロントエンド静的ファイルの配信
- `/images/` → 背景画像ディレクトリの直接配信
- `/api/` → Rails (Puma) へのリバースプロキシ

詳細は `config/nginx.conf` を参照してください。

## Raspberry Pi での利用

Debian 12 (bookworm) での表示には Cage (Wayland コンポジタ) と Chromium のキオスクモードを組み合わせる方法を推奨します。

```bash
# 必要パッケージのインストール
sudo apt install cage chromium fonts-noto-cjk xwayland seatd

# seatd の有効化（Wayland コンポジタがハードウェアにアクセスするための仲介デーモン）
sudo systemctl enable seatd
sudo systemctl start seatd

# ユーザーを必要なグループに追加
sudo usermod -aG seat,video,input,tty <ユーザー名>

# ログイン不要でユーザーセッションを維持
loginctl enable-linger <ユーザー名>
```

systemd サービスの設定例は以下の通りです：

```ini
# /etc/systemd/system/kiosk.service
[Unit]
Description=Mural Kiosk
After=network-online.target
Wants=network-online.target

[Service]
User=<ユーザー名>
Environment=HOME=/home/<ユーザー名>
Environment=XDG_RUNTIME_DIR=/run/user/1000
Environment=LIBSEAT_BACKEND=seatd
ExecStart=/home/<ユーザー名>/kiosk.sh
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
#!/bin/bash
# kiosk.sh
sleep 3
export WLR_LIBINPUT_NO_DEVICES=1
export LIBSEAT_BACKEND=seatd

exec cage -- chromium \
  --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --disable-translate \
  --no-first-run \
  --disable-features=TranslateUI,Translate \
  --disable-restore-session-state \
  --disable-hang-monitor \
  --lang=ja \
  http://<サーバーのIPアドレス>/clock/
```

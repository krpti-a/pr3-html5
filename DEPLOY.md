# Deploying PR3 HTML5 on a server

The server is one Node.js process (Node 22.13+; 24 recommended) with no runtime dependencies. It serves the
game files from `public/`, the HTTP API under `/api/` and the game WebSocket at `/ws`, and keeps everything in
one SQLite file (`data/pr3.db`).

## 1. Build and copy

```bash
npm ci && npm run build
```

Copy the folder to the server (everything except `node_modules/`, `tools/` and `client/` is enough at runtime:
`server/`, `public/`, `data/`, `package.json`).

## 2. Settings (environment variables)

| Variable | Set it to | Why |
| --- | --- | --- |
| `PR3_ADMIN_PASS` | **your own password** | The built-in admin password is in the code. Without this, anyone who has seen the code can log in as admin. |
| `PR3_ADMIN_USER` | optional | Name of the default admin account (default `123456q`). |
| `HOST` | `127.0.0.1` | Only the reverse proxy should reach the game port. |
| `PORT` | e.g. `8080` | |
| `PR3_TRUST_PROXY` | `1` behind alwaysdata/nginx/Caddy | Uses the proxy's `X-Real-IP` (or last `X-Forwarded-For`) for the player's IP. Without it every player looks like the proxy (the server logs a warning), and per-IP limits and guest bans would hit everyone. **Never set it without a proxy**: then players could fake their IP. |
| `PR3_SECURE_COOKIE` | `1` if HTTPS isn't detected | Login cookies get the `Secure` flag (detected automatically behind a trusted proxy that sends `X-Forwarded-Proto: https`). |
| `PR3_SERVER_NAME` | e.g. `My Server` | Shown in the server list. |
| `PR3_DB` | optional | Database path (default `data/pr3.db`). |
| `PR3_MAX_CONN_PER_IP` / `PR3_MAX_CONN` | defaults 8 / 2000 | Game connections per IP / in total. |
| `PR3_DEBUG` | leave unset | Logs every message, including chat, to stdout. |

## 3. Run it as a service with hard resource limits

The server can't freeze the machine the way the game froze a PC (that was the browser's rendering, which never
runs on the server). Measured: about 57 MB idle and about 90 MB with 300 players online. The limits below make sure that even a
bug can only ever take down the game process, never the server: systemd kills and restarts it if it goes over.

`/etc/systemd/system/pr3.service`:

```ini
[Unit]
Description=Platform Racing 3 (HTML5)
After=network.target

[Service]
User=pr3
WorkingDirectory=/opt/pr3-html5
ExecStart=/usr/bin/node --max-old-space-size=384 server/index.js
Environment=HOST=127.0.0.1 PORT=8080 PR3_TRUST_PROXY=1 PR3_SERVER_NAME=PR3
EnvironmentFile=/etc/pr3.env
Restart=always
RestartSec=3
# resource caps: the process can never starve the rest of the server
MemoryMax=512M
CPUQuota=100%
TasksMax=64
LimitNOFILE=8192
# sandbox: read-only system, writes only to the database folder
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ReadWritePaths=/opt/pr3-html5/data

[Install]
WantedBy=multi-user.target
```

`/etc/pr3.env` (readable by root only, `chmod 600`):

```
PR3_ADMIN_PASS=change-me
```

```bash
sudo useradd --system --home /opt/pr3-html5 pr3
sudo chown -R pr3: /opt/pr3-html5/data
sudo systemctl enable --now pr3
journalctl -u pr3 -f
```

## 4. Reverse proxy with HTTPS

Caddy (gets certificates automatically; WebSockets work out of the box):

```
pr3.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

nginx:

```nginx
server {
    server_name pr3.example.com;
    listen 443 ssl;  # certificates via certbot
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

Firewall: open only 22, 80 and 443. The game port stays on 127.0.0.1.

## 5. Backups

The database is the only state. Back it up while running with:

```bash
sqlite3 /opt/pr3-html5/data/pr3.db ".backup '/var/backups/pr3-$(date +%F).db'"
```

## What protects the server

- **No file uploads.** Levels, blocks and stamps are stored as text/BLOBs inside SQLite. Nothing a player sends is
  ever written as a file, executed, or served back from disk, and only the read-only `public/` folder is served. There
  is no PHP or other interpreter involved, so a "sprite that turns into a .php" has nowhere to go.
- **No outbound requests, no shell commands, parameterized SQL everywhere.**
- **Crash-proof request handling:** malformed requests get a 400 (one bad URL used to kill the process), and
  unexpected errors are logged instead of crashing.
- **Limits:** request bodies up to 8 MB, with smaller caps for saved game data; database saves stop at 400 MB;
  WebSocket messages up to 256 KB; about 100 messages per second per connection (flooders are disconnected);
  8 connections per IP; slow or stalled clients are dropped; login attempts (10/min), new accounts
  (3/hour per IP) and saves (20/min per account) are rate limited.
- **Browser side:** a Content Security Policy and related headers. Links in player-written text only open
  `http(s)` pages. Login cookies are `HttpOnly` and `SameSite=Lax`, and `Secure` over HTTPS.

Check a deployment with the abuse test (from a machine with the repo):

```bash
node tools/headless/abuse.mjs https://pr3.example.com
```

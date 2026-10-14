# Heatwave 2048

A 2048 game with:
- a **name step** so each game is attributed to a player (no PIN needed to play),
- a **shared leaderboard** — click any name to make it grow and reveal that player's tries (each try shows its score and the date),
- a **PIN-gated Clear button** (default `160417`) that wipes the whole leaderboard.

Scores are kept by a tiny Node/Express server, so everyone who opens the page sees the same board.

## Files
```
heatwave-2048/
├─ server.js          # Express server + /api/scores
├─ package.json
├─ .gitignore
└─ public/
   └─ index.html      # the whole game (no build step)
```

---

## Part 1 — Put it on GitHub (web UI only, no terminal)

1. Go to **github.com**, sign in, click the **+** (top right) → **New repository**.
2. Name it `heatwave-2048`, leave it **Public** (or Private — Render reads both once connected), **don't** add a README (you already have one), click **Create repository**.
3. On the empty repo page, click **uploading an existing file**.
4. Drag in **server.js**, **package.json**, **.gitignore**, **README.md**, and the **public** folder (drag the whole folder so `public/index.html` keeps its path). GitHub preserves the folder structure.
5. Scroll down, click **Commit changes**.

That's your repo. Any time you want to change the game, edit the file on GitHub (pencil icon) and commit — Render redeploys automatically.

---

## Part 2 — Deploy on Render

1. Go to **render.com**, sign in (easiest: **Sign in with GitHub**).
2. Dashboard → **New +** → **Web Service**. (Not "Static Site" — this app has a server.)
3. Connect your GitHub account if prompted, then pick the **heatwave-2048** repo → **Connect**.
4. Fill in the settings:
   - **Name:** `heatwave-2048` (becomes part of the URL)
   - **Region:** closest to you (e.g. Singapore)
   - **Branch:** `main`
   - **Runtime / Language:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** **Free**
5. Click **Create Web Service**. Render installs and starts it; first build takes a minute or two.
6. When it says **Live**, open the URL at the top (e.g. `https://heatwave-2048.onrender.com`). Enter the PIN and play.

You don't set a PORT — Render provides one and the server reads it automatically.

---

## Good to know

- **Free plan sleeps.** After ~15 minutes idle the service spins down; the next visit takes ~30 seconds to wake. Normal for the free tier.
- **Scores reset on redeploy (free plan).** The leaderboard is stored in `scores.json` on Render's ephemeral disk, so a new deploy or a restart clears it. To keep scores permanently, either:
  - add a **Render Disk** (paid instance): mount it at e.g. `/var/data`, then add an environment variable `DATA_DIR=/var/data` — the server will write there; or
  - swap the file store for a free hosted database later (ask me and I'll wire it up).
- **The Clear PIN** is `160417`. Anyone can play without it; it's only asked for when someone taps **Clear** on the leaderboard. The server checks it, so a random visitor can't wipe the board. To change it, set an environment variable `CLEAR_PIN` on Render (Settings → Environment), or edit `const CLEAR_PIN = "160417";` in `server.js` and `const PIN = "160417";` in `public/index.html`. It's a soft gate, not real security — don't put anything sensitive behind it.

## Run it locally (optional, needs Node)
```
npm install
npm start
```
Then open `http://localhost:3000`.

// Heatwave 2048 — tiny leaderboard server.
// Serves the game and keeps a shared list of finished-game "tries".
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Where scores are kept. On Render's free plan this file lives on an
// ephemeral disk and resets on redeploy/restart (see README for how to
// make it durable). DATA_DIR lets you point it at a mounted Render Disk.
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, "scores.json");
const MAX_ENTRIES = 5000; // keep the file bounded

// PIN required to clear the leaderboard (NOT to play). Override on Render
// with an env var CLEAR_PIN if you want to change it without editing code.
const CLEAR_PIN = process.env.CLEAR_PIN || "160417";

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

function readScores() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (e) {
    return [];
  }
}
function writeScores(list) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(list));
  } catch (e) {
    console.error("Could not write scores:", e.message);
  }
}

// All finished-game tries, newest activity first is handled client-side.
app.get("/api/scores", (req, res) => {
  res.json(readScores());
});

// Record one try: { name, score, ts }
app.post("/api/scores", (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "").trim().slice(0, 40);
  const score = Math.max(0, Math.floor(Number(body.score) || 0));
  const ts = Number(body.ts) || Date.now();
  if (!name || score <= 0) {
    return res.status(400).json({ error: "name and a positive score are required" });
  }
  const list = readScores();
  list.push({ name, score, ts });
  if (list.length > MAX_ENTRIES) list.splice(0, list.length - MAX_ENTRIES);
  writeScores(list);
  res.json(list);
});

// Clear the whole leaderboard — requires the PIN in the body: { pin }
app.delete("/api/scores", (req, res) => {
  const pin = String((req.body || {}).pin || "");
  if (pin !== CLEAR_PIN) {
    return res.status(403).json({ error: "wrong pin" });
  }
  writeScores([]);
  res.json([]);
});

app.get("/healthz", (req, res) => res.send("ok"));

app.listen(PORT, () => console.log("Heatwave 2048 running on port " + PORT));

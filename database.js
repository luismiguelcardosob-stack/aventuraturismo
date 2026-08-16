const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "data", "aventura.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function getState() {
  const row = db
    .prepare("SELECT state_json, updated_at FROM app_state WHERE id = 1")
    .get();

  if (!row) {
    return {
      state: {},
      updatedAt: null
    };
  }

  return {
    state: JSON.parse(row.state_json),
    updatedAt: row.updated_at
  };
}

function saveState(state) {
  const now = new Date().toISOString();
  const json = JSON.stringify(state);

  const current = db
    .prepare("SELECT state_json FROM app_state WHERE id = 1")
    .get();

  if (current) {
    db.prepare(`
      INSERT INTO backups (state_json, created_at)
      VALUES (?, ?)
    `).run(current.state_json, now);
  }

  db.prepare(`
    INSERT INTO app_state (id, state_json, updated_at)
    VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      state_json = excluded.state_json,
      updated_at = excluded.updated_at
  `).run(json, now);

  return now;
}

module.exports = {
  db,
  getState,
  saveState
};
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");

const {
  getState,
  saveState
} = require("./database");

const app = express();
const PORT = 3000;

const UPDATE_CONFIG_PATH = path.join(__dirname, "update-config.json");
const UPDATE_BACKUP_DIR = path.join(__dirname, "update-backups");
const CURRENT_APP_VERSION = "v.90M";

function loadUpdateConfig() {
  try {
    if (!fs.existsSync(UPDATE_CONFIG_PATH)) return null;
    const cfg = JSON.parse(fs.readFileSync(UPDATE_CONFIG_PATH, "utf8"));
    if (!cfg?.enabled || !cfg?.manifestUrl) return null;
    return cfg;
  } catch (err) {
    console.error("Erro ao ler update-config.json:", err.message);
    return null;
  }
}

function normalizeVersion(v) {
  return String(v || "").trim().toLowerCase().replace(/^v\./, "").replace(/^v/, "");
}

function isVersionNewer(latest, current) {
  const a = normalizeVersion(latest);
  const b = normalizeVersion(current);
  if (!a || !b || a === b) return false;

  const ma = a.match(/^(\d+)([a-z]+)?$/i);
  const mb = b.match(/^(\d+)([a-z]+)?$/i);
  if (ma && mb) {
    const na = Number(ma[1]);
    const nb = Number(mb[1]);
    if (na !== nb) return na > nb;
    return String(ma[2] || "").localeCompare(String(mb[2] || "")) > 0;
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }) > 0;
}

async function fetchUpdateManifest() {
  const cfg = loadUpdateConfig();
  if (!cfg) return { configured: false, config: null, manifest: null };

  const res = await fetch(cfg.manifestUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Manifesto retornou HTTP ${res.status}.`);

  const manifest = await res.json();
  if (!manifest?.version || !Array.isArray(manifest?.files)) {
    throw new Error("Manifesto de atualização inválido.");
  }

  return { configured: true, config: cfg, manifest };
}

function safeUpdateTarget(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  const allowed = [
    "public/app.js",
    "public/index.html",
    "public/styles.css",
    "public/auth.js",
    "public/supabase-config.js",
    "server.js",
    "database.js",
    "package.json",
    "package-lock.json"
  ];

  if (!allowed.includes(normalized)) {
    throw new Error(`Arquivo não permitido no atualizador: ${normalized}`);
  }

  return path.join(__dirname, ...normalized.split("/"));
}

async function downloadTextFile(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao baixar ${url} (HTTP ${res.status}).`);
  return await res.text();
}

async function installUpdateManifest(manifest) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupRoot = path.join(UPDATE_BACKUP_DIR, `${CURRENT_APP_VERSION}-antes-${timestamp}`);
  fs.mkdirSync(backupRoot, { recursive: true });

  const staged = [];

  // Baixa todos primeiro. Só depois substitui.
  for (const item of manifest.files) {
    if (!item?.path || !item?.url) throw new Error("Entrada de arquivo inválida no manifesto.");
    const target = safeUpdateTarget(item.path);
    const content = await downloadTextFile(item.url);
    staged.push({ item, target, content });
  }

  // Backup dos arquivos atuais.
  for (const { item, target } of staged) {
    if (!fs.existsSync(target)) continue;
    const backupTarget = path.join(backupRoot, ...item.path.split("/"));
    fs.mkdirSync(path.dirname(backupTarget), { recursive: true });
    fs.copyFileSync(target, backupTarget);
  }

  // Substituição atômica por arquivo.
  for (const { target, content } of staged) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const temp = `${target}.update-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    fs.writeFileSync(temp, content, "utf8");
    fs.renameSync(temp, target);
  }

  return backupRoot;
}



const REMOTE_CONFIG_PATH = path.join(__dirname, "remote-sync-config.json");

const remoteStatus = {
  enabled: false,
  connected: false,
  lastSyncAt: null,
  lastDirection: null,
  lastError: null,
  lastCloudAt: null,
  lastLocalAt: null
};

let remoteConfig = null;
let remoteToken = null;
let remoteTokenExpiresAt = 0;
let remoteUserId = null;
let remoteSyncBusy = false;

function loadRemoteConfig() {
  try {
    if (!fs.existsSync(REMOTE_CONFIG_PATH)) return null;
    const cfg = JSON.parse(fs.readFileSync(REMOTE_CONFIG_PATH, "utf8"));
    if (!cfg?.enabled || !cfg?.url || !cfg?.anonKey || !cfg?.email || !cfg?.password) {
      return null;
    }
    return cfg;
  } catch (err) {
    console.error("Erro ao ler remote-sync-config.json:", err.message);
    return null;
  }
}

async function remoteLogin(force = false) {
  if (!remoteConfig) return null;
  if (!force && remoteToken && Date.now() < remoteTokenExpiresAt - 60000) {
    return remoteToken;
  }

  const response = await fetch(`${remoteConfig.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "apikey": remoteConfig.anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: remoteConfig.email,
      password: remoteConfig.password
    })
  });

  const data = await response.json();
  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description || data?.msg || "Falha no login da sincronização remota.");
  }

  remoteToken = data.access_token;
  remoteUserId = data.user?.id || null;
  remoteTokenExpiresAt = Date.now() + Number(data.expires_in || 3600) * 1000;
  return remoteToken;
}

async function remoteFetch(pathname, options = {}, retry = true) {
  const token = await remoteLogin();

  const response = await fetch(`${remoteConfig.url}${pathname}`, {
    ...options,
    headers: {
      "apikey": remoteConfig.anonKey,
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (response.status === 401 && retry) {
    await remoteLogin(true);
    return remoteFetch(pathname, options, false);
  }

  return response;
}

async function getCloudState() {
  const res = await remoteFetch(
    "/rest/v1/app_state?id=eq.1&select=id,state,updated_at,updated_by",
    { headers: { "Accept": "application/json" } }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.hint || "Falha ao ler estado na nuvem.");
  }
  return Array.isArray(data) ? data[0] || null : null;
}

async function pushCloudState(localData) {
  const payload = {
    id: 1,
    state: localData.state,
    updated_at: localData.updatedAt || new Date().toISOString(),
    updated_by: remoteUserId
  };

  const res = await remoteFetch(
    "/rest/v1/app_state?on_conflict=id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.hint || "Falha ao enviar estado para a nuvem.");
  }
  return Array.isArray(data) ? data[0] || payload : payload;
}

function asTime(value) {
  const n = Date.parse(value || "");
  return Number.isFinite(n) ? n : 0;
}

async function syncRemoteOnce() {
  if (!remoteConfig || remoteSyncBusy) return;
  remoteSyncBusy = true;

  try {
    const local = getState();
    const cloud = await getCloudState();

    remoteStatus.enabled = true;
    remoteStatus.connected = true;
    remoteStatus.lastError = null;

    if (!cloud) {
      if (local?.state && Object.keys(local.state).length) {
        const pushed = await pushCloudState(local);
        remoteStatus.lastCloudAt = pushed?.updated_at || local.updatedAt;
        remoteStatus.lastLocalAt = local.updatedAt;
        remoteStatus.lastDirection = "LOCAL_PARA_NUVEM";
      }
      remoteStatus.lastSyncAt = new Date().toISOString();
      return;
    }

    if (!local?.updatedAt || !local?.state || !Object.keys(local.state).length) {
      const savedAt = saveState(cloud.state || {});
      remoteStatus.lastCloudAt = cloud.updated_at;
      remoteStatus.lastLocalAt = savedAt;
      remoteStatus.lastDirection = "NUVEM_PARA_LOCAL";
      remoteStatus.lastSyncAt = new Date().toISOString();
      return;
    }

    // Primeira comparação após iniciar o servidor.
    if (!remoteStatus.lastCloudAt && !remoteStatus.lastLocalAt) {
      if (asTime(cloud.updated_at) > asTime(local.updatedAt)) {
        const savedAt = saveState(cloud.state || {});
        remoteStatus.lastCloudAt = cloud.updated_at;
        remoteStatus.lastLocalAt = savedAt;
        remoteStatus.lastDirection = "NUVEM_PARA_LOCAL";
      } else {
        const pushed = await pushCloudState(local);
        remoteStatus.lastCloudAt = pushed?.updated_at || local.updatedAt;
        remoteStatus.lastLocalAt = local.updatedAt;
        remoteStatus.lastDirection = "LOCAL_PARA_NUVEM";
      }
      remoteStatus.lastSyncAt = new Date().toISOString();
      return;
    }

    const cloudChanged = cloud.updated_at !== remoteStatus.lastCloudAt;
    const localChanged = local.updatedAt !== remoteStatus.lastLocalAt;

    if (cloudChanged && !localChanged) {
      const savedAt = saveState(cloud.state || {});
      remoteStatus.lastCloudAt = cloud.updated_at;
      remoteStatus.lastLocalAt = savedAt;
      remoteStatus.lastDirection = "NUVEM_PARA_LOCAL";
    } else if (localChanged && !cloudChanged) {
      const pushed = await pushCloudState(local);
      remoteStatus.lastCloudAt = pushed?.updated_at || local.updatedAt;
      remoteStatus.lastLocalAt = local.updatedAt;
      remoteStatus.lastDirection = "LOCAL_PARA_NUVEM";
    } else if (cloudChanged && localChanged) {
      // Conflito simultâneo: vence o estado com timestamp mais recente.
      if (asTime(cloud.updated_at) > asTime(local.updatedAt)) {
        const savedAt = saveState(cloud.state || {});
        remoteStatus.lastCloudAt = cloud.updated_at;
        remoteStatus.lastLocalAt = savedAt;
        remoteStatus.lastDirection = "CONFLITO_NUVEM_VENCEU";
      } else {
        const pushed = await pushCloudState(local);
        remoteStatus.lastCloudAt = pushed?.updated_at || local.updatedAt;
        remoteStatus.lastLocalAt = local.updatedAt;
        remoteStatus.lastDirection = "CONFLITO_LOCAL_VENCEU";
      }
    } else {
      remoteStatus.lastCloudAt = cloud.updated_at;
      remoteStatus.lastLocalAt = local.updatedAt;
      remoteStatus.lastDirection = "SEM_ALTERACAO";
    }

    remoteStatus.lastSyncAt = new Date().toISOString();
  } catch (err) {
    remoteStatus.enabled = Boolean(remoteConfig);
    remoteStatus.connected = false;
    remoteStatus.lastError = err?.message || String(err);
    console.error("Sincronização remota:", remoteStatus.lastError);
  } finally {
    remoteSyncBusy = false;
  }
}

remoteConfig = loadRemoteConfig();
remoteStatus.enabled = Boolean(remoteConfig);

if (remoteConfig) {
  console.log("SINCRONIZAÇÃO REMOTA: configurada");
  setInterval(syncRemoteOnce, 3000);
  setTimeout(syncRemoteOnce, 1000);
} else {
  console.log("SINCRONIZAÇÃO REMOTA: não configurada");
}


const PUBLIC_DIR = path.join(__dirname, "public");

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Teste do servidor
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    server: "Aventura Turismo Offline",
    database: "SQLite",
    time: new Date().toISOString()
  });
});

// Buscar todos os dados do sistema
app.get("/api/state", (req, res) => {
  try {
    const data = getState();

    res.json({
      ok: true,
      version: 1,
      updatedAt: data.updatedAt,
      state: data.state
    });
  } catch (error) {
    console.error("Erro ao buscar estado:", error);

    res.status(500).json({
      ok: false,
      error: "Erro ao carregar banco local."
    });
  }
});

// Salvar todos os dados do sistema
app.post("/api/state", (req, res) => {
  try {
    const incomingState = req.body?.state;

    if (!incomingState || typeof incomingState !== "object") {
      return res.status(400).json({
        ok: false,
        error: "Estado inválido."
      });
    }

    const updatedAt = saveState(incomingState);

    res.json({
      ok: true,
      updatedAt
    });
  } catch (error) {
    console.error("Erro ao salvar estado:", error);

    res.status(500).json({
      ok: false,
      error: "Erro ao salvar banco local."
    });
  }
});


app.get("/api/remote-status", (req, res) => {
  res.json({
    ok: true,
    ...remoteStatus
  });
});

app.post("/api/remote-sync-now", async (req, res) => {
  try {
    await syncRemoteOnce();
    res.json({ ok: true, ...remoteStatus });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error?.message || "Erro na sincronização remota."
    });
  }
});


app.get("/api/update-check", async (req, res) => {
  try {
    const result = await fetchUpdateManifest();

    if (!result.configured) {
      return res.json({
        ok: true,
        configured: false,
        currentVersion: CURRENT_APP_VERSION,
        available: false
      });
    }

    const latestVersion = result.manifest.version;

    res.json({
      ok: true,
      configured: true,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion,
      available: isVersionNewer(latestVersion, CURRENT_APP_VERSION),
      notes: result.manifest.notes || ""
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      currentVersion: CURRENT_APP_VERSION,
      error: error?.message || "Erro ao verificar atualização."
    });
  }
});

app.post("/api/update-install", async (req, res) => {
  try {
    const result = await fetchUpdateManifest();
    if (!result.configured) {
      return res.status(400).json({ ok: false, error: "Atualizador não configurado." });
    }

    const manifest = result.manifest;
    const expectedVersion = String(req.body?.expectedVersion || "").trim();

    if (expectedVersion && expectedVersion !== manifest.version) {
      return res.status(409).json({
        ok: false,
        error: `A versão oficial mudou para ${manifest.version}. Verifique novamente antes de instalar.`
      });
    }

    if (!isVersionNewer(manifest.version, CURRENT_APP_VERSION)) {
      return res.json({
        ok: true,
        version: CURRENT_APP_VERSION,
        alreadyCurrent: true
      });
    }

    const backupDir = await installUpdateManifest(manifest);

    res.json({
      ok: true,
      version: manifest.version,
      backupDir,
      restartRequired: true
    });

  } catch (error) {
    console.error("Erro ao instalar atualização:", error);
    res.status(500).json({
      ok: false,
      error: error?.message || "Erro ao instalar atualização."
    });
  }
});

// Arquivos do sistema
app.use(express.static(PUBLIC_DIR));

// Qualquer endereço do sistema volta para o index.html
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("==========================================");
  console.log(" AVENTURA TURISMO - SISTEMA OFFLINE");
  console.log("==========================================");
  console.log("");
  console.log("BANCO: SQLite local");
  console.log(`NUVEM: ${remoteConfig ? "sincronização habilitada" : "não configurada"}`);
  console.log("");
  console.log(`Neste PC: http://localhost:${PORT}`);
  console.log("");
  console.log("Celulares:");
  console.log(`http://IP-DESTE-PC:${PORT}`);
  console.log("");
  console.log("Exemplo:");
  console.log(`http://192.168.1.15:${PORT}`);
  console.log("");
  console.log("NAO FECHE ESTA JANELA DURANTE A OPERACAO.");
  console.log("");
});
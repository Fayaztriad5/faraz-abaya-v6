const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json());

const DEFAULT_ADMIN_PW_HASH = "e39b0fae7b7a0a82e56d01632187796a0553708fb9a2d0ef1af0a8351093d4d6";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const CHALLENGE_TTL_MS = 1000 * 60 * 5;
const SETUP_TTL_MS = 1000 * 60 * 10;
const ALLOW_2FA_SETUP = String(process.env.ADMIN_ALLOW_2FA_SETUP || "").toLowerCase() === "true";
const SECURITY_FILE = path.join(__dirname, "admin-2fa.json");
const loginChallenges = new Map();
const setupChallenges = new Map();

function sha256(text) {
  return crypto.createHash("sha256").update(String(text || "")).digest("hex");
}

function randomToken() {
  return crypto.randomBytes(24).toString("hex");
}

function pruneExpired(store) {
  const now = Date.now();
  for (const [token, value] of store.entries()) {
    if (!value || value.exp <= now) store.delete(token);
  }
}

function getConfiguredPasswordHash() {
  const envHash = (process.env.ADMIN_PW_HASH || process.env.REACT_APP_ADMIN_PW_HASH || "").trim().toLowerCase();
  return envHash || DEFAULT_ADMIN_PW_HASH;
}

function verifyAdminPassword(password) {
  const configuredHash = getConfiguredPasswordHash();
  const inputHash = sha256(password).toLowerCase();
  return configuredHash === inputHash;
}

function readSecurityConfig() {
  try {
    if (!fs.existsSync(SECURITY_FILE)) return { enabled: false, secret: "" };
    const parsed = JSON.parse(fs.readFileSync(SECURITY_FILE, "utf8"));
    return {
      enabled: Boolean(parsed?.enabled && parsed?.secret),
      secret: String(parsed?.secret || ""),
      enabledAt: parsed?.enabledAt || null,
    };
  } catch {
    return { enabled: false, secret: "" };
  }
}

function writeSecurityConfig(next) {
  fs.writeFileSync(SECURITY_FILE, JSON.stringify(next, null, 2));
}

function loadServiceAccount() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
  if (keyFile) {
    const fullPath = path.isAbsolute(keyFile) ? keyFile : path.join(process.cwd(), keyFile);
    const raw = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(raw);
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!email || !privateKey) {
    throw new Error("Google service account credentials are missing.");
  }
  return {
    client_email: email,
    private_key: privateKey,
  };
}

function validatePayload(body) {
  const customer = body?.customer || {};
  const items = Array.isArray(body?.items) ? body.items : [];

  const requiredCustomer = ["name", "phone", "email", "address"];
  for (const key of requiredCustomer) {
    if (!String(customer[key] || "").trim()) {
      return `Missing required customer field: ${key}`;
    }
  }
  if (!items.length) return "At least one product item is required.";

  for (const item of items) {
    if (!String(item.name || "").trim()) return "Each item requires product name.";
    if (item.price === undefined || item.price === null || Number.isNaN(Number(item.price))) return "Each item requires valid price.";
    if (!String(item.id || "").trim()) return "Each item requires product ID.";
    if (!String(item.imageUrl || "").trim()) return "Each item requires image URL.";
  }
  return null;
}

function getSheetConfig() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Orders";
  if (!sheetId) {
    throw new Error("GOOGLE_SHEET_ID is not configured.");
  }
  const escapedSheetName = `'${sheetName.replace(/'/g, "''")}'`;
  return { sheetId, sheetName, escapedSheetName };
}

function createSheetsClient() {
  const serviceAccount = loadServiceAccount();
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

app.get("/api/admin/2fa/status", (_req, res) => {
  const security = readSecurityConfig();
  return res.json({ ok: true, enabled: security.enabled, enabledAt: security.enabledAt || null });
});

app.post("/api/admin/2fa/setup/start", async (req, res) => {
  if (!ALLOW_2FA_SETUP) {
    return res.status(403).json({ ok: false, error: "2FA setup is disabled in this environment." });
  }

  const { password } = req.body || {};
  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ ok: false, error: "Incorrect password." });
  }

  const current = readSecurityConfig();
  if (current.enabled) {
    return res.status(409).json({ ok: false, error: "2FA is already enabled." });
  }

  pruneExpired(setupChallenges);
  const generated = speakeasy.generateSecret({ name: "Faraz Abaya:admin" });
  const secret = generated.base32;
  const otpauthUrl = generated.otpauth_url;
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });
  const setupToken = randomToken();

  setupChallenges.set(setupToken, { secret, exp: Date.now() + SETUP_TTL_MS });
  return res.json({ ok: true, setupToken, qrDataUrl, manualKey: secret });
});

app.post("/api/admin/2fa/setup/confirm", (req, res) => {
  if (!ALLOW_2FA_SETUP) {
    return res.status(403).json({ ok: false, error: "2FA setup is disabled in this environment." });
  }

  const { setupToken, code } = req.body || {};
  pruneExpired(setupChallenges);
  const setup = setupChallenges.get(String(setupToken || ""));
  if (!setup) {
    return res.status(400).json({ ok: false, error: "Setup session expired. Start setup again." });
  }

  const token = String(code || "").replace(/\s+/g, "");
  const valid = speakeasy.totp.verify({
    secret: setup.secret,
    encoding: "base32",
    token,
    window: 1,
    step: 30,
  });
  if (!valid) {
    return res.status(401).json({ ok: false, error: "Invalid authenticator code." });
  }

  writeSecurityConfig({ enabled: true, secret: setup.secret, enabledAt: new Date().toISOString() });
  setupChallenges.delete(String(setupToken));
  return res.json({ ok: true });
});

app.post("/api/admin/login/start", (req, res) => {
  const { password } = req.body || {};
  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ ok: false, error: "Incorrect password." });
  }

  const security = readSecurityConfig();
  if (!security.enabled || !security.secret) {
    return res.status(428).json({ ok: false, needsSetup: true, error: "2FA not configured. Complete authenticator setup." });
  }

  pruneExpired(loginChallenges);
  const challengeToken = randomToken();
  loginChallenges.set(challengeToken, { exp: Date.now() + CHALLENGE_TTL_MS });
  return res.json({ ok: true, requires2fa: true, challengeToken });
});

app.post("/api/admin/login/verify", (req, res) => {
  const { challengeToken, code } = req.body || {};
  pruneExpired(loginChallenges);
  const challenge = loginChallenges.get(String(challengeToken || ""));
  if (!challenge) {
    return res.status(400).json({ ok: false, error: "Login session expired. Enter password again." });
  }

  const security = readSecurityConfig();
  if (!security.enabled || !security.secret) {
    return res.status(428).json({ ok: false, error: "2FA is not configured." });
  }

  const token = String(code || "").replace(/\s+/g, "");
  const valid = speakeasy.totp.verify({
    secret: security.secret,
    encoding: "base32",
    token,
    window: 1,
    step: 30,
  });
  if (!valid) {
    return res.status(401).json({ ok: false, error: "Invalid authenticator code." });
  }

  loginChallenges.delete(String(challengeToken));
  return res.json({ ok: true, sessionTtlMs: ADMIN_SESSION_TTL_MS });
});

app.post("/api/orders", async (req, res) => {
  try {
    const validationError = validatePayload(req.body);
    if (validationError) {
      return res.status(400).json({ ok: false, error: validationError });
    }

    const { sheetId, escapedSheetName } = getSheetConfig();

    const { customer, items } = req.body;
    const now = new Date().toISOString();
    const rows = items.map((item) => [
      now,
      customer.name.trim(),
      customer.phone.trim(),
      customer.email.trim(),
      customer.address.trim(),
      item.name.trim(),
      Number(item.price),
      String(item.id).trim(),
      item.imageUrl.trim(),
    ]);

    const sheets = createSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${escapedSheetName}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Failed to save order to Google Sheets.",
      detail: error?.message || "Unknown error",
    });
  }
});

app.get("/orders", async (_req, res) => {
  try {
    const { sheetId, escapedSheetName } = getSheetConfig();
    const sheets = createSheetsClient();
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${escapedSheetName}!A:I`,
    });
    const values = Array.isArray(resp.data.values) ? resp.data.values : [];
    const rows = values[0] && String(values[0][0] || "").toLowerCase() === "date" ? values.slice(1) : values;
    const orders = rows.map((r, idx) => ({
      rowNo: idx + 1,
      date: r[0] || "",
      name: r[1] || "",
      phone: r[2] || "",
      email: r[3] || "",
      address: r[4] || "",
      product: r[5] || "",
      price: r[6] || "",
      productId: r[7] || "",
      imageUrl: r[8] || "",
    }));
    return res.json({ ok: true, orders });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch orders from Google Sheets.",
      detail: error?.message || "Unknown error",
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "orders-api" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Orders API running on http://localhost:${PORT}`);
});

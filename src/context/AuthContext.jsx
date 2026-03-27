import { createContext, useContext, useMemo, useState } from "react";

const AUTH_STORAGE_KEY = "fa_admin_auth_v1";
const AUTH_TTL_MS = 1000 * 60 * 60 * 8;
const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { authed: false };
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.exp) return { authed: false };
    if (Date.now() > parsed.exp) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return { authed: false };
    }
    return { authed: true };
  } catch {
    return { authed: false };
  }
};

async function requestJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => readStoredAuth().authed);

  const loginStart = async (password) => {
    const { res, data } = await requestJson(`${API_BASE}/api/admin/login/start`, { password });
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        needsSetup: Boolean(data.needsSetup),
        error: data.error || "Login failed.",
      };
    }

    return {
      ok: true,
      requires2fa: Boolean(data.requires2fa),
      challengeToken: data.challengeToken || "",
    };
  };

  const verify2fa = async (challengeToken, code) => {
    const { res, data } = await requestJson(`${API_BASE}/api/admin/login/verify`, { challengeToken, code });
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Invalid verification code." };
    }

    const ttl = Number(data.sessionTtlMs || AUTH_TTL_MS);
    const payload = { exp: Date.now() + ttl };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    setAuthed(true);
    return { ok: true };
  };

  const start2faSetup = async (password) => {
    const { res, data } = await requestJson(`${API_BASE}/api/admin/2fa/setup/start`, { password });
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Unable to start 2FA setup." };
    }
    return {
      ok: true,
      setupToken: data.setupToken,
      qrDataUrl: data.qrDataUrl,
      manualKey: data.manualKey,
    };
  };

  const confirm2faSetup = async (setupToken, code) => {
    const { res, data } = await requestJson(`${API_BASE}/api/admin/2fa/setup/confirm`, { setupToken, code });
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Unable to verify setup code." };
    }
    return { ok: true };
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthed(false);
  };

  const value = useMemo(
    () => ({ authed, loginStart, verify2fa, start2faSetup, confirm2faSetup, logout }),
    [authed],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

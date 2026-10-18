export function readStored(key, fallback, session = false) {
  try {
    const storage = session ? window.sessionStorage : window.localStorage;
    const value = storage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch { return fallback; }
}

export function writeStored(key, value, session = false) {
  try {
    const storage = session ? window.sessionStorage : window.localStorage;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
    return true;
  } catch { return false; }
}

export function getAdminToken() {
  const token = readStored("admin_token", null, true);
  return typeof token === "string" ? token : null;
}

export function clearAdminSession() {
  writeStored("admin_token", null, true);
  writeStored("admin_user", null, true);
  // Remove tokens persisted by older versions as well.
  writeStored("admin_token", null);
  writeStored("admin_user", null);
}

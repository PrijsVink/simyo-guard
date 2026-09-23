const OVERVIEW_URL =
  "https://mijn.simyo.nl/api/get?endpoint=postpaidOverview";
const UPDATE_URL = "https://mijn.simyo.nl/api/put?endpoint=updateNetworkSettings";

function numberAt(obj, path) {
  const value = obj[path];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function normalizeOverview(raw) {
  const result = raw.result;
  if (result === undefined) {
    throw new Error('result is not found');
  }
  if (result.dataBundle === undefined) {
    throw new Error('dataBundle is not found');
  }
  const dataBundle = result.dataBundle;
  const base = 1048576; // 1024*1024
  const used = numberAt(dataBundle, 'used');
  const total = numberAt(dataBundle, 'total');

  if (used == null || total == null) {
    throw new Error("USAGE_FIELDS_UNKNOWN");
  }

  const usedMB = used / base;
  const totalMB = total / base;
  const remainingMB = Math.max(0, totalMB - usedMB);

  return { remainingMB, usedMB, totalMB };
}

export async function getUsage() {
  const response = await fetch(OVERVIEW_URL, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { "Accept": "application/json" }
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("AUTH_REQUIRED");
  }
  if (!response.ok) throw new Error(`OVERVIEW_HTTP_${response.status}`);

  const raw = await response.json();
  return normalizeOverview(raw);
}

export async function setInternet(enabled) {
  const response = await fetch(UPDATE_URL, {
    method: "PUT",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ allowInternet: enabled })
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("AUTH_REQUIRED");
  }
  if (!response.ok) throw new Error(`UPDATE_HTTP_${response.status}`);

  return true;
}

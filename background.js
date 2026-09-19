import { getUsage, setInternet } from "./simyo.js";

const DEFAULTS = {
  enabled: true,
  notifications: true,
  warningRemainingMB: 1000,
  autoStop: false,
  stopRemainingMB: 500,
  checkIntervalMinutes: 15,
  lastWarnedAt: 0,
  autoStopTriggered: false,
  lastCheck: null,
  lastRemainingMB: null,
  lastError: null
};

const WARNING_COOLDOWN = 24 * 60 * 60 * 1000;

async function settings() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
}

async function ensureAlarm() {
  const s = await settings();
  await chrome.alarms.clear("check-simyo");
  if (s.enabled) {
    await chrome.alarms.create("check-simyo", {
      delayInMinutes: 1,
      periodInMinutes: Math.max(1, Number(s.checkIntervalMinutes) || 15)
    });
  }
}

async function notify(id, title, message) {
  await chrome.notifications.create(id, {
    type: "basic",
    iconUrl: "icon128.png",
    title,
    message
  });
}

async function checkUsage() {
  const s = await settings();
  if (!s.enabled) return;

  try {
    const usage = await getUsage();

    if (usage.remainingMB == null) {
      await chrome.storage.local.set({
        lastCheck: new Date().toISOString(),
        lastError: "USAGE_FIELDS_UNKNOWN"
      });
      return;
    }

    const remaining = usage.remainingMB;
    const update = {
      lastCheck: new Date().toISOString(),
      lastRemainingMB: remaining,
      lastError: null
    };
    const now = Date.now();
    const lastWarnedAt = s.lastWarnedAt ?? 0;

    if (remaining > s.warningRemainingMB) update.warned = false;
    if (remaining > s.stopRemainingMB) update.autoStopTriggered = false;

    if (s.notifications && remaining <= s.warningRemainingMB && (now - lastWarnedAt) >= WARNING_COOLDOWN) {
      await notify(
        "simyo-warning",
        "Simyo data warning",
        `${Math.round(remaining)} MB remaining.`
      );
      update.lastWarnedAt = now;
    }

    if (s.autoStop && remaining <= s.stopRemainingMB && !s.autoStopTriggered) {
      await setInternet(false);
      update.autoStopTriggered = true;

      await notify(
        "simyo-stopped",
        "Simyo mobile data disabled",
        `Data was disabled at about ${Math.round(remaining)} MB remaining.`
      );
    }

    await chrome.storage.local.set(update);
  } catch (error) {
    const code = error?.message || String(error);
    await chrome.storage.local.set({
      lastCheck: new Date().toISOString(),
      lastError: code
    });

    if (code === "AUTH_REQUIRED") {
      await notify(
        "simyo-auth",
        "Simyo login required",
        "Log in to Mijn Simyo to resume Data Guard monitoring."
      );
    }
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULTS);
  await chrome.storage.local.set({ ...DEFAULTS, ...current });
  await ensureAlarm();
});

chrome.runtime.onStartup.addListener(ensureAlarm);

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === "check-simyo") await checkUsage();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "CHECK_NOW") {
    checkUsage().then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
  if (message?.type === "REBUILD_ALARM") {
    ensureAlarm().then(() => sendResponse({ ok: true }));
    return true;
  }
});

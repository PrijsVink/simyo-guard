import { getUsage, setInternet } from "./simyo.js";
import { formatData } from "./utils.js";

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

  if (!s.enabled) {
    return { ok: false, error: "DISABLED" };
  }

  try {
    const usage = await getUsage();

    if (usage.remainingMB == null) {
      await chrome.storage.local.set({
        lastError: "USAGE_FIELDS_UNKNOWN"
      });

      return {
        ok: false,
        error: "USAGE_FIELDS_UNKNOWN"
      };
    }

    const remaining = usage.remainingMB;

    const update = {
      lastCheck: new Date().toISOString(),
      lastRemainingMB: remaining,
      lastError: null
    };

    if (remaining > s.warningRemainingMB) {
      update.lastWarnedAt = 0;
    }

    const now = Date.now();
    const lastWarnedAt = s.lastWarnedAt ?? 0;

    if (
      s.notifications &&
      remaining <= s.warningRemainingMB &&
      now - lastWarnedAt >= WARNING_COOLDOWN
    ) {
      await notify(
        "simyo-warning",
        "Simyo data warning",
        `${formatData(remaining)} remaining.`
      );

      update.lastWarnedAt = now;
    }

    if (remaining > s.stopRemainingMB) {
      update.autoStopTriggered = false;
    }

    if (
      s.autoStop &&
      remaining <= s.stopRemainingMB &&
      !s.autoStopTriggered
    ) {
      await setInternet(false);

      update.autoStopTriggered = true;

      await notify(
        "simyo-stopped",
        "Simyo mobile data disabled",
        `Data was disabled at about ${formatData(remaining)} remaining.`
      );
    }

    await chrome.storage.local.set(update);

    return {
      ok: true,
      usage
    };

  } catch (error) {
    const code = error?.message || String(error);

    await chrome.storage.local.set({
      lastError: code
    });

    if (code === "AUTH_REQUIRED") {
      await notify(
        "simyo-auth",
        "Simyo login required",
        "Log in to Mijn Simyo to resume Data Guard monitoring."
      );
    }

    return {
      ok: false,
      error: code
    };
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULTS);
  await chrome.storage.local.set({ ...DEFAULTS, ...current });
  await ensureAlarm();
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureAlarm();
  await checkUsage();
});

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === "check-simyo") await checkUsage();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "CHECK_NOW") {
    checkUsage().then(sendResponse);
    return true;
  }
  if (message?.type === "REBUILD_ALARM") {
    ensureAlarm().then(() => sendResponse({ ok: true }));
    return true;
  }
});

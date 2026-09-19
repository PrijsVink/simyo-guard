const DEFAULTS = {
  enabled: true,
  notifications: true,
  warningRemainingMB: 1000,
  autoStop: false,
  stopRemainingMB: 500,
  checkIntervalMinutes: 15,
  lastCheck: null,
  lastRemainingMB: null,
  lastError: null,
  lastWarnedAt: 0,
  autoStopTriggered: false
};

const $ = id => document.getElementById(id);

function formatData(mb) {
  if (mb >= 1024) {
    const gb = mb / 1024;

    return `${gb.toFixed(gb >= 10 ? 1 : 2)} GB`;
  }

  return `${Math.round(mb)} MB`;
}

async function render() {
  const s = await chrome.storage.local.get(DEFAULTS);

  $("enabled").checked = s.enabled;
  $("notifications").checked = s.notifications;
  $("warning").value = s.warningRemainingMB;

  $("autoStop").checked = s.autoStop;
  
  if ($("stop").value === "") $("stop").value = s.stopRemainingMB;

  $("interval").value = s.checkIntervalMinutes;

  $("remaining").textContent =
    s.lastRemainingMB == null
      ? "—"
      : `${formatData(Math.round(s.lastRemainingMB))}`;

  $("lastCheck").textContent =
    s.lastCheck
      ? `Last checked: ${new Date(s.lastCheck).toLocaleString()}`
      : "Not checked yet";

  const status = $("status");

  console.log(s.lastError)
  if (s.lastError) {
    status.hidden = false;

    if (s.lastError === "AUTH_REQUIRED") {
      status.textContent =
        "Login required. Open Mijn Simyo, authenticate normally, then try again.";
    } else if (s.lastError === "USAGE_FIELDS_UNKNOWN") {
      status.textContent =
        "Connected to Simyo, but couldn't identify the usage fields.";
    } else if (s.lastError === "NOTIFY_REMAINING_EXCEEDS") {
      status.textContent =
        "Notify below should not exceeds the current remaining mb: " + s.lastRemainingMB;
    } else if (s.lastError === "STOP_REMAINING_EXCEEDS") {
      status.textContent =
        "Stop below should not exceeds the current remaining mb: " + s.lastRemainingMB;
    } else {
      status.textContent = `Error: ${s.lastError}`;
    }
  } else {
    status.hidden = true;
  }
}

$("save").addEventListener("click", async () => {

  const autoStop = $("autoStop").checked;

  if (
    autoStop &&
    !confirm(
      "Auto-stop will ask Simyo to disable mobile internet " +
      "when the threshold is reached. Continue?"
    )
  ) {
    $("autoStop").checked = false;
    return;
  }

  const s = await chrome.storage.local.get(DEFAULTS);

  const warningRemainingMB = Number($("warning").value);
  const stopRemainingMB = Number($("stop").value);

  let lastError = null;

  if (s.lastRemainingMB !== null) {
    if (warningRemainingMB > s.lastRemainingMB) {
      lastError = "NOTIFY_REMAINING_EXCEEDS";
    } else if (stopRemainingMB > s.lastRemainingMB) {
      lastError = "STOP_REMAINING_EXCEEDS";
    }
    if (lastError !== null) {
      await chrome.storage.local.set({
        lastError
      });

      await render();
      return;
    }
  }

  await chrome.storage.local.set({
    enabled: $("enabled").checked,

    notifications: $("notifications").checked,

    warningRemainingMB,
    autoStop,
    stopRemainingMB,
    lastError,

    checkIntervalMinutes:
      Math.max(1, Number($("interval").value) || 15)
  });

  await chrome.runtime.sendMessage({
    type: "REBUILD_ALARM"
  });

  await render();
});

$("check").addEventListener("click", async () => {

  $("check").disabled = true;
  $("check").textContent = "Checking…";

  $("remaining").textContent = "…";
  $("lastCheck").textContent = "Checking Simyo now…";

  try {

    const result = await chrome.runtime.sendMessage({
      type: "CHECK_NOW"
    });

    if (!result?.ok) {
      throw new Error(
        result?.error || "Check failed"
      );
    }

  } catch (error) {

    const status = $("status");

    status.hidden = false;

    status.textContent =
      `Check failed: ${error?.message || error}`;

  } finally {

    $("check").disabled = false;
    $("check").textContent = "Check now";

    await render();
  }
});

$("login").addEventListener("click", () => {

  chrome.tabs.create({
    url: "https://mijn.simyo.nl/"
  });

});

chrome.storage.onChanged.addListener(
  (changes, areaName) => {

    if (areaName !== "local") {
      return;
    }

    if (
      changes.lastRemainingMB ||
      changes.lastCheck ||
      changes.lastError
    ) {
      render();
    }

  }
);

render();
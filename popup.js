import { formatData } from "./utils.js";

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

  if (s.lastError) {
    status.hidden = false;

    if (s.lastError === "AUTH_REQUIRED") {
      status.textContent =
        "Login required. Open Mijn Simyo, authenticate normally, then try again.";
    } else if (s.lastError === "USAGE_FIELDS_UNKNOWN") {
      status.textContent =
        "Connected to Simyo, but couldn't identify the usage fields.";
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

  const stopRemainingMB = Number($("stop").value);
  if (
    autoStop &&
    s.lastRemainingMB != null &&
    stopRemainingMB >= s.lastRemainingMB
  ) {
    const confirmed = confirm(
      `You currently have ${formatData(s.lastRemainingMB)} remaining. ` +
      `This setting may disable mobile data on the next check. Continue?`
    );

    if (!confirmed) {
      return;
    }
  }

  await chrome.storage.local.set({
    enabled: $("enabled").checked,

    notifications: $("notifications").checked,
    warningRemainingMB: Number($("warning").value),

    autoStop,
    stopRemainingMB,

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

    await chrome.runtime.sendMessage({
      type: "CHECK_NOW"
    });

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
const POLICY_AUTO = "auto";
const POLICY_ALWAYS_ON = "always_on";
const POLICY_ALWAYS_MUTED = "always_muted";
const AUTO_PAUSE_SUPPORTED_SITES_KEY = "autoPauseSupportedSites";

function normalizeUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

async function getPolicies() {
  const stored = await chrome.storage.local.get("pagePolicies");
  return stored.pagePolicies || {};
}

async function getAutoPauseEnabled() {
  const stored = await chrome.storage.local.get(AUTO_PAUSE_SUPPORTED_SITES_KEY);
  return stored[AUTO_PAUSE_SUPPORTED_SITES_KEY] !== false;
}

async function setAutoPauseEnabled(enabled) {
  await chrome.storage.local.set({
    [AUTO_PAUSE_SUPPORTED_SITES_KEY]: enabled
  });
}

async function setPolicyForUrl(url, policy) {
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) {
    return;
  }

  const policies = await getPolicies();

  if (policy === POLICY_AUTO) {
    delete policies[normalizedUrl];
  } else {
    policies[normalizedUrl] = policy;
  }

  await chrome.storage.local.set({ pagePolicies: policies });
}

async function getPolicyForTab(tab) {
  const normalizedUrl = normalizeUrl(tab && tab.url);
  if (!normalizedUrl) {
    return POLICY_AUTO;
  }

  const policies = await getPolicies();
  return policies[normalizedUrl] || POLICY_AUTO;
}

async function getActiveTabIdByWindow() {
  const windows = await chrome.windows.getAll({ populate: true });
  const activeByWindow = new Map();

  for (const windowInfo of windows) {
    const activeTab = (windowInfo.tabs || []).find((tab) => tab.active);
    if (activeTab && typeof activeTab.id === "number") {
      activeByWindow.set(windowInfo.id, activeTab.id);
    }
  }

  return activeByWindow;
}

function isSupportedAutoPauseUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    return (
      host.endsWith("bilibili.com") ||
      host.endsWith("douyin.com") ||
      host.endsWith("youtube.com") ||
      host === "youtu.be"
    );
  } catch {
    return false;
  }
}

async function maybePauseBackgroundPlayback(tab, isForegroundTab, policy, autoPauseEnabled) {
  if (!autoPauseEnabled) {
    return;
  }

  if (isForegroundTab || policy === POLICY_ALWAYS_ON) {
    return;
  }

  if (!isSupportedAutoPauseUrl(tab.url)) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "pause-media" });
  } catch {
    // Content script may not be ready on this tab yet.
  }
}

async function maybeResumeForegroundPlayback(tab, isForegroundTab, policy, autoPauseEnabled) {
  if (!autoPauseEnabled || !isForegroundTab) {
    return;
  }

  if (policy === POLICY_ALWAYS_MUTED) {
    return;
  }

  if (!isSupportedAutoPauseUrl(tab.url)) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "resume-media" });
  } catch {
    // Content script may not be ready on this tab yet.
  }
}

async function syncTabMuteState() {
  const activeByWindow = await getActiveTabIdByWindow();
  const tabs = await chrome.tabs.query({});
  const autoPauseEnabled = await getAutoPauseEnabled();

  for (const tab of tabs) {
    if (typeof tab.id !== "number" || typeof tab.windowId !== "number") {
      continue;
    }

    const activeTabId = activeByWindow.get(tab.windowId);
    const isForegroundTab = tab.id === activeTabId;
    const policy = await getPolicyForTab(tab);
    let shouldBeMuted = !isForegroundTab;

    if (policy === POLICY_ALWAYS_ON) {
      shouldBeMuted = false;
    } else if (policy === POLICY_ALWAYS_MUTED) {
      shouldBeMuted = true;
    }

    const currentMuted = Boolean(tab.mutedInfo && tab.mutedInfo.muted);

    if (currentMuted !== shouldBeMuted) {
      try {
        await chrome.tabs.update(tab.id, { muted: shouldBeMuted });
      } catch {
        // Ignore tabs that Chrome does not allow us to update.
      }
    }

    await maybePauseBackgroundPlayback(tab, isForegroundTab, policy, autoPauseEnabled);
    await maybeResumeForegroundPlayback(tab, isForegroundTab, policy, autoPauseEnabled);
  }

  await updateActionBadge();
}

async function updateActionBadge() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  const tab = tabs[0];

  if (!tab || typeof tab.id !== "number") {
    await chrome.action.setBadgeText({ text: "" });
    await chrome.action.setTitle({ title: "Only the foreground tab keeps audio" });
    return;
  }

  const policy = await getPolicyForTab(tab);
  let badgeText = "AUTO";
  let badgeColor = "#1565c0";
  let title = "Current tab follows foreground audio mode.";

  if (policy === POLICY_ALWAYS_ON) {
    badgeText = "ON";
    badgeColor = "#2e7d32";
    title = "This page is always allowed to play audio.";
  } else if (policy === POLICY_ALWAYS_MUTED) {
    badgeText = "OFF";
    badgeColor = "#c62828";
    title = "This page is always muted.";
  }

  await chrome.action.setBadgeBackgroundColor({
    color: badgeColor,
    tabId: tab.id
  });
  await chrome.action.setBadgeText({
    text: badgeText,
    tabId: tab.id
  });
  await chrome.action.setTitle({
    title,
    tabId: tab.id
  });
}

chrome.tabs.onActivated.addListener(async () => {
  await syncTabMuteState();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (
    typeof changeInfo.status !== "undefined" ||
    typeof changeInfo.audible !== "undefined" ||
    typeof changeInfo.mutedInfo !== "undefined"
  ) {
    await syncTabMuteState();
  }
});

chrome.tabs.onCreated.addListener(async () => {
  await syncTabMuteState();
});

chrome.tabs.onAttached.addListener(async () => {
  await syncTabMuteState();
});

chrome.tabs.onDetached.addListener(async () => {
  await syncTabMuteState();
});

chrome.tabs.onRemoved.addListener(async () => {
  await syncTabMuteState();
});

chrome.windows.onFocusChanged.addListener(async () => {
  await syncTabMuteState();
});

chrome.runtime.onStartup.addListener(async () => {
  await syncTabMuteState();
});

chrome.runtime.onInstalled.addListener(async () => {
  await syncTabMuteState();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== "string") {
    return false;
  }

  if (message.type === "get-current-tab-policy") {
    (async () => {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });
      const tab = tabs[0];

      if (!tab || typeof tab.id !== "number") {
        sendResponse({ ok: false });
        return;
      }

      const policy = await getPolicyForTab(tab);
      const autoPauseEnabled = await getAutoPauseEnabled();
      sendResponse({
        ok: true,
        policy,
        url: normalizeUrl(tab.url),
        autoPauseEnabled
      });
    })();

    return true;
  }

  if (message.type === "set-current-tab-policy") {
    (async () => {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });
      const tab = tabs[0];

      if (!tab || typeof tab.id !== "number") {
        sendResponse({ ok: false });
        return;
      }

      await setPolicyForUrl(tab.url, message.policy);
      await syncTabMuteState();

      sendResponse({
        ok: true,
        policy: await getPolicyForTab(tab),
        url: normalizeUrl(tab.url),
        autoPauseEnabled: await getAutoPauseEnabled()
      });
    })();

    return true;
  }

  if (message.type === "set-auto-pause-enabled") {
    (async () => {
      await setAutoPauseEnabled(Boolean(message.enabled));
      await syncTabMuteState();
      sendResponse({
        ok: true,
        autoPauseEnabled: await getAutoPauseEnabled()
      });
    })();

    return true;
  }

  return false;
});

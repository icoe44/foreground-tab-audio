let autoPausedByExtension = false;

function pauseKnownMediaElements() {
  let pausedAny = false;

  for (const media of document.querySelectorAll("video, audio")) {
    if (!media.paused) {
      media.pause();
      pausedAny = true;
    }
  }

  return pausedAny;
}

function clickPauseButton(selectors) {
  for (const selector of selectors) {
    const button = document.querySelector(selector);
    if (!button) {
      continue;
    }

    const ariaLabel = (button.getAttribute("aria-label") || "").toLowerCase();
    const title = (button.getAttribute("title") || "").toLowerCase();
    const text = (button.textContent || "").toLowerCase();
    const state = `${ariaLabel} ${title} ${text}`;

    if (
      state.includes("pause") ||
      state.includes("暂停") ||
      button.className.toLowerCase().includes("pause")
    ) {
      button.click();
      return true;
    }
  }

  return false;
}

async function resumeKnownMediaElements() {
  let resumedAny = false;

  for (const media of document.querySelectorAll("video, audio")) {
    if (media.paused) {
      try {
        await media.play();
        resumedAny = true;
      } catch {
        // Ignore autoplay failures and try fallback buttons below.
      }
    }
  }

  return resumedAny;
}

function clickPlayButton(selectors) {
  for (const selector of selectors) {
    const button = document.querySelector(selector);
    if (!button) {
      continue;
    }

    const ariaLabel = (button.getAttribute("aria-label") || "").toLowerCase();
    const title = (button.getAttribute("title") || "").toLowerCase();
    const text = (button.textContent || "").toLowerCase();
    const state = `${ariaLabel} ${title} ${text}`;

    if (
      state.includes("play") ||
      state.includes("播放") ||
      button.className.toLowerCase().includes("play")
    ) {
      button.click();
      return true;
    }
  }

  return false;
}

function pauseSupportedSitePlayback() {
  const host = window.location.hostname;
  let handled = pauseKnownMediaElements();

  if (host.includes("youtube.com") || host === "youtu.be") {
    handled = clickPauseButton([
      ".ytp-play-button",
      "button[title*='Pause']",
      "button[aria-label*='Pause']"
    ]) || handled;
  } else if (host.includes("bilibili.com")) {
    handled = clickPauseButton([
      ".bpx-player-ctrl-play",
      ".bilibili-player-video-btn-start",
      ".bpx-player-state-wrap"
    ]) || handled;
  } else if (host.includes("douyin.com")) {
    handled = clickPauseButton([
      "[data-e2e='video-play-pause']",
      ".xgplayer-play",
      ".xgplayer-playnext"
    ]) || handled;
  }

  if (handled) {
    autoPausedByExtension = true;
  }

  return handled;
}

async function resumeSupportedSitePlayback() {
  if (!autoPausedByExtension) {
    return false;
  }

  const host = window.location.hostname;
  let handled = await resumeKnownMediaElements();

  // Only click the site play button as a fallback when direct media.play() did not work.
  if (!handled) {
    if (host.includes("youtube.com") || host === "youtu.be") {
      handled = clickPlayButton([
        ".ytp-play-button",
        "button[title*='Play']",
        "button[aria-label*='Play']"
      ]);
    } else if (host.includes("bilibili.com")) {
      handled = clickPlayButton([
        ".bpx-player-ctrl-play",
        ".bilibili-player-video-btn-start",
        ".bpx-player-state-wrap"
      ]);
    } else if (host.includes("douyin.com")) {
      handled = clickPlayButton([
        "[data-e2e='video-play-pause']",
        ".xgplayer-play"
      ]);
    }
  }

  if (handled) {
    autoPausedByExtension = false;
  }

  return handled;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== "string") {
    return false;
  }

  if (message.type === "pause-media") {
    const paused = pauseSupportedSitePlayback();
    sendResponse({ ok: true, paused });
    return false;
  }

  if (message.type === "resume-media") {
    (async () => {
      const resumed = await resumeSupportedSitePlayback();
      sendResponse({ ok: true, resumed });
    })();
    return true;
  }

  return false;
});

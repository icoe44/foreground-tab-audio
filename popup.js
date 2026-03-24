const labels = {
  auto: "\u9ed8\u8ba4\u6a21\u5f0f\uff1a\u53ea\u6709\u524d\u53f0\u6807\u7b7e\u9875\u6709\u58f0\u97f3",
  always_on: "\u5df2\u8bbe\u4e3a\uff1a\u6b64\u7f51\u9875\u59cb\u7ec8\u6709\u58f0\u97f3",
  always_muted: "\u5df2\u8bbe\u4e3a\uff1a\u6b64\u7f51\u9875\u59cb\u7ec8\u9759\u97f3"
};

function setStatus(text) {
  document.getElementById("status-text").textContent = text;
}

function setActivePolicy(policy) {
  for (const button of document.querySelectorAll(".policy-button")) {
    button.classList.toggle("is-active", button.dataset.policy === policy);
  }
}

function shortUrl(url) {
  if (!url) {
    return "\u5f53\u524d\u9875\u9762\u65e0\u6cd5\u8bbe\u7f6e";
  }

  return url.length > 80 ? `${url.slice(0, 77)}...` : url;
}

function setAutoPauseEnabled(enabled) {
  document.getElementById("auto-pause-toggle").checked = enabled;
}

async function loadState() {
  const response = await chrome.runtime.sendMessage({
    type: "get-current-tab-policy"
  });

  if (!response || !response.ok) {
    document.getElementById("page-url").textContent = "\u65e0\u6cd5\u8bfb\u53d6\u5f53\u524d\u9875\u9762";
    setStatus("\u8fd9\u4e2a\u9875\u9762\u53ef\u80fd\u4e0d\u652f\u6301");
    return;
  }

  document.getElementById("page-url").textContent = shortUrl(response.url);
  setActivePolicy(response.policy);
  setAutoPauseEnabled(response.autoPauseEnabled);
  setStatus(labels[response.policy] || "");
}

async function choosePolicy(policy) {
  const response = await chrome.runtime.sendMessage({
    type: "set-current-tab-policy",
    policy
  });

  if (!response || !response.ok) {
    setStatus("\u8bbe\u7f6e\u5931\u8d25");
    return;
  }

  setActivePolicy(response.policy);
  setStatus(labels[response.policy] || "");
}

async function chooseAutoPauseEnabled(enabled) {
  const response = await chrome.runtime.sendMessage({
    type: "set-auto-pause-enabled",
    enabled
  });

  if (!response || !response.ok) {
    setStatus("\u8bbe\u7f6e\u5931\u8d25");
    return;
  }

  setAutoPauseEnabled(response.autoPauseEnabled);
}

for (const button of document.querySelectorAll(".policy-button")) {
  button.addEventListener("click", () => {
    void choosePolicy(button.dataset.policy);
  });
}

document.getElementById("auto-pause-toggle").addEventListener("change", (event) => {
  void chooseAutoPauseEnabled(event.target.checked);
});

void loadState();

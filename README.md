# foreground-tab-audio

A Chrome extension that keeps audio on the active tab only, with per-page sound rules and auto pause/resume for supported sites.

## Features

- Keep audio on the active tab by default
- Set the current page to `Default`, `Always on`, or `Always muted`
- Automatically pause supported sites in the background
- Automatically resume playback when you return to a tab paused by the extension
- Supported sites: Bilibili, Douyin, YouTube

## Install

1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select this folder:

```text
F:\定制水下单平台\chrome-tab-mute
```

## How It Works

- The active foreground tab keeps audio
- Background tabs are muted automatically
- Click the extension icon to open the control panel
- For the current page, choose one of these rules:
- `Default`: follow foreground mode
- `Always on`: this page always has audio
- `Always muted`: this page is always muted
- Use the playback toggle to pause background playback and resume on return

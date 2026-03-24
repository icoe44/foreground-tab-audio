# foreground-tab-audio

Foreground Tab Audio is a Chrome extension that keeps audio focused on the tab you are actually watching. It is designed for people who often keep multiple live streams, videos, or media pages open at the same time and want a cleaner, less chaotic listening experience.

By default, only the active tab keeps sound. You can also set page-level rules such as "Always on" or "Always muted" for specific sites or stream pages. On supported platforms like Bilibili, Douyin, and YouTube, the extension can also pause playback when a tab moves to the background and resume it when you return.

## English

### Overview

When multiple media tabs are open, browsers usually keep them all playing unless you mute them one by one. This extension simplifies that workflow by treating the foreground tab as the primary listening target.

It is especially useful for:

- Switching between multiple live streams
- Following several video pages at once
- Keeping background tabs quiet without manually managing mute state
- Applying different sound rules to different pages

### Features

- Keep audio on the active tab by default
- Automatically mute background tabs
- Set the current page to `Default`, `Always on`, or `Always muted`
- Automatically pause supported sites in the background
- Automatically resume playback when you return to a tab paused by the extension
- Supported sites for pause/resume: Bilibili, Douyin, YouTube

### Installation

1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable `Developer mode`
4. Click `Load unpacked`
5. Select the extension folder

### How It Works

- The active foreground tab keeps audio
- Background tabs are muted automatically
- Click the extension icon to open the control panel
- For the current page, choose one of these rules:
- `Default`: follow foreground-tab audio mode
- `Always on`: this page always keeps audio
- `Always muted`: this page is always muted
- Use the playback toggle to enable background pause and foreground resume on supported sites

## 中文

### 简介

`foreground-tab-audio` 是一个 Chrome 浏览器插件，适合同时打开多个直播间、视频页或音频页面的场景。它的目标很简单：把声音控制权交给你当前正在看的那个标签页，减少多个页面同时播放带来的混乱。

默认情况下，只有当前前台标签页保留声音，其他后台标签页会自动静音。你也可以针对单个页面设置更灵活的规则，比如“此网页始终有声音”或“此网页始终静音”。对于 B 站、抖音和 YouTube 等支持站点，插件还可以在页面退到后台时自动暂停，并在你切回该页面时自动恢复播放。

### 功能特点

- 默认只有前台标签页有声音
- 后台标签页自动静音
- 可为当前页面设置 `默认模式`、`始终有声音`、`始终静音`
- 支持站点可在切到后台时自动暂停播放
- 切回标签页时，可自动恢复由插件暂停的播放
- 当前支持自动暂停/恢复的平台：Bilibili、Douyin、YouTube

### 安装方法

1. 下载或克隆本仓库
2. 在 Chrome 中打开 `chrome://extensions/`
3. 打开右上角的 `开发者模式`
4. 点击 `加载已解压的扩展程序`
5. 选择本插件所在的文件夹

### 使用说明

- 同时打开多个直播间或视频标签页
- 当前前台标签页会保留声音
- 其他后台标签页会自动静音
- 点击扩展图标，可以打开控制面板
- 你可以为当前网页设置以下规则：
- `默认模式`：跟随前台标签页有声逻辑
- `始终有声音`：这个网页一直保留声音
- `始终静音`：这个网页一直保持静音
- 打开播放控制开关后，支持站点会在后台自动暂停，回到前台时自动恢复播放

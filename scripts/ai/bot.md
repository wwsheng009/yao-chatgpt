# bot.js 脚本使用说明

`bot.js` 脚本是一个用于与 bot API 进行交互的 JavaScript 脚本。它提供了多种功能，包括调用 API、处理会话、下载会话记录等。以下是详细的使用说明。

## 功能概述

1. **调用 Bot API**: 通过 `Call` 函数可以发送请求到 Bot API，并获取响应。
2. **处理会话**: 脚本支持创建新会话、查找会话、更新会话等操作。
3. **下载会话记录**: 可以将会话记录下载为 Markdown 文件，便于查看和存档。
4. **删除会话**: 支持从服务器删除指定的会话记录。

## 主要函数说明

### `Call(prompt)`
- **功能**: 发送请求到 Bot API。
- **参数**:
  - `prompt`: 字符串或对象，表示要发送的请求内容。
- **返回**: 返回 API 的响应内容。

### `CallGpt(message, setting)`
- **功能**: 处理 POST 请求，并调用 ChatGPT 接口。
- **参数**:
  - `message`: 对象，表示消息内容。
  - `setting`: 对象，表示设置项。
- **返回**: 返回 API 的响应内容。

### `downloadConversation(conversation_id)`
- **功能**: 下载指定会话的记录并保存为 Markdown 文件。
- **参数**:
  - `conversation_id`: 字符串，表示会话 ID。
- **返回**: 无返回值，文件将保存到 `./bot/` 目录下。

### `getHistory()`
- **功能**: 从服务器获取会话历史记录。
- **参数**: 无。
- **返回**: 返回会话历史记录。

### `getConversationById(conversation_id)`
- **功能**: 根据会话 ID 获取会话详细信息。
- **参数**:
  - `conversation_id`: 字符串，表示会话 ID。
- **返回**: 返回会话详细信息。

### `removeConversationById(conversation_id)`
- **功能**: 从服务器删除指定会话。
- **参数**:
  - `conversation_id`: 字符串，表示会话 ID。
- **返回**: 返回删除操作的结果。

### `downloadAllConversation()`
- **功能**: 下载所有会话记录并保存为 Markdown 文件。
- **参数**: 无。
- **返回**: 无返回值，文件将保存到 `./bot/` 目录下。

## 使用示例

### 调用 DeepSeek API
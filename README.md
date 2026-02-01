# 视频文案提取工具

从视频中提取音频，转写为文字，生成结构化文案。

## 功能

- 📤 视频上传
- 🎵 音频提取（FFmpeg）
- 📝 语音转文字（Whisper）
- ✨ 文案生成（Deepseek）

## 本地运行

```bash
npm install
pip3 install faster-whisper
npm run dev
```

访问 http://localhost:3000

## 环境变量

```
DEEPSEEK_API_KEY=你的密钥
```

## 部署到 Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. 连接 GitHub 仓库
2. 设置环境变量 `DEEPSEEK_API_KEY`
3. 部署

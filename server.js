require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractAudio, audiosDir } = require('./audioExtractor');
const { transcribeAudio } = require('./whisperService');
const { generateCopy } = require('./copyService');

const app = express();
const PORT = 3000;

// 解析 JSON 请求
app.use(express.json());

// 确保 uploads 目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置 multer 存储
// 为什么用 diskStorage：可以控制文件名，避免重名覆盖
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 用时间戳 + 原始文件名，确保唯一性
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// 文件过滤器：只接受视频文件
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 mp4, mov, avi, webm 格式的视频文件'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 限制 500MB
  }
});

// 托管静态文件（前端页面）
app.use(express.static(path.join(__dirname, 'public')));

// 视频上传接口
app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有收到文件' });
  }

  console.log('文件上传成功:', req.file.filename);

  res.json({
    success: true,
    message: '上传成功',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    }
  });
});

// 音频提取接口
app.post('/api/extract-audio', async (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ success: false, message: '缺少文件名参数' });
  }

  const videoPath = path.join(uploadsDir, filename);

  // 检查视频文件是否存在
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ success: false, message: '视频文件不存在' });
  }

  try {
    console.log('开始提取音频:', filename);

    const { audioPath, duration } = await extractAudio(videoPath, (percent) => {
      // 进度日志（实际项目可用 SSE 或 WebSocket 推送）
      console.log(`提取进度: ${percent}%`);
    });

    res.json({
      success: true,
      message: '音频提取成功',
      audio: {
        filename: path.basename(audioPath),
        path: audioPath,
        duration: duration
      }
    });
  } catch (error) {
    console.error('音频提取失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 语音转文字接口
app.post('/api/transcribe', async (req, res) => {
  const { audioFilename } = req.body;

  if (!audioFilename) {
    return res.status(400).json({ success: false, message: '缺少音频文件名参数' });
  }

  const audioPath = path.join(audiosDir, audioFilename);

  // 检查音频文件是否存在
  if (!fs.existsSync(audioPath)) {
    return res.status(404).json({ success: false, message: '音频文件不存在' });
  }

  try {
    console.log('开始语音转文字:', audioFilename);

    const { text, duration, segments } = await transcribeAudio(audioPath);

    res.json({
      success: true,
      message: '语音转写成功',
      transcription: {
        text,
        duration,
        segments
      }
    });
  } catch (error) {
    console.error('语音转写失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 文案生成接口
app.post('/api/generate-copy', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: '缺少转写文本' });
  }

  try {
    console.log('开始生成文案');

    const copy = await generateCopy(text);

    res.json({
      success: true,
      message: '文案生成成功',
      copy
    });
  } catch (error) {
    console.error('文案生成失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

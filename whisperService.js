/**
 * Whisper 语音转文字服务（Groq API 版）
 * 使用 Groq 的 Whisper API 进行语音转写，免费且快速
 */

const Groq = require('groq-sdk');
const fs = require('fs');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * 将音频文件转写为文字
 * @param {string} audioPath - 音频文件完整路径
 * @returns {Promise<{text: string, duration: number}>}
 */
async function transcribeAudio(audioPath) {
    console.log('开始语音转文字 (Groq Whisper):', audioPath);

    // 检查文件是否存在
    if (!fs.existsSync(audioPath)) {
        throw new Error('音频文件不存在');
    }

    // 调用 Groq Whisper API
    const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-large-v3',
        language: 'zh',
        response_format: 'verbose_json'
    });

    console.log('转写完成，文字长度:', transcription.text.length);

    return {
        text: transcription.text,
        duration: transcription.duration || 0,
        segments: transcription.segments || []
    };
}

module.exports = { transcribeAudio };

/**
 * 音频提取模块
 * 使用 ffmpeg 将视频转换为 Whisper 需要的音频格式
 * 输出格式：16kHz 单声道 WAV（Whisper 推荐格式）
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// 确保 audios 目录存在
const audiosDir = path.join(__dirname, 'audios');
if (!fs.existsSync(audiosDir)) {
    fs.mkdirSync(audiosDir, { recursive: true });
}

/**
 * 从视频中提取音频
 * @param {string} videoPath - 视频文件完整路径
 * @param {function} onProgress - 进度回调 (percent: number) => void
 * @returns {Promise<{audioPath: string, duration: number}>}
 */
function extractAudio(videoPath, onProgress = () => { }) {
    return new Promise((resolve, reject) => {
        // 生成输出文件名（与视频同名，改为 .wav）
        const videoName = path.basename(videoPath, path.extname(videoPath));
        const audioPath = path.join(audiosDir, `${videoName}.wav`);

        console.log('开始提取音频:', videoPath);
        console.log('输出位置:', audioPath);

        let duration = 0;

        ffmpeg(videoPath)
            // 获取时长用于计算进度
            .on('codecData', (data) => {
                const parts = data.duration.split(':');
                duration = (+parts[0]) * 3600 + (+parts[1]) * 60 + (+parts[2]);
            })
            // 进度回调
            .on('progress', (progress) => {
                if (progress.percent) {
                    onProgress(Math.round(progress.percent));
                }
            })
            // 完成
            .on('end', () => {
                console.log('音频提取完成:', audioPath);
                resolve({ audioPath, duration });
            })
            // 错误
            .on('error', (err) => {
                console.error('音频提取失败:', err.message);
                reject(new Error(`音频提取失败: ${err.message}`));
            })
            // 音频设置：16kHz 采样率，单声道，WAV 格式
            .audioFrequency(16000)
            .audioChannels(1)
            .audioCodec('pcm_s16le')
            .format('wav')
            .output(audioPath)
            .run();
    });
}

module.exports = { extractAudio, audiosDir };

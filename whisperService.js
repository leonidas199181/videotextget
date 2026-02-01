/**
 * Whisper 语音转文字服务（本地版）
 * 使用 Python faster-whisper 进行本地转写，完全免费
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * 将音频文件转写为文字
 * @param {string} audioPath - 音频文件完整路径
 * @returns {Promise<{text: string, duration: number}>}
 */
function transcribeAudio(audioPath) {
    return new Promise((resolve, reject) => {
        console.log('开始本地语音转文字:', audioPath);

        const scriptPath = path.join(__dirname, 'whisper_local.py');
        const python = spawn('python3', [scriptPath, audioPath]);

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
            // 显示进度信息（如模型下载）
            console.log('Whisper:', data.toString().trim());
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('转写失败:', stderr);
                reject(new Error(stderr || '转写失败'));
                return;
            }

            try {
                const result = JSON.parse(stdout);
                if (result.success) {
                    console.log('转写完成，文字长度:', result.text.length);
                    resolve({
                        text: result.text,
                        duration: result.duration || 0,
                        segments: []
                    });
                } else {
                    reject(new Error(result.error || '转写失败'));
                }
            } catch (e) {
                reject(new Error('解析结果失败: ' + stdout));
            }
        });
    });
}

module.exports = { transcribeAudio };

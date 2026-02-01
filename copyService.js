/**
 * 文案生成服务
 * 使用 Deepseek API 将转写文本优化为结构化文案
 */

const OpenAI = require('openai');

// Deepseek API 兼容 OpenAI SDK
const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
});

/**
 * 将转写文本生成结构化文案
 * @param {string} transcriptText - 语音转写的原始文本
 * @returns {Promise<{title: string, summary: string, content: string, tags: string[]}>}
 */
async function generateCopy(transcriptText) {
    console.log('开始生成文案 (Deepseek)，原文长度:', transcriptText.length);

    const prompt = `你是一个专业的短视频文案编辑。请将下面的视频口述内容整理成结构化的文案。

要求：
1. 提取一个吸引人的标题（15字以内）
2. 写一段简短的摘要（50字以内）
3. 将口语化的内容整理成书面化、流畅的正文
4. 提取3-5个相关标签

原始口述内容：
${transcriptText}

请用以下JSON格式返回（不要包含任何其他文字）：
{
  "title": "标题",
  "summary": "摘要",
  "content": "整理后的正文内容",
  "tags": ["标签1", "标签2", "标签3"]
}`;

    const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    console.log('文案生成完成');

    try {
        const result = JSON.parse(responseText);
        return {
            title: result.title || '未命名',
            summary: result.summary || '',
            content: result.content || transcriptText,
            tags: result.tags || []
        };
    } catch (e) {
        console.error('解析文案失败:', e);
        return {
            title: '未命名',
            summary: '',
            content: transcriptText,
            tags: []
        };
    }
}

module.exports = { generateCopy };

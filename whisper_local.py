#!/usr/bin/env python3
"""
本地 Whisper 语音转文字脚本
使用 faster-whisper 进行音频转写（完全免费）
"""

import sys
import json
from faster_whisper import WhisperModel

def transcribe(audio_path):
    """转写音频文件"""
    # 使用 base 模型，平衡速度和质量
    # 可选: tiny, base, small, medium, large-v3
    model = WhisperModel("base", device="cpu", compute_type="int8")
    
    segments, info = model.transcribe(audio_path, language="zh")
    
    # 收集所有文本
    text_parts = []
    for segment in segments:
        text_parts.append(segment.text)
    
    result = {
        "success": True,
        "text": "".join(text_parts),
        "language": info.language,
        "duration": info.duration
    }
    
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "缺少音频文件路径参数"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    
    try:
        result = transcribe(audio_path)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False))
        sys.exit(1)

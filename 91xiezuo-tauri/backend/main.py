from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os

app = FastAPI(title="91写作 API", version="0.7.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API配置
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# 数据模型
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2000
    stream: Optional[bool] = False

class ChatResponse(BaseModel):
    choices: List[dict]
    usage: dict

class ModelsResponse(BaseModel):
    object: str
    data: List[dict]

# API端点
@app.get("/")
async def root():
    return {"message": "91写作 API Server", "version": "0.7.0"}

@app.get("/models", response_model=ModelsResponse)
async def list_models():
    """获取可用模型列表"""
    # 模拟模型列表
    return {
        "object": "list",
        "data": [
            {
                "id": "claude-4-sonnet",
                "object": "model",
                "created": 1234567890,
                "owned_by": "anthropic"
            },
            {
                "id": "claude-opus-4-20250514",
                "object": "model",
                "created": 1234567890,
                "owned_by": "anthropic"
            },
            {
                "id": "claude-3-7-sonnet-thinking",
                "object": "model",
                "created": 1234567890,
                "owned_by": "anthropic"
            },
            {
                "id": "deepseek-reasoner",
                "object": "model",
                "created": 1234567890,
                "owned_by": "deepseek"
            },
            {
                "id": "gpt-4o",
                "object": "model",
                "created": 1234567890,
                "owned_by": "openai"
            },
        ]
    }

@app.post("/chat/completions", response_model=ChatResponse)
async def chat_completions(request: ChatRequest):
    """聊天完成接口"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENAI_API_BASE}/chat/completions",
                json=request.dict(),
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

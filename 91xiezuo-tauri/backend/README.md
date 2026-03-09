# 91写作 FastAPI 后端服务

## 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并配置相关参数：

```bash
cp .env.example .env
```

### 启动服务

开发模式：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

生产模式：

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### API文档

启动后访问：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API端点

### GET /models
获取可用模型列表

### POST /chat/completions
聊天完成接口

### GET /health
健康检查

## 架构说明

- FastAPI 作为 Web 框架
- 支持跨域请求 (CORS)
- 可配置代理到 OpenAI API 或 91写作官方API
- 完整的类型提示和文档生成

#!/bin/bash

echo "========================================"
echo "  91写作 - 开发环境启动"
echo "========================================"
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "[1/3] 安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
fi

# 检查后端依赖
if [ ! -d "backend/venv" ]; then
    echo "[2/3] 创建Python虚拟环境..."
    cd backend
    python3 -m venv venv
    cd ..

    echo "[3/3] 安装后端依赖..."
    cd backend
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

echo ""
echo "启动后端服务..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo "后端服务已启动 (PID: $BACKEND_PID)"
sleep 3

echo "启动前端开发服务器..."
npm run tauri dev

# 清理后台进程
kill $BACKEND_PID 2>/dev/null

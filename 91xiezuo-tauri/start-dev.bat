@echo off
echo ========================================
echo   91写作 - 开发环境启动
echo ========================================
echo.

REM 检查是否安装了依赖
if not exist "node_modules" (
    echo [1/3] 安装前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查后端依赖
if not exist "backend\venv" (
    echo [2/3] 创建Python虚拟环境...
    cd backend
    python -m venv venv
    cd ..

    echo [3/3] 安装后端依赖...
    cd backend
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
)

echo.
echo 启动后端服务...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo 启动前端开发服务器...
npm run tauri dev

pause

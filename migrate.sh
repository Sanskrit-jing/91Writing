#!/bin/bash

# 91写作项目迁移脚本
# 从 Vue 3 + Element Plus 迁移到 React + Radix UI + Tauri 2 + FastAPI

echo "========================================"
echo "  91写作项目迁移工具"
echo "========================================"

PROJECT_ROOT=$(pwd)
VUE_PROJECT="$PROJECT_ROOT/."
TAURI_PROJECT="$PROJECT_ROOT/91xiezuo-tauri"

echo "源项目: $VUE_PROJECT"
echo "目标项目: $TAURI_PROJECT"

# 检查源项目
if [ ! -f "$VUE_PROJECT/package.json" ]; then
    echo "错误: 找不到源项目"
    exit 1
fi

# 检查目标项目
if [ ! -d "$TAURI_PROJECT" ]; then
    echo "错误: 找不到目标项目"
    exit 1
fi

echo ""
echo "开始迁移..."
echo ""

# 1. 复制配置文件
echo "1. 迁移配置文件..."
if [ -f "$VUE_PROJECT/src/config/announcements.js" ]; then
    cp "$VUE_PROJECT/src/config/announcements.js" "$TAURI_PROJECT/src/config/"
    echo "   ✓ 公告配置"
fi

if [ -f "$VUE_PROJECT/src/config/api.json" ]; then
    cp "$VUE_PROJECT/src/config/api.json" "$TAURI_PROJECT/src/config/"
    echo "   ✓ API配置"
fi

# 2. 迁移图片资源
echo "2. 迁移图片资源..."
if [ -d "$VUE_PROJECT/image" ]; then
    cp -r "$VUE_PROJECT/image" "$TAURI_PROJECT/src/assets/"
    echo "   ✓ 图片资源"
fi

# 3. 迁移提示词示例
echo "3. 迁移提示词示例..."
if [ -f "$VUE_PROJECT/prompts-example.json" ]; then
    cp "$VUE_PROJECT/prompts-example.json" "$TAURI_PROJECT/src/data/"
    echo "   ✓ 提示词示例"
fi

echo ""
echo "迁移完成！"
echo ""
echo "下一步："
echo "1. 安装依赖: cd $TAURI_PROJECT && npm install"
echo "2. 启动后端: cd backend && uvicorn main:app --reload"
echo "3. 启动前端: npm run tauri dev"
echo ""

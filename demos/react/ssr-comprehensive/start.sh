#!/bin/bash

# SSR React Demo 启动脚本
echo "🚀 启动 SSR React Demo..."

# 检查 Node.js 版本
NODE_VERSION=$(node --version)
echo "Node.js 版本: $NODE_VERSION"

if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请先安装 Node.js (推荐版本 16+)"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ 依赖已安装"
fi

# 检查端口是否被占用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 $PORT 已被占用"
    echo "请关闭占用端口的进程或修改 server/index.js 中的端口号"
    echo "查看占用进程: lsof -i :$PORT"
    read -p "是否继续启动? (y/N): " continue_start
    if [[ ! $continue_start =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🔧 构建模式: 开发环境"
echo "📍 服务地址: http://localhost:$PORT"
echo "⚡ 热重载: 已启用"
echo ""

# 设置环境变量
export NODE_ENV=development

# 启动开发服务器
echo "🎯 启动开发服务器..."
npm run dev
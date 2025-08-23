#!/bin/bash

# React Router Guard Demo 启动脚本

echo "🚀 启动 React Router Guard Demo..."
echo "=================================="

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node_version=$(node --version)
echo "当前 Node.js 版本: $node_version"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
else
    echo "✅ 依赖已安装"
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "项目将在 http://localhost:3000 启动"
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev

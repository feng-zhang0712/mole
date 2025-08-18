#!/bin/bash

echo "🚀 启动React大文件上传演示项目..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
fi

echo "🔧 启动开发服务器..."
echo "📱 前端地址: http://localhost:3000"
echo "🔌 后端地址: http://localhost:5000"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

# 启动开发服务器
npm run dev

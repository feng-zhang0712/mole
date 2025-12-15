#!/bin/bash

# QR登录系统启动脚本

echo "🚀 启动QR登录系统..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

# 检查MongoDB是否运行
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB未运行，请先启动MongoDB服务"
    echo "   在macOS上可以使用: brew services start mongodb-community"
    echo "   在Ubuntu上可以使用: sudo systemctl start mongod"
fi

# 检查是否存在.env文件
if [ ! -f .env ]; then
    echo "📝 创建环境配置文件..."
    cp env.example .env
    echo "✅ 已创建.env文件，请根据需要修改配置"
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 启动开发服务器
echo "🎯 启动开发服务器..."
npm run dev

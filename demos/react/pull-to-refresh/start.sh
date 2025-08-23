#!/bin/bash

echo "🚀 启动React上拉加载和下拉刷新演示项目"
echo "=========================================="

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

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"
echo ""

# 安装前端依赖
echo "📦 安装前端依赖..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 前端依赖安装失败"
        exit 1
    fi
    echo "✅ 前端依赖安装完成"
else
    echo "✅ 前端依赖已存在"
fi

# 安装服务器依赖
echo "📦 安装服务器依赖..."
if [ ! -d "server/node_modules" ]; then
    cd server
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 服务器依赖安装失败"
        exit 1
    fi
    cd ..
    echo "✅ 服务器依赖安装完成"
else
    echo "✅ 服务器依赖已存在"
fi

echo ""
echo "🌐 启动服务器 (端口3001)..."
echo "📱 启动前端 (端口3000)..."
echo ""

# 启动服务器
cd server
npm start &
SERVER_PID=$!
cd ..

# 等待服务器启动
sleep 3

# 启动前端
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ 项目启动成功!"
echo "📍 前端应用: http://localhost:3000"
echo "🔧 后端API: http://localhost:3001"
echo "📊 健康检查: http://localhost:3001/api/health"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服务已停止'; exit 0" INT

# 等待进程结束
wait

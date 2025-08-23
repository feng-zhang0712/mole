#!/bin/bash

echo "🚀 启动微前端项目..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装根目录依赖..."
    npm install
fi

# 检查根应用依赖
if [ ! -d "root/node_modules" ]; then
    echo "📦 安装根应用依赖..."
    cd root && npm install && cd ..
fi

# 检查应用1依赖
if [ ! -d "apps/app1/node_modules" ]; then
    echo "📦 安装应用1依赖..."
    cd apps/app1 && npm install && cd ../..
fi

# 检查应用2依赖
if [ ! -d "apps/app2/node_modules" ]; then
    echo "📦 安装应用2依赖..."
    cd apps/app2 && npm install && cd ../..
fi

# 检查应用3依赖
if [ ! -d "apps/app3/node_modules" ]; then
    echo "📦 安装应用3依赖..."
    cd apps/app3 && npm install && cd ../..
fi

# 检查共享包依赖
if [ ! -d "packages/shared/node_modules" ]; then
    echo "📦 安装共享包依赖..."
    cd packages/shared && npm install && cd ../..
fi

# 检查工具包依赖
if [ ! -d "packages/utils/node_modules" ]; then
    echo "📦 安装工具包依赖..."
    cd packages/utils && npm install && cd ../..
fi

echo "✅ 所有依赖安装完成！"
echo ""
echo "🌐 启动所有应用..."
echo "根应用将在 http://localhost:9000 启动"
echo "应用1将在 http://localhost:9001 启动"
echo "应用2将在 http://localhost:9002 启动"
echo "应用3将在 http://localhost:9003 启动"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 启动所有应用
npm start

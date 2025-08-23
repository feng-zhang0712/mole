#!/bin/bash

echo "🚀 启动微前端架构演示项目"
echo "================================"

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

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"
echo ""

# 启动开发服务器
echo "🔥 启动开发服务器..."
echo "主应用将在 http://localhost:3000 启动"
echo "子应用1将在 http://localhost:3001 启动"
echo "子应用2将在 http://localhost:3002 启动"
echo "子应用3将在 http://localhost:3003 启动"
echo ""

# 使用concurrently启动所有服务
npm run dev

echo ""
echo "🎉 项目启动完成！"
echo "请在浏览器中访问 http://localhost:3000 查看主应用"
echo ""
echo "按 Ctrl+C 停止所有服务"

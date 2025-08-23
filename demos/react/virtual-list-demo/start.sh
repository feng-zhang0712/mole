#!/bin/bash

echo "启动虚拟列表演示项目..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 启动项目
echo "启动开发服务器..."
npm start

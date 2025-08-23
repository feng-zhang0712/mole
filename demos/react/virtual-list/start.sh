#!/bin/bash

echo "Starting Virtual List Demo..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# 启动后端服务器
echo "Starting backend server on port 3001..."
npm start &

# 等待服务器启动
sleep 3

# 启动前端开发服务器
echo "Starting frontend dev server on port 3000..."
npm run dev &

echo "Virtual List Demo is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

# 等待用户中断
wait

#!/bin/bash

echo "🚀 启动微前端架构演示项目 (性能优化版)"
echo "=================================="

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ 错误: Node.js版本过低，需要16+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 检查端口占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  警告: 端口 $port 已被占用"
        return 1
    fi
    return 0
}

echo "🔍 检查端口占用..."
check_port 3000 || echo "   端口3000 (主应用) 可用"
check_port 3001 || echo "   端口3001 (用户管理) 可用"
check_port 3002 || echo "   端口3002 (产品管理) 可用"
check_port 3003 || echo "   端口3003 (数据分析) 可用"

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf dist/
rm -rf node_modules/.cache/

# 安装依赖
echo "📦 安装依赖..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ 依赖已存在，跳过安装"
fi

# 预构建所有应用
echo "🔨 预构建所有应用..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "🔥 启动开发服务器 (性能优化模式)..."
echo "主应用将在 http://localhost:3000 启动"
echo "子应用1将在 http://localhost:3001 启动"
echo "子应用2将在 http://localhost:3002 启动"
echo "子应用3将在 http://localhost:3003 启动"
echo ""
echo "💡 性能优化提示:"
echo "   - 使用预构建的应用减少启动时间"
echo "   - 启用了gzip压缩"
echo "   - 优化了事件监听器"
echo "   - 减少了不必要的DOM操作"
echo ""

# 启动所有服务
npm run dev

echo ""
echo "🎉 项目启动完成！"
echo "请在浏览器中访问 http://localhost:3000 查看主应用"
echo ""
echo "按 Ctrl+C 停止所有服务"

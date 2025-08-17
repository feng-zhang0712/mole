#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Node.js版本
check_node_version() {
    print_message "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
}

# 检查npm版本
check_npm_version() {
    print_message "Checking npm version..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm version: $(npm -v)"
}

# 安装依赖
install_dependencies() {
    print_message "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_success "Dependencies installed successfully"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    else
        print_warning "Dependencies already installed. Skipping..."
    fi
}

# 构建应用
build_app() {
    print_message "Building application..."
    
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Application built successfully"
    else
        print_error "Failed to build application"
        exit 1
    fi
}

# 启动应用
start_app() {
    print_message "Starting application..."
    
    if [ "$1" = "dev" ]; then
        print_message "Starting in development mode..."
        npm run dev
    elif [ "$1" = "prod" ]; then
        print_message "Starting in production mode..."
        npm start
    else
        print_message "Starting in production mode (default)..."
        npm start
    fi
}

# 主函数
main() {
    echo "🚀 SSR React App Startup Script"
    echo "================================"
    
    # 检查环境
    check_node_version
    check_npm_version
    
    # 安装依赖
    install_dependencies
    
    # 构建应用
    build_app
    
    # 启动应用
    start_app "$1"
}

# 脚本入口
if [ "$1" = "dev" ]; then
    main "dev"
elif [ "$1" = "prod" ]; then
    main "prod"
else
    main "prod"
fi

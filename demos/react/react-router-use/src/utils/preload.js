// 路由预加载工具
class RoutePreloader {
  constructor() {
    this.preloadedRoutes = new Set();
    this.preloadQueue = [];
    this.isProcessing = false;
  }

  // 预加载指定路由
  preloadRoute(routePath) {
    if (this.preloadedRoutes.has(routePath)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.preloadQueue.push({ routePath, resolve });
      this.processQueue();
    });
  }

  // 处理预加载队列
  async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const { routePath, resolve } = this.preloadQueue.shift();
      
      try {
        await this.loadRouteModule(routePath);
        this.preloadedRoutes.add(routePath);
        resolve();
      } catch (error) {
        console.warn(`Failed to preload route: ${routePath}`, error);
        resolve();
      }
    }

    this.isProcessing = false;
  }

  // 加载路由模块
  async loadRouteModule(routePath) {
    // 根据路由路径动态导入对应的模块
    switch (routePath) {
      case '/home':
        await import('../pages/Home');
        break;
      case '/about':
        await import('../pages/About');
        break;
      case '/products':
        await import('../pages/Products');
        break;
      case '/user':
        await import('../pages/UserProfile');
        break;
      case '/user/settings':
        await import('../pages/UserSettings');
        break;
      default:
        // 对于动态路由，预加载基础组件
        if (routePath.startsWith('/products/')) {
          await import('../pages/ProductDetail');
        }
        break;
    }
  }

  // 智能预加载 - 基于用户行为预测
  smartPreload(currentPath) {
    const predictions = this.getRoutePredictions(currentPath);
    
    predictions.forEach(route => {
      // 延迟预加载，避免阻塞当前页面
      setTimeout(() => {
        this.preloadRoute(route);
      }, 100);
    });
  }

  // 获取路由预测
  getRoutePredictions(currentPath) {
    const predictions = [];
    
    // 基于当前路径预测用户可能访问的下一个页面
    switch (currentPath) {
      case '/home':
        predictions.push('/about', '/products', '/user');
        break;
      case '/products':
        predictions.push('/home', '/about', '/user');
        break;
      case '/user':
        predictions.push('/user/settings', '/home', '/products');
        break;
      case '/about':
        predictions.push('/home', '/products', '/user');
        break;
      default:
        predictions.push('/home', '/products', '/user');
    }
    
    return predictions;
  }

  // 预加载所有主要路由
  preloadAllMainRoutes() {
    const mainRoutes = ['/home', '/about', '/products', '/user'];
    mainRoutes.forEach(route => this.preloadRoute(route));
  }

  // 清理预加载缓存
  clearCache() {
    this.preloadedRoutes.clear();
  }
}

// 创建全局预加载器实例
export const routePreloader = new RoutePreloader();

// 预加载钩子 - 用于在组件中触发预加载
export function useRoutePreload() {
  const preloadRoute = (routePath) => {
    routePreloader.preloadRoute(routePath);
  };

  const smartPreload = (currentPath) => {
    routePreloader.smartPreload(currentPath);
  };

  return { preloadRoute, smartPreload };
}

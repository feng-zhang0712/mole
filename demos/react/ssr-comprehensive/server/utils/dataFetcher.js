/**
 * 数据获取工具 - 解决服务端数据预取问题
 * 根据不同路由预取不同数据，避免客户端重复请求
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模拟API调用延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟数据库
const mockData = {
  users: [
    { id: 1, name: '张三', role: 'admin', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', role: 'user', email: 'lisi@example.com' },
    { id: 3, name: '王五', role: 'user', email: 'wangwu@example.com' }
  ],
  posts: [
    { 
      id: 1, 
      title: 'React SSR 完整指南', 
      content: 'React服务端渲染(SSR)是一项重要技术，它可以显著提升应用的首屏加载性能和SEO效果。本文将深入探讨SSR的实现原理和最佳实践。通过SSR，我们可以解决SPA应用的SEO问题，提升首屏渲染速度，改善用户体验。', 
      author: '张三', 
      publishDate: '2024-01-15',
      tags: ['React', 'SSR', '前端工程化']
    },
    { 
      id: 2, 
      title: 'Webpack配置优化', 
      content: 'Webpack是现代前端开发不可或缺的工具。通过合理的配置优化，我们可以显著提升构建速度和产出质量。本文将介绍Webpack的核心概念、最佳实践以及性能优化策略。', 
      author: '李四', 
      publishDate: '2024-01-10',
      tags: ['Webpack', '构建工具', '性能优化']
    },
    { 
      id: 3, 
      title: '状态管理最佳实践', 
      content: '在复杂的React应用中，状态管理是一个关键问题。本文将比较不同状态管理方案的优缺点，包括Redux、Zustand、Jotai等方案的选择和使用场景。', 
      author: '王五', 
      publishDate: '2024-01-05',
      tags: ['状态管理', 'Redux', 'React']
    }
  ]
};

/**
 * 根据URL路径获取对应的初始数据
 * @param {string} url 请求的URL路径
 * @returns {Promise<Object>} 初始数据对象
 */
export async function fetchInitialData(url) {
  console.log(`📡 获取初始数据: ${url}`);
  
  // 解析URL和路由参数
  const urlParts = url.split('/').filter(Boolean);
  const route = urlParts[0] || 'home';
  
  try {
    let data = {
      route,
      timestamp: new Date().toISOString(),
      meta: {
        title: 'SSR React Demo',
        description: 'React服务端渲染演示应用'
      }
    };
    
    // 根据不同路由预取不同数据
    switch (route) {
      case 'home':
      case '':
        // 首页数据
        await delay(50); // 模拟API延迟
        data = {
          ...data,
          featuredPosts: mockData.posts.slice(0, 2),
          totalUsers: mockData.users.length,
          totalPosts: mockData.posts.length,
          meta: {
            title: 'SSR React Demo - 首页',
            description: 'React服务端渲染演示应用首页，展示最新文章和用户统计'
          }
        };
        break;
        
      case 'users':
        // 用户列表页
        await delay(80);
        data = {
          ...data,
          users: mockData.users,
          meta: {
            title: 'SSR React Demo - 用户管理',
            description: '用户管理页面，展示所有注册用户信息'
          }
        };
        break;
        
      case 'posts':
        if (urlParts[1]) {
          // 文章详情页 /posts/:id
          const postId = parseInt(urlParts[1]);
          await delay(100);
          const post = mockData.posts.find(p => p.id === postId);
          
          if (post) {
            data = {
              ...data,
              post,
              relatedPosts: mockData.posts.filter(p => p.id !== postId).slice(0, 2),
              meta: {
                title: `${post.title} - SSR React Demo`,
                description: post.content.substring(0, 150) + '...'
              }
            };
          } else {
            // 文章不存在，返回404数据
            data = {
              ...data,
              error: '文章不存在',
              notFound: true,
              meta: {
                title: '文章不存在 - SSR React Demo',
                description: '抱歉，您访问的文章不存在'
              }
            };
          }
        } else {
          // 文章列表页 /posts
          await delay(120);
          data = {
            ...data,
            posts: mockData.posts,
            meta: {
              title: '文章列表 - SSR React Demo',
              description: '浏览所有技术文章，包括React、Webpack、状态管理等主题'
            }
          };
        }
        break;
        
      case 'about':
        // 关于页面
        await delay(30);
        data = {
          ...data,
          aboutInfo: {
            title: '关于我们',
            content: '这是一个完整的React SSR演示项目，展示了如何解决服务端渲染中的关键问题。',
            features: [
              '服务端路由处理',
              '数据预取和状态同步',
              '客户端激活(Hydration)',
              '环境差异处理',
              '缓存和性能优化'
            ]
          },
          meta: {
            title: '关于我们 - SSR React Demo',
            description: '了解SSR React Demo项目，学习服务端渲染的最佳实践'
          }
        };
        break;
        
      default:
        // 404页面
        data = {
          ...data,
          error: '页面不存在',
          notFound: true,
          meta: {
            title: '页面不存在 - SSR React Demo',
            description: '抱歉，您访问的页面不存在'
          }
        };
        break;
    }
    
    console.log(`✅ 数据获取完成: ${route}`, Object.keys(data));
    return data;
    
  } catch (error) {
    console.error('数据获取失败:', error);
    return {
      route,
      error: error.message,
      timestamp: new Date().toISOString(),
      meta: {
        title: '错误 - SSR React Demo',
        description: '数据加载失败'
      }
    };
  }
}

/**
 * 客户端数据获取函数
 * 用于客户端路由切换时的数据获取
 * @param {string} url 目标URL
 * @returns {Promise<Object>} 数据对象
 */
export async function fetchClientData(url) {
  try {
    // 客户端通过API获取数据
    const response = await fetch(`/api/route-data?path=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('客户端数据获取失败:', error);
    throw error;
  }
}

/**
 * 判断是否需要重新获取数据
 * @param {Object} currentData 当前数据
 * @param {string} newUrl 新的URL
 * @returns {boolean} 是否需要重新获取
 */
export function shouldRefetchData(currentData, newUrl) {
  if (!currentData || !currentData.route) {
    return true;
  }
  
  const currentRoute = currentData.route;
  const newRoute = newUrl.split('/').filter(Boolean)[0] || 'home';
  
  // 路由改变或数据过期时重新获取
  const isStale = currentData.timestamp && 
    (Date.now() - new Date(currentData.timestamp).getTime()) > 5 * 60 * 1000; // 5分钟过期
  
  return currentRoute !== newRoute || isStale;
}
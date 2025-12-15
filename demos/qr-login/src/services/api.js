// API基础配置
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

// 生成nonce和timestamp用于防重放攻击
const generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateTimestamp = () => {
  return Date.now().toString();
};

// 通用请求函数
const request = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Nonce': generateNonce(),
      'X-Timestamp': generateTimestamp(),
      ...options.headers,
    },
    ...options,
  };

  // 添加认证头
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // 处理401错误（token过期）
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Nonce': generateNonce(),
              'X-Timestamp': generateTimestamp(),
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.data.accessToken);
            
            // 重新发送原始请求
            config.headers.Authorization = `Bearer ${refreshData.data.accessToken}`;
            return fetch(`${API_BASE_URL}${url}`, config);
          }
        } catch (refreshError) {
          console.error('Token刷新失败:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
          return response;
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }

    return response;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 用户认证API
export const authAPI = {
  // 获取用户信息
  getProfile: async () => {
    const response = await request('/auth/profile');
    return response.json();
  },

  // 更新用户信息
  updateProfile: async (userData) => {
    const response = await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // 刷新Token
  refreshToken: async (refreshToken) => {
    const response = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return response.json();
  },
};

// 二维码API
export const qrAPI = {
  // 生成二维码
  generate: async () => {
    const response = await request('/qr/generate', {
      method: 'POST',
    });
    return response.json();
  },

  // 查询二维码状态
  getStatus: async (qrId) => {
    const response = await request(`/qr/status/${qrId}`);
    return response.json();
  },

  // 扫描二维码
  scan: async (qrId, mobileToken) => {
    const response = await request('/qr/scan', {
      method: 'POST',
      body: JSON.stringify({ qrId, mobileToken }),
    });
    return response.json();
  },

  // 确认登录
  confirm: async (tempToken) => {
    const response = await request('/qr/confirm', {
      method: 'POST',
      body: JSON.stringify({ tempToken }),
    });
    return response.json();
  },

  // 取消二维码登录
  cancel: async (qrId) => {
    const response = await request(`/qr/cancel/${qrId}`, {
      method: 'POST',
    });
    return response.json();
  },

  // 获取二维码详情
  getDetails: async (qrId) => {
    const response = await request(`/qr/details/${qrId}`);
    return response.json();
  },

  // 清理过期二维码
  cleanup: async () => {
    const response = await request('/qr/cleanup', {
      method: 'POST',
    });
    return response.json();
  },
};

// 健康检查API
export const healthAPI = {
  check: async () => {
    const response = await request('/health');
    return response.json();
  },
};

export default {
  authAPI,
  qrAPI,
  healthAPI,
};

import React, { useState, useEffect, useCallback } from 'react';
import './DataAnalyticsApp.css';

const DataAnalyticsApp = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReports, setSelectedReports] = useState([]);
  const [communicationStatus, setCommunicationStatus] = useState('正在连接主应用...');
  const [globalStateInfo, setGlobalStateInfo] = useState('正在获取全局状态...');
  const [stats, setStats] = useState({
    totalReports: 0,
    activeUsers: 0,
    dataSources: 0,
    avgResponse: 0
  });

  // 模拟报表数据
  const mockReports = [
    {
      id: 1,
      name: '用户增长趋势分析',
      type: '趋势分析',
      generatedAt: '2024-01-01 10:00:00',
      status: 'completed',
      size: '2.5MB',
      trend: 'up'
    },
    {
      id: 2,
      name: '产品销售分布报表',
      type: '分布分析',
      generatedAt: '2024-01-02 14:30:00',
      status: 'completed',
      size: '1.8MB',
      trend: 'stable'
    },
    {
      id: 3,
      name: '用户行为分析',
      type: '行为分析',
      generatedAt: '2024-01-03 09:15:00',
      status: 'processing',
      size: '3.2MB',
      trend: 'up'
    },
    {
      id: 4,
      name: '财务数据汇总',
      type: '财务分析',
      generatedAt: '2024-01-04 16:45:00',
      status: 'completed',
      size: '4.1MB',
      trend: 'down'
    },
    {
      id: 5,
      name: '系统性能监控',
      type: '性能监控',
      generatedAt: '2024-01-05 11:20:00',
      status: 'failed',
      size: '0.8MB',
      trend: 'stable'
    }
  ];

  // 初始化应用
  useEffect(() => {
    initializeApp();
  }, []);

  // 初始化应用
  const initializeApp = useCallback(async () => {
    try {
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 加载报表数据
      setReports(mockReports);
      updateStats(mockReports);
      
      // 设置通信状态
      setupCommunication();
      
      // 获取全局状态
      getGlobalState();
      
      setLoading(false);
      
      console.log('数据分析应用初始化完成');
    } catch (error) {
      console.error('数据分析应用初始化失败:', error);
      setCommunicationStatus('连接失败: ' + error.message);
    }
  }, []);

  // 设置通信
  const setupCommunication = useCallback(() => {
    // 监听来自主应用的消息
    window.addEventListener('message', handleMessage);
    
    // 发送应用就绪消息
    sendMessageToParent('appReady', {
      appId: 'app3',
      timestamp: Date.now(),
      status: 'ready'
    });
    
    setCommunicationStatus('✅ 已连接到主应用');
    
    // 定期发送心跳
    setInterval(() => {
      sendMessageToParent('heartbeat', {
        appId: 'app3',
        timestamp: Date.now()
      });
    }, 30000);
  }, []);

  // 处理来自主应用的消息
  const handleMessage = useCallback((event) => {
    const { data: message } = event;
    
    console.log('收到主应用消息:', message);
    
    switch (message.type) {
      case 'stateChange':
        handleGlobalStateChange(message);
        break;
      case 'themeChange':
        handleThemeChange(message);
        break;
      case 'reportAction':
        handleReportAction(message);
        break;
      default:
        console.log('未知消息类型:', message.type);
    }
  }, []);

  // 发送消息到主应用
  const sendMessageToParent = useCallback((type, data) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type,
          data,
          source: 'app3',
          timestamp: Date.now()
        }, '*');
      }
    } catch (error) {
      console.warn('发送消息到主应用失败:', error);
    }
  }, []);

  // 处理全局状态变化
  const handleGlobalStateChange = useCallback((message) => {
    const { key, value } = message;
    
    if (key === 'userInfo') {
      setGlobalStateInfo(`当前用户: ${value?.name || '未知'} (${value?.role || '未知角色'})`);
    } else if (key === 'theme') {
      setGlobalStateInfo(`当前主题: ${value || '默认'}`);
    }
  }, []);

  // 处理主题变化
  const handleThemeChange = useCallback((message) => {
    const { theme } = message;
    document.body.className = theme || '';
    setGlobalStateInfo(`主题已切换为: ${theme || '默认'}`);
  }, []);

  // 处理报表操作
  const handleReportAction = useCallback((message) => {
    const { action, reportId } = message;
    
    switch (action) {
      case 'refresh':
        refreshReports();
        break;
      case 'selectReport':
        selectReport(reportId);
        break;
      default:
        console.log('未知报表操作:', action);
    }
  }, []);

  // 获取全局状态
  const getGlobalState = useCallback(() => {
    try {
      if (window.parent && window.parent.mainApp) {
        const userInfo = window.parent.mainApp.getGlobalState('userInfo');
        const theme = window.parent.mainApp.getGlobalState('theme');
        
        if (userInfo) {
          setGlobalStateInfo(`当前用户: ${userInfo.name} (${userInfo.role})`);
        }
        
        if (theme) {
          document.body.className = theme;
        }
      }
    } catch (error) {
      console.warn('获取全局状态失败:', error);
      setGlobalStateInfo('无法获取全局状态');
    }
  }, []);

  // 更新统计信息
  const updateStats = useCallback((reportList) => {
    const totalReports = reportList.length;
    const activeUsers = Math.floor(Math.random() * 1000) + 500; // 模拟数据
    const dataSources = Math.floor(Math.random() * 20) + 10; // 模拟数据
    const avgResponse = Math.floor(Math.random() * 200) + 50; // 模拟数据

    setStats({
      totalReports,
      activeUsers,
      dataSources,
      avgResponse
    });
  }, []);

  // 刷新报表数据
  const refreshReports = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setReports([...mockReports]);
      updateStats(mockReports);
      setLoading(false);
      
      // 通知主应用数据已刷新
      sendMessageToParent('dataRefreshed', {
        appId: 'app3',
        timestamp: Date.now(),
        count: mockReports.length
      });
    }, 1000);
  }, []);

  // 选择报表
  const selectReport = useCallback((reportId) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(report => report.id));
    }
  }, [selectedReports.length, reports]);

  // 生成报表
  const generateReport = useCallback(() => {
    const newReport = {
      id: reports.length + 1,
      name: `新报表${reports.length + 1}`,
      type: '自定义分析',
      generatedAt: new Date().toLocaleString(),
      status: 'processing',
      size: '0KB',
      trend: 'stable'
    };
    
    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    updateStats(updatedReports);
    
    // 模拟报表生成过程
    setTimeout(() => {
      const finalReport = { ...newReport, status: 'completed', size: '1.2MB' };
      const finalReports = updatedReports.map(r => r.id === newReport.id ? finalReport : r);
      setReports(finalReports);
    }, 3000);
    
    // 通知主应用报表已生成
    sendMessageToParent('reportGenerated', {
      appId: 'app3',
      timestamp: Date.now(),
      report: newReport
    });
  }, [reports, updateStats]);

  // 导出数据
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(reports, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reports-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    // 通知主应用数据已导出
    sendMessageToParent('dataExported', {
      appId: 'app3',
      timestamp: Date.now(),
      format: 'json'
    });
  }, [reports]);

  // 获取状态样式类
  const getStatusClass = useCallback((status) => {
    switch (status) {
      case 'completed':
        return 'status-active';
      case 'processing':
        return 'status-pending';
      case 'failed':
        return 'status-inactive';
      default:
        return '';
    }
  }, []);

  // 获取状态文本
  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'processing':
        return '处理中';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  }, []);

  // 获取趋势样式类
  const getTrendClass = useCallback((trend) => {
    switch (trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      case 'stable':
        return 'trend-stable';
      default:
        return '';
    }
  }, []);

  // 获取趋势文本
  const getTrendText = useCallback((trend) => {
    switch (trend) {
      case 'up':
        return '↗️ 上升';
      case 'down':
        return '↘️ 下降';
      case 'stable':
        return '→ 稳定';
      default:
        return '未知';
    }
  }, []);

  // 渲染报表行
  const renderReportRow = useCallback((report) => (
    <tr key={report.id}>
      <td>{report.id}</td>
      <td>{report.name}</td>
      <td>{report.type}</td>
      <td>{report.generatedAt}</td>
      <td>
        <span className={`status-badge ${getStatusClass(report.status)}`}>
          {getStatusText(report.status)}
        </span>
      </td>
      <td>{report.size}</td>
      <td className={getTrendClass(report.trend)}>
        {getTrendText(report.trend)}
      </td>
      <td>
        <button className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
          查看
        </button>
        <button className="btn btn-danger">
          删除
        </button>
      </td>
    </tr>
  ), [getStatusClass, getStatusText, getTrendClass, getTrendText]);

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>正在加载数据分析应用...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">📊 数据分析系统</h1>
        <p className="app-description">数据可视化、报表生成、趋势分析</p>
      </div>
      
      <div className="communication-panel">
        <div className="communication-title">🔗 微前端通信状态</div>
        <div className="communication-content">
          {communicationStatus}
        </div>
      </div>
      
      <div className="global-state-panel">
        <div className="global-state-title">🌐 全局状态信息</div>
        <div className="global-state-content">
          {globalStateInfo}
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalReports}</div>
          <div className="stat-label">总报表数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.activeUsers}</div>
          <div className="stat-label">活跃用户</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.dataSources}</div>
          <div className="stat-label">数据源</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgResponse}ms</div>
          <div className="stat-label">平均响应时间</div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">用户增长趋势</h3>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <div className="icon">📈</div>
              <p>用户增长趋势图表</p>
              <p>点击生成按钮查看数据</p>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">产品销售分布</h3>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <div className="icon">🍕</div>
              <p>产品销售分布图表</p>
              <p>点击生成按钮查看数据</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="content-header">
          <h2 className="content-title">数据报表</h2>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={generateReport}>
              生成报表
            </button>
            <button className="btn btn-success" onClick={exportData}>
              导出数据
            </button>
            <button className="btn btn-warning" onClick={refreshReports}>
              刷新
            </button>
            <button className="btn btn-info">
              定时任务
            </button>
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>报表ID</th>
                <th>报表名称</th>
                <th>类型</th>
                <th>生成时间</th>
                <th>状态</th>
                <th>大小</th>
                <th>趋势</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(renderReportRow)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataAnalyticsApp;

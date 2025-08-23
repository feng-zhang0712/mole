import React, { useState, useEffect } from 'react';
import './DataAnalyticsApp.css';

const DataAnalyticsApp = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [chartData, setChartData] = useState({});
  const [summaryData, setSummaryData] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  // 模拟数据
  const mockChartData = {
    sales: {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      datasets: [
        {
          label: '销售额',
          data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        }
      ]
    },
    users: {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      datasets: [
        {
          label: '活跃用户',
          data: [150, 220, 180, 300, 280, 350, 320],
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4
        }
      ]
    },
    orders: {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      datasets: [
        {
          label: '订单数量',
          data: [45, 62, 58, 78, 65, 89, 76],
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          tension: 0.4
        }
      ]
    }
  };

  const mockSummaryData = {
    totalSales: 151000,
    totalUsers: 1800,
    totalOrders: 473,
    growthRate: 12.5,
    avgOrderValue: 319.24,
    conversionRate: 3.2
  };

  const mockRecentActivity = [
    { id: 1, type: 'order', message: '新订单 #12345 已创建', time: '2分钟前', amount: 299 },
    { id: 2, type: 'user', message: '新用户 张三 已注册', time: '5分钟前' },
    { id: 3, type: 'payment', message: '订单 #12344 支付成功', time: '8分钟前', amount: 899 },
    { id: 4, type: 'refund', message: '订单 #12343 申请退款', time: '15分钟前', amount: 199 },
    { id: 5, type: 'review', message: '用户 李四 发表了新评价', time: '20分钟前' }
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setChartData(mockChartData);
      setSummaryData(mockSummaryData);
      setRecentActivity(mockRecentActivity);
      setLoading(false);
    }, 1000);
  }, []);

  const renderChart = () => {
    const data = chartData[selectedMetric];
    if (!data) return null;

    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>📊 {getMetricName(selectedMetric)}趋势</h3>
          <div className="chart-controls">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-select"
            >
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
            </select>
          </div>
        </div>
        <div className="chart-placeholder">
          <div className="chart-bars">
            {data.datasets[0].data.map((value, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${(value / Math.max(...data.datasets[0].data)) * 200}px`,
                    backgroundColor: data.datasets[0].borderColor
                  }}
                ></div>
                <div className="bar-label">{data.labels[index]}</div>
                <div className="bar-value">{formatValue(value, selectedMetric)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getMetricName = (metric) => {
    const names = {
      sales: '销售额',
      users: '活跃用户',
      orders: '订单数量'
    };
    return names[metric] || metric;
  };

  const formatValue = (value, metric) => {
    if (metric === 'sales') return `¥${value.toLocaleString()}`;
    if (metric === 'users') return value.toLocaleString();
    if (metric === 'orders') return value.toLocaleString();
    return value;
  };

  const getActivityIcon = (type) => {
    const icons = {
      order: '📦',
      user: '👤',
      payment: '💳',
      refund: '↩️',
      review: '⭐'
    };
    return icons[type] || '📝';
  };

  if (loading) {
    return (
      <div className="data-analytics-app">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="data-analytics-app">
      <div className="app-header">
        <h2>📊 数据分析系统</h2>
        <p>实时监控业务数据，洞察业务趋势</p>
      </div>

      <div className="controls">
        <div className="metric-selector">
          <button
            onClick={() => setSelectedMetric('sales')}
            className={`metric-btn ${selectedMetric === 'sales' ? 'active' : ''}`}
          >
            💰 销售额
          </button>
          <button
            onClick={() => setSelectedMetric('users')}
            className={`metric-btn ${selectedMetric === 'users' ? 'active' : ''}`}
          >
            👥 用户数
          </button>
          <button
            onClick={() => setSelectedMetric('orders')}
            className={`metric-btn ${selectedMetric === 'orders' ? 'active' : ''}`}
          >
            📦 订单数
          </button>
        </div>
        <div className="date-range">
          <span>时间范围:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="range-select"
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
          </select>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card primary">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>总销售额</h3>
            <p className="card-value">¥{summaryData.totalSales.toLocaleString()}</p>
            <span className="growth-rate positive">+{summaryData.growthRate}%</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>活跃用户</h3>
            <p className="card-value">{summaryData.totalUsers.toLocaleString()}</p>
            <span className="growth-rate positive">+8.2%</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>订单数量</h3>
            <p className="card-value">{summaryData.totalOrders.toLocaleString()}</p>
            <span className="growth-rate positive">+15.3%</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>转化率</h3>
            <p className="card-value">{summaryData.conversionRate}%</p>
            <span className="growth-rate positive">+2.1%</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="chart-section">
          {renderChart()}
        </div>

        <div className="insights-section">
          <h3>💡 数据洞察</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>增长趋势</h4>
                <p>本周销售额较上周增长{summaryData.growthRate}%，主要得益于新产品的推出。</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>用户行为</h4>
                <p>用户平均停留时间增加15%，页面跳出率降低8%。</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">💰</div>
              <div className="insight-content">
                <h4>客单价</h4>
                <p>平均订单价值为¥{summaryData.avgOrderValue}，较上月提升5%。</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🔄</div>
              <div className="insight-content">
                <h4>复购率</h4>
                <p>老客户复购率达到35%，客户忠诚度持续提升。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h3>🕒 最近活动</h3>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{activity.time}</div>
                {activity.amount && (
                  <div className="activity-amount">¥{activity.amount}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="export-section">
        <h3>📤 数据导出</h3>
        <div className="export-options">
          <button className="export-btn">
            📊 导出图表
          </button>
          <button className="export-btn">
            📋 导出报告
          </button>
          <button className="export-btn">
            📈 导出数据
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataAnalyticsApp;

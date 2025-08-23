import React, { useState, useEffect, useCallback } from 'react';
import FileUploader from './components/FileUploader';
import UploadList from './components/UploadList';
import { 
  resumeAllUploads, 
  clearAllUploadProgress, 
  getUploadQueueStatus 
} from './utils/uploadService';

function App() {
  const [uploads, setUploads] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, activeUploads: 0, maxConcurrent: 3 });

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('网络已连接');
      // 网络恢复时尝试恢复所有暂停的上传
      resumeAllUploads(updateUploadProgress, updateUploadStatus);
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('网络已断开');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 页面加载时检查是否有暂停的上传
    resumeAllUploads(updateUploadProgress, updateUploadStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 定期更新队列状态
  useEffect(() => {
    const updateQueueStatus = () => {
      const status = getUploadQueueStatus();
      setQueueStatus(status);
    };

    // 每秒更新一次队列状态
    const interval = setInterval(updateQueueStatus, 1000);
    updateQueueStatus(); // 立即更新一次

    return () => clearInterval(interval);
  }, []);

  // 添加新的上传任务到列表
  const addUpload = useCallback((upload) => {
    setUploads(prev => [...prev, upload]);
  }, []);

  // 更新上传进度
  const updateUploadProgress = useCallback((fileId, progress) => {
    setUploads(prev => prev.map(upload => 
      upload.fileId === fileId 
        ? { ...upload, progress, status: progress === 100 ? 'completed' : 'uploading' }
        : upload
    ));
  }, []);

  // 更新上传状态
  const updateUploadStatus = useCallback((fileId, status, error = null) => {
    setUploads(prev => prev.map(upload => 
      upload.fileId === fileId 
        ? { ...upload, status, error }
        : upload
    ));
  }, []);

  // 清除所有上传记录
  const handleClearAll = useCallback(() => {
    setUploads([]);
    clearAllUploadProgress();
  }, []);

  // 获取性能统计
  const getPerformanceStats = () => {
    const totalFiles = uploads.length;
    const completedFiles = uploads.filter(u => u.status === 'completed').length;
    const failedFiles = uploads.filter(u => u.status === 'error').length;
    const pausedFiles = uploads.filter(u => u.status === 'paused').length;
    const uploadingFiles = uploads.filter(u => u.status === 'uploading').length;

    return {
      totalFiles,
      completedFiles,
      failedFiles,
      pausedFiles,
      uploadingFiles,
      successRate: totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0
    };
  };

  const performanceStats = getPerformanceStats();

  return (
    <div>
      <h1>React大文件上传演示</h1>
      
      {/* 网络状态指示器 */}
      <div style={{
        padding: '8px 16px',
        marginBottom: '16px',
        backgroundColor: isOnline ? '#f6ffed' : '#fff2f0',
        border: `1px solid ${isOnline ? '#b7eb8f' : '#ffccc7'}`,
        borderRadius: '4px',
        color: isOnline ? '#52c41a' : '#ff4d4f',
        fontSize: '14px'
      }}>
        {isOnline ? '🟢 网络连接正常' : '🔴 网络连接断开'}
      </div>

      {/* 性能统计面板 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f8ff',
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
            {performanceStats.totalFiles}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>总文件数</div>
        </div>
        
        <div style={{
          padding: '12px',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
            {performanceStats.completedFiles}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>已完成</div>
        </div>
        
        <div style={{
          padding: '12px',
          backgroundColor: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
            {performanceStats.pausedFiles}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>已暂停</div>
        </div>
        
        <div style={{
          padding: '12px',
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
            {performanceStats.failedFiles}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>失败</div>
        </div>
        
        <div style={{
          padding: '12px',
          backgroundColor: '#f9f0ff',
          border: '1px solid #d3adf7',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
            {performanceStats.successRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>成功率</div>
        </div>
      </div>

      {/* 上传队列状态 */}
      <div style={{
        padding: '8px 16px',
        marginBottom: '16px',
        backgroundColor: '#f0f8ff',
        border: '1px solid #91d5ff',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📊 上传队列状态</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            队列: {queueStatus.queueLength} | 活跃: {queueStatus.activeUploads}/{queueStatus.maxConcurrent}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          💡 优化说明: 限制并发文件数({queueStatus.maxConcurrent})，避免内存占用过高和网络请求堆积
        </div>
      </div>

      <FileUploader 
        onAddUpload={addUpload}
        onUpdateProgress={updateUploadProgress}
        onUpdateStatus={updateUploadStatus}
        isOnline={isOnline}
      />
      
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button
          onClick={handleClearAll}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          清除所有记录
        </button>
      </div>

      <UploadList 
        uploads={uploads}
        onUpdateProgress={updateUploadProgress}
        onUpdateStatus={updateUploadStatus}
      />
    </div>
  );
}

export default App;

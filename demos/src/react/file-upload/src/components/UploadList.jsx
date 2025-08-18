import React from 'react';

const UploadList = ({ uploads, onUpdateProgress, onUpdateStatus }) => {
  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取状态显示文本和样式
  const getStatusInfo = (status, error) => {
    switch (status) {
      case 'pending':
        return { text: '等待中', color: '#666' };
      case 'uploading':
        return { text: '上传中', color: '#1890ff' };
      case 'paused':
        return { text: '已暂停', color: '#faad14' };
      case 'completed':
        return { text: '已完成', color: '#52c41a' };
      case 'error':
        return { text: `失败: ${error}`, color: '#ff4d4f' };
      default:
        return { text: '未知', color: '#666' };
    }
  };

  // 处理恢复上传
  const handleResume = (upload) => {
    if (upload.status === 'paused') {
      onUpdateStatus(upload.fileId, 'pending');
      // 这里应该重新调用上传函数，但需要重新获取File对象
      console.log('需要重新选择文件以恢复上传');
    }
  };

  if (uploads.length === 0) {
    return (
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        暂无上传任务
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>上传列表</h3>
      {uploads.map((upload) => {
        const statusInfo = getStatusInfo(upload.status, upload.error);
        
        return (
          <div
            key={upload.fileId}
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '12px',
              backgroundColor: '#fafafa'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold' }}>{upload.fileName}</div>
              <div style={{ color: statusInfo.color, fontSize: '14px' }}>
                {statusInfo.text}
              </div>
            </div>
            
            <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
              文件大小: {formatFileSize(upload.fileSize)}
            </div>
            
            {/* 进度条 */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${upload.progress}%`,
                  height: '100%',
                  backgroundColor: upload.status === 'error' ? '#ff4d4f' : 
                                 upload.status === 'paused' ? '#faad14' : '#1890ff',
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
            
            <div style={{ fontSize: '14px', color: '#666' }}>
              进度: {upload.progress}%
            </div>
            
            {/* 操作按钮 */}
            {upload.status === 'paused' && (
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => handleResume(upload)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  恢复上传
                </button>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                  需要重新选择文件
                </span>
              </div>
            )}
            
            {/* 错误信息显示 */}
            {upload.status === 'error' && upload.error && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                backgroundColor: '#fff2f0', 
                border: '1px solid #ffccc7',
                borderRadius: '4px',
                color: '#ff4d4f',
                fontSize: '12px'
              }}>
                错误详情: {upload.error}
              </div>
            )}

            {/* 暂停状态信息 */}
            {upload.status === 'paused' && upload.error && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                backgroundColor: '#fffbe6', 
                border: '1px solid #ffe58f',
                borderRadius: '4px',
                color: '#faad14',
                fontSize: '12px'
              }}>
                暂停原因: {upload.error}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UploadList;

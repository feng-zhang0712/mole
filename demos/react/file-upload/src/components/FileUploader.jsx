import React, { useRef, useState, useCallback } from 'react';
import { uploadFile } from '../utils/uploadService';

const FileUploader = ({ onAddUpload, onUpdateProgress, onUpdateStatus, isOnline }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 处理文件选择
  const handleFileSelect = useCallback(async (files) => {
    if (uploading) return;
    
    // 检查网络状态
    if (!isOnline) {
      alert('网络连接断开，无法上传文件');
      return;
    }
    
    setUploading(true);
    
    try {
      for (const file of files) {
        // 创建上传任务
        const upload = {
          fileId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
          status: 'pending',
          file: file
        };

        // 添加到上传列表
        onAddUpload(upload);

        // 开始上传文件
        await uploadFile(file, upload.fileId, onUpdateProgress, onUpdateStatus);
      }
    } catch (error) {
      console.error('文件上传失败:', error);
    } finally {
      setUploading(false);
    }
  }, [uploading, onAddUpload, onUpdateProgress, onUpdateStatus, isOnline]);

  // 拖拽事件处理
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!isOnline) {
      alert('网络连接断开，无法上传文件');
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect, isOnline]);

  // 点击选择文件
  const handleClick = useCallback(() => {
    if (!isOnline) {
      alert('网络连接断开，无法上传文件');
      return;
    }
    fileInputRef.current?.click();
  }, [isOnline]);

  // 文件输入变化
  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  }, [handleFileSelect]);

  return (
    <div>
      <div
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',
          cursor: isOnline ? 'pointer' : 'not-allowed',
          userSelect: 'none',
          opacity: isOnline ? 1 : 0.6
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {uploading ? (
          <div>上传中...</div>
        ) : !isOnline ? (
          <div>
            <div style={{ color: '#ff4d4f', marginBottom: '10px' }}>🔴 网络连接断开</div>
            <div>请检查网络连接后重试</div>
          </div>
        ) : (
          <div>
            <div>拖拽文件到此处或点击选择文件</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              支持大文件上传，自动分片处理
            </div>
            <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '8px' }}>
              ✨ 支持断点续传，网络中断后自动暂停
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={!isOnline}
      />
    </div>
  );
};

export default FileUploader;

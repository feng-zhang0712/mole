// 分片大小：2MB
const CHUNK_SIZE = 2 * 1024 * 1024;

// 最大重试次数
const MAX_RETRIES = 3;

// 重试延迟（毫秒）
const RETRY_DELAY = 1000;

// 存储键名
const STORAGE_KEY = 'file_upload_progress';

// 简化的并发控制配置
const MAX_CONCURRENT_FILES = 5;        // 最大同时上传文件数（放宽限制）
const CHUNK_UPLOAD_DELAY = 50;        // 块上传间隔（减少延迟）

/**
 * 检测网络状态
 */
const isOnline = () => navigator.onLine;

/**
 * 保存上传进度到localStorage
 */
const saveUploadProgress = (fileId, progressData) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    existing[fileId] = { ...progressData, lastUpdate: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('保存上传进度失败:', error);
  }
};

/**
 * 获取上传进度从localStorage
 */
const getUploadProgress = (fileId) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return existing[fileId] || null;
  } catch (error) {
    console.error('获取上传进度失败:', error);
    return null;
  }
};

/**
 * 清除上传进度
 */
const clearUploadProgress = (fileId) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete existing[fileId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('清除上传进度失败:', error);
  }
};

/**
 * 计算文件哈希值（简化版本）
 */
const calculateFileHash = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      let hash = 0;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 简化哈希计算，提高性能
      for (let i = 0; i < uint8Array.length; i += 100) { // 采样计算
        hash = ((hash << 5) - hash + uint8Array[i]) & 0xffffffff;
      }
      
      // 添加文件大小和修改时间到哈希中
      hash = ((hash << 5) - hash + file.size) & 0xffffffff;
      hash = ((hash << 5) - hash + file.lastModified) & 0xffffffff;
      
      resolve(hash.toString(16));
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 将文件分割成块
 */
const splitFileIntoChunks = (file) => {
  const chunks = [];
  let start = 0;
  
  while (start < file.size) {
    const end = Math.min(start + CHUNK_SIZE, file.size);
    chunks.push({
      blob: file.slice(start, end),
      index: chunks.length,
      start,
      end
    });
    start = end;
  }
  
  return chunks;
};

/**
 * 上传单个文件块
 */
const uploadChunk = async (chunk, fileId, chunkIndex, totalChunks, fileHash, retryCount = 0) => {
  try {
    const formData = new FormData();
    formData.append('chunk', chunk.blob);
    formData.append('fileId', fileId);
    formData.append('chunkIndex', chunkIndex);
    formData.append('totalChunks', totalChunks);
    formData.append('fileHash', fileHash);

    const response = await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return uploadChunk(chunk, fileId, chunkIndex, totalChunks, fileHash, retryCount + 1);
    }
    throw error;
  }
};

/**
 * 检查文件是否已存在
 */
const checkFileExists = async (fileHash, fileName, fileSize) => {
  try {
    const response = await fetch('/api/upload/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileHash, fileName, fileSize })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('检查文件存在性失败:', error);
    return { exists: false, uploadedChunks: [] };
  }
};

/**
 * 合并文件块
 */
const mergeChunks = async (fileId, fileHash) => {
  try {
    const response = await fetch('/api/upload/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, fileHash })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`合并文件块失败: ${error.message}`);
  }
};

/**
 * 恢复上传进度
 */
const resumeUploadProgress = (file, fileId) => {
  const savedProgress = getUploadProgress(fileId);
  
  if (!savedProgress) return null;

  // 检查文件是否匹配
  if (savedProgress.fileSize !== file.size || 
      savedProgress.lastModified !== file.lastModified) {
    clearUploadProgress(fileId);
    return null;
  }

  // 检查进度是否过期（24小时）
  const now = Date.now();
  const expired = now - savedProgress.lastUpdate > 24 * 60 * 60 * 1000;
  
  if (expired) {
    clearUploadProgress(fileId);
    return null;
  }

  return savedProgress;
};

/**
 * 简化的文件上传函数
 */
const uploadFileSimple = async (file, fileId, onProgress, onStatus) => {
  try {
    onStatus(fileId, 'uploading');

    const fileHash = await calculateFileHash(file);
    
    // 尝试恢复上传进度
    const savedProgress = resumeUploadProgress(file, fileId);
    let uploadedChunks = [];
    
    if (savedProgress) {
      console.log('发现断点续传进度:', savedProgress);
      uploadedChunks = savedProgress.uploadedChunks || [];
      onProgress(fileId, Math.round((uploadedChunks.length / savedProgress.totalChunks) * 100));
    }
    
    // 检查文件是否已存在
    const fileCheck = await checkFileExists(fileHash, file.name, file.size);
    
    if (fileCheck.exists) {
      onProgress(fileId, 100);
      onStatus(fileId, 'completed');
      clearUploadProgress(fileId);
      return;
    }

    // 获取服务器端已上传的块
    const serverChunks = fileCheck.uploadedChunks || [];
    const allUploadedChunks = [...new Set([...uploadedChunks, ...serverChunks])].sort((a, b) => a - b);
    
    // 分割文件
    const chunks = splitFileIntoChunks(file);
    const totalChunks = chunks.length;
    
    // 保存初始进度
    saveUploadProgress(fileId, {
      fileHash,
      fileName: file.name,
      fileSize: file.size,
      lastModified: file.lastModified,
      totalChunks,
      uploadedChunks: allUploadedChunks,
      startTime: Date.now()
    });
    
    let uploadedCount = allUploadedChunks.length;
    
    // 上传文件块
    for (let i = 0; i < totalChunks; i++) {
      if (allUploadedChunks.includes(i)) continue;

      // 检查网络状态
      if (!isOnline()) {
        console.log('网络离线，暂停上传');
        onStatus(fileId, 'paused', '网络离线，已暂停上传');
        
        saveUploadProgress(fileId, {
          fileHash,
          fileName: file.name,
          fileSize: file.size,
          lastModified: file.lastModified,
          totalChunks,
          uploadedChunks: allUploadedChunks,
          startTime: Date.now()
        });
        
        throw new Error('网络离线，上传已暂停');
      }

      try {
        // 上传块
        await uploadChunk(chunks[i], fileId, i, totalChunks, fileHash);
        allUploadedChunks.push(i);
        uploadedCount++;
        
        // 更新进度
        const progress = Math.round((uploadedCount / totalChunks) * 100);
        onProgress(fileId, progress);
        
        // 保存进度
        saveUploadProgress(fileId, {
          fileHash,
          fileName: file.name,
          fileSize: file.size,
          lastModified: file.lastModified,
          totalChunks,
          uploadedChunks: allUploadedChunks,
          startTime: Date.now()
        });
        
        // 添加小延迟，避免请求过于频繁
        if (i < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, CHUNK_UPLOAD_DELAY));
        }
        
      } catch (error) {
        console.error(`上传块 ${i} 失败:`, error);
        
        saveUploadProgress(fileId, {
          fileHash,
          fileName: file.name,
          fileSize: file.size,
          lastModified: file.lastModified,
          totalChunks,
          uploadedChunks: allUploadedChunks,
          startTime: Date.now(),
          lastError: error.message
        });
        
        throw new Error(`块 ${i} 上传失败: ${error.message}`);
      }
    }

    // 合并文件块
    await mergeChunks(fileId, fileHash);
    
    onStatus(fileId, 'completed');
    clearUploadProgress(fileId);
    
  } catch (error) {
    console.error('文件上传失败:', error);
    
    if (error.message.includes('网络离线')) {
      onStatus(fileId, 'paused', error.message);
    } else {
      onStatus(fileId, 'error', error.message);
    }
    
    throw error;
  }
};

// 简单的并发控制
let activeUploads = 0;
const uploadQueue = [];

/**
 * 主上传函数（简化版本）
 */
export const uploadFile = async (file, fileId, onProgress, onStatus) => {
  // 如果当前活跃上传数超过限制，加入队列
  if (activeUploads >= MAX_CONCURRENT_FILES) {
    return new Promise((resolve, reject) => {
      uploadQueue.push({ file, fileId, onProgress, onStatus, resolve, reject });
    });
  }

  activeUploads++;
  
  try {
    await uploadFileSimple(file, fileId, onProgress, onStatus);
  } finally {
    activeUploads--;
    
    // 处理队列中的下一个上传
    if (uploadQueue.length > 0) {
      const nextUpload = uploadQueue.shift();
      uploadFile(nextUpload.file, nextUpload.fileId, nextUpload.onProgress, nextUpload.onStatus)
        .then(nextUpload.resolve)
        .catch(nextUpload.reject);
    }
  }
};

/**
 * 恢复所有暂停的上传
 */
export const resumeAllUploads = async (onProgress, onStatus) => {
  try {
    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    for (const [fileId, progress] of Object.entries(allProgress)) {
      if (progress.lastError || progress.status === 'paused') {
        console.log(`尝试恢复上传: ${progress.fileName}`);
        onStatus(fileId, 'pending', '需要重新选择文件以恢复上传');
      }
    }
  } catch (error) {
    console.error('恢复上传失败:', error);
  }
};

/**
 * 清除所有上传进度
 */
export const clearAllUploadProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('已清除所有上传进度');
  } catch (error) {
    console.error('清除上传进度失败:', error);
  }
};

/**
 * 获取上传队列状态
 */
export const getUploadQueueStatus = () => {
  return {
    queueLength: uploadQueue.length,
    activeUploads,
    maxConcurrent: MAX_CONCURRENT_FILES
  };
};

/**
 * 暂停所有上传
 */
export const pauseAllUploads = () => {
  // 这里可以实现暂停逻辑
  console.log('暂停所有上传功能待实现');
};

/**
 * 恢复所有上传
 */
export const resumeAllUploadsFromPause = () => {
  // 这里可以实现恢复逻辑
  console.log('恢复所有上传功能待实现');
};

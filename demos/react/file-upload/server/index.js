const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 创建上传目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const CHUNKS_DIR = path.join(__dirname, 'chunks');
const TEMP_DIR = path.join(__dirname, 'temp');
const PROGRESS_FILE = path.join(__dirname, 'upload-progress.json');

// 确保目录存在
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(CHUNKS_DIR);
fs.ensureDirSync(TEMP_DIR);

// 存储文件信息的Map（实际项目中应使用数据库）
const fileInfoMap = new Map();

// 加载持久化的上传进度
const loadUploadProgress = () => {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
      const progress = JSON.parse(data);
      console.log('已加载上传进度:', Object.keys(progress).length, '个文件');
      return progress;
    }
  } catch (error) {
    console.error('加载上传进度失败:', error);
  }
  return {};
};

// 保存上传进度到文件
const saveUploadProgress = () => {
  try {
    const progress = {};
    for (const [fileHash, info] of fileInfoMap.entries()) {
      progress[fileHash] = {
        fileId: info.fileId,
        totalChunks: info.totalChunks,
        uploadedChunks: Array.from(info.uploadedChunks),
        fileName: info.fileName,
        lastUpdate: Date.now()
      };
    }
    
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error('保存上传进度失败:', error);
  }
};

// 初始化时加载进度
const savedProgress = loadUploadProgress();
for (const [fileHash, info] of Object.entries(savedProgress)) {
  fileInfoMap.set(fileHash, {
    fileId: info.fileId,
    totalChunks: info.totalChunks,
    uploadedChunks: new Set(info.uploadedChunks),
    fileName: info.fileName,
    lastUpdate: info.lastUpdate || Date.now()
  });
}

// 配置multer用于处理文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CHUNKS_DIR);
  },
  filename: (req, file, cb) => {
    const { fileId, chunkIndex } = req.body;
    cb(null, `${fileId}-${chunkIndex}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
    files: 1
  }
});

// 检查文件是否已存在（用于断点续传）
app.post('/api/upload/check', async (req, res) => {
  try {
    const { fileHash, fileName, fileSize } = req.body;
    
    if (!fileHash || !fileName || !fileSize) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 检查文件是否已完全上传
    const filePath = path.join(UPLOAD_DIR, fileHash);
    if (await fs.pathExists(filePath)) {
      const stats = await fs.stat(filePath);
      if (stats.size === parseInt(fileSize)) {
        return res.json({ 
          exists: true, 
          uploadedChunks: [],
          message: '文件已存在'
        });
      }
    }

    // 检查已上传的块
    const chunksDir = path.join(CHUNKS_DIR, fileHash);
    let uploadedChunks = [];
    
    if (await fs.pathExists(chunksDir)) {
      const files = await fs.readdir(chunksDir);
      uploadedChunks = files
        .filter(file => file.endsWith('.chunk'))
        .map(file => parseInt(file.split('-')[1]))
        .sort((a, b) => a - b);
    }

    // 检查内存中的进度
    const memoryProgress = fileInfoMap.get(fileHash);
    if (memoryProgress) {
      const memoryChunks = Array.from(memoryProgress.uploadedChunks).sort((a, b) => a - b);
      // 合并文件系统和内存中的进度
      uploadedChunks = [...new Set([...uploadedChunks, ...memoryChunks])].sort((a, b) => a - b);
    }

    res.json({ 
      exists: false, 
      uploadedChunks,
      message: '文件不存在，可以继续上传'
    });

  } catch (error) {
    console.error('检查文件失败:', error);
    res.status(500).json({ error: '检查文件失败' });
  }
});

// 上传文件块
app.post('/api/upload/chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { fileId, chunkIndex, totalChunks, fileHash } = req.body;
    
    if (!fileId || chunkIndex === undefined || !totalChunks || !fileHash) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '没有接收到文件块' });
    }

    // 创建文件哈希对应的目录
    const chunksDir = path.join(CHUNKS_DIR, fileHash);
    await fs.ensureDir(chunksDir);

    // 移动文件块到正确位置
    const chunkFileName = `${fileId}-${chunkIndex}.chunk`;
    const chunkPath = path.join(chunksDir, chunkFileName);
    
    await fs.move(req.file.path, chunkPath, { overwrite: true });

    // 记录文件信息
    if (!fileInfoMap.has(fileHash)) {
      fileInfoMap.set(fileHash, {
        fileId,
        totalChunks: parseInt(totalChunks),
        uploadedChunks: new Set(),
        fileName: req.body.fileName || 'unknown',
        lastUpdate: Date.now()
      });
    }

    const fileInfo = fileInfoMap.get(fileHash);
    fileInfo.uploadedChunks.add(parseInt(chunkIndex));
    fileInfo.lastUpdate = Date.now();

    // 保存进度
    saveUploadProgress();

    res.json({ 
      success: true, 
      message: `块 ${chunkIndex} 上传成功`,
      uploadedChunks: Array.from(fileInfo.uploadedChunks).sort((a, b) => a - b)
    });

  } catch (error) {
    console.error('上传文件块失败:', error);
    res.status(500).json({ error: '上传文件块失败' });
  }
});

// 合并文件块
app.post('/api/upload/merge', async (req, res) => {
  try {
    const { fileId, fileHash } = req.body;
    
    if (!fileId || !fileHash) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const fileInfo = fileInfoMap.get(fileHash);
    if (!fileInfo) {
      return res.status(400).json({ error: '文件信息不存在' });
    }

    // 检查是否所有块都已上传
    const chunksDir = path.join(CHUNKS_DIR, fileHash);
    const uploadedChunks = Array.from(fileInfo.uploadedChunks).sort((a, b) => a - b);
    
    if (uploadedChunks.length !== fileInfo.totalChunks) {
      return res.status(400).json({ 
        error: `文件块不完整，已上传 ${uploadedChunks.length}/${fileInfo.totalChunks}` 
      });
    }

    // 合并文件块
    const outputPath = path.join(UPLOAD_DIR, fileHash);
    const writeStream = fs.createWriteStream(outputPath);

    for (let i = 0; i < fileInfo.totalChunks; i++) {
      const chunkPath = path.join(chunksDir, `${fileId}-${i}.chunk`);
      
      if (!await fs.pathExists(chunkPath)) {
        throw new Error(`块文件 ${i} 不存在`);
      }

      const chunkBuffer = await fs.readFile(chunkPath);
      writeStream.write(chunkBuffer);
    }

    writeStream.end();

    // 等待写入完成
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // 清理临时块文件
    await fs.remove(chunksDir);

    // 清理文件信息
    fileInfoMap.delete(fileHash);

    // 保存进度
    saveUploadProgress();

    res.json({ 
      success: true, 
      message: '文件合并成功',
      filePath: outputPath,
      fileSize: (await fs.stat(outputPath)).size
    });

  } catch (error) {
    console.error('合并文件块失败:', error);
    res.status(500).json({ error: `合并文件块失败: ${error.message}` });
  }
});

// 获取上传的文件列表
app.get('/api/upload/files', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const fileList = [];

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      fileList.push({
        name: file,
        size: stats.size,
        uploadTime: stats.mtime
      });
    }

    res.json({ files: fileList });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ error: '获取文件列表失败' });
  }
});

// 获取当前上传进度
app.get('/api/upload/progress', (req, res) => {
  try {
    const progress = {};
    for (const [fileHash, info] of fileInfoMap.entries()) {
      progress[fileHash] = {
        fileId: info.fileId,
        fileName: info.fileName,
        totalChunks: info.totalChunks,
        uploadedChunks: Array.from(info.uploadedChunks).sort((a, b) => a - b),
        progress: Math.round((info.uploadedChunks.size / info.totalChunks) * 100)
      };
    }
    res.json({ progress });
  } catch (error) {
    console.error('获取上传进度失败:', error);
    res.status(500).json({ error: '获取上传进度失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeUploads: fileInfoMap.size,
    uploadDir: UPLOAD_DIR,
    chunksDir: CHUNKS_DIR
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📁 上传目录: ${UPLOAD_DIR}`);
  console.log(`🧩 块文件目录: ${CHUNKS_DIR}`);
  console.log(`🗂️ 临时目录: ${TEMP_DIR}`);
  console.log(`💾 进度文件: ${PROGRESS_FILE}`);
  console.log(`📊 已加载 ${Object.keys(savedProgress).length} 个文件的上传进度`);
  console.log(`✅ 服务器已优化，移除了可能导致超时的限制`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🔄 正在关闭服务器...');
  
  // 保存当前进度
  saveUploadProgress();
  
  // 清理临时文件
  try {
    await fs.remove(TEMP_DIR);
    console.log('✅ 临时文件清理完成');
  } catch (error) {
    console.error('❌ 清理临时文件失败:', error);
  }
  
  console.log('👋 服务器已关闭');
  process.exit(0);
});

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket必须在SocketProvider内部使用');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 创建Socket连接
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    // 连接事件监听
    newSocket.on('connect', () => {
      console.log('Socket连接成功:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket连接断开');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket连接错误:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // 清理函数
    return () => {
      newSocket.close();
    };
  }, []);

  const joinQRRoom = (qrId) => {
    if (socket && isConnected) {
      socket.emit('join-qr-room', qrId);
    }
  };

  const leaveQRRoom = (qrId) => {
    if (socket && isConnected) {
      socket.emit('leave-qr-room', qrId);
    }
  };

  const onQRStatusUpdate = (callback) => {
    if (socket) {
      socket.on('qr-status-update', callback);
    }
  };

  const offQRStatusUpdate = (callback) => {
    if (socket) {
      socket.off('qr-status-update', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    joinQRRoom,
    leaveQRRoom,
    onQRStatusUpdate,
    offQRStatusUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

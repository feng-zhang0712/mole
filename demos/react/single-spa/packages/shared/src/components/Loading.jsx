import React from 'react';
import './Loading.css';

const Loading = ({ 
  size = 'medium', 
  variant = 'spinner', 
  text = '加载中...', 
  className = '' 
}) => {
  const loadingClasses = [
    'shared-loading',
    `shared-loading--${size}`,
    `shared-loading--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={loadingClasses}>
      <div className="shared-loading__spinner"></div>
      {text && <div className="shared-loading__text">{text}</div>}
    </div>
  );
};

export default Loading;

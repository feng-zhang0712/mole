import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = '加载中...' }) => {
  const sizeClass = `loading-spinner--${size}`;
  
  return (
    <div className="loading-spinner">
      <div className={`loading-spinner__spinner ${sizeClass}`}>
        <div className="loading-spinner__ring"></div>
        <div className="loading-spinner__ring"></div>
        <div className="loading-spinner__ring"></div>
      </div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

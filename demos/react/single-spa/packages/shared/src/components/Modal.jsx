import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = [
    'shared-modal',
    `shared-modal--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="shared-modal__overlay" onClick={handleOverlayClick}>
      <div className={modalClasses}>
        <div className="shared-modal__header">
          {title && <h3 className="shared-modal__title">{title}</h3>}
          {showCloseButton && (
            <button 
              className="shared-modal__close" 
              onClick={onClose}
              aria-label="关闭"
            >
              ×
            </button>
          )}
        </div>
        <div className="shared-modal__body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

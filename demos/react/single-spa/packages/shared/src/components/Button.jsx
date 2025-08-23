import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  className = '', 
  type = 'button',
  ...props 
}) => {
  const buttonClasses = [
    'shared-button',
    `shared-button--${variant}`,
    `shared-button--${size}`,
    disabled ? 'shared-button--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

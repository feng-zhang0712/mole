# CSS 模块化

## 介绍

CSS 模块化是将 CSS 样式按照功能、组件或模块进行组织和管理的一种开发方式。它的核心目标是避免样式命名冲突，并实现样式的作用域隔离。

## 实现方案

### CSS Modules

CSS Modules 通过构建工具（如 webpack）在编译时将 CSS 类名转换为唯一的标识符，实现作用域隔离。

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              }
            }
          }
        ]
      }
    ]
  }
}
```

```jsx
import styles from './button.module.css';

function Button({ type, children }) {
  return (
    <button className={`${styles.button} ${styles[type]}`}>
      {children}
    </button>
  );
}
```

优点

- 完全避免样式命名冲突
- 类名自动生成，无需手动维护
- 支持组合和继承
- 与现有 CSS 语法完全兼容

缺点

- 需要构建工具支持
- 调试时类名不够直观
- 动态类名处理相对复杂

### CSS-in-JS

将 CSS 样式直接写在 JavaScript 中，通过 JavaScript 的作用域机制实现样式隔离。

```jsx
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  
  &:hover {
    opacity: 0.8;
  }
`;

function Button({ primary, children }) {
  return <StyledButton primary={primary}>{children}</StyledButton>;
}
```

```jsx
import { css } from '@emotion/react';

const buttonStyles = css`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const primaryStyles = css`
  background-color: #007bff;
  color: white;
`;

function Button({ primary, children }) {
  return (
    <button css={[buttonStyles, primary && primaryStyles]}>
      {children}
    </button>
  );
}
```

优点

- 完全的作用域隔离
- 支持动态样式和主题
- 良好的 TypeScript 支持
- 可以利用 JavaScript 的全部能力

缺点

- 运行时开销
- 学习成本较高
- 可能影响性能（部分解决方案）
- 调试相对困难

### CSS 预处理器 + BEM

使用 Sass/Less 等预处理器，结合 BEM（Block Element Modifier）命名规范来避免命名冲突。

```jsx
function Button({ type, icon, children }) {
  return (
    <button className={`button button--${type}`}>
      {icon && <span className="button__icon">{icon}</span>}
      {children}
    </button>
  );
}
```

优点

- 语法熟悉，学习成本低
- 良好的可读性和可维护性
- 强大的预处理功能
- 调试方便

缺点

- 依赖开发者遵循命名规范
- 无法完全避免命名冲突
- 类名可能很长

### Tailwind CSS

提供大量原子级的实用类，通过组合这些类来构建样式，避免写自定义 CSS。

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d'
      }
    }
  },
  plugins: []
}
```

```jsx
function Button({ type, children }) {
  const baseClasses = 'px-5 py-2 border-0 rounded cursor-pointer';
  const typeClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white'
  };
  
  return (
    <button className={`${baseClasses} ${typeClasses[type]} hover:opacity-80`}>
      {children}
    </button>
  );
}
```

优点

- 快速开发
- 一致的设计系统
- 自动优化（PurgeCSS）
- 良好的响应式支持

缺点

- HTML 中类名较多
- 需要学习大量实用类
- 自定义样式相对困难

### Shadow DOM

利用浏览器原生的 Shadow DOM 特性实现样式隔离。

```jsx
import { useEffect, useRef } from 'react';

function ShadowButton({ children }) {
  const ref = useRef();
  
  useEffect(() => {
    const shadowRoot = ref.current.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <style>
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background-color: #007bff;
          color: white;
        }
      </style>
      <button><slot></slot></button>
    `;
  }, []);
  
  return <div ref={ref}>{children}</div>;
}
```

优点

- 浏览器原生支持
- 完全的样式隔离
- 无需额外工具

缺点

- 浏览器兼容性限制
- 使用复杂
- React 支持不够完善


**原型模式**：组件克隆、元素复制

### 1.4 原型模式（Prototype Pattern）

**定义**：用原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象。

**React中的应用**：

#### 1.4.1 组件克隆

```jsx
import React, { cloneElement } from 'react';

const PrototypeComponent = ({ children, ...props }) => {
  // 克隆子组件并添加新的props
  const clonedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return cloneElement(child, { ...props, ...child.props });
    }
    return child;
  });

  return <div>{clonedChildren}</div>;
};
```

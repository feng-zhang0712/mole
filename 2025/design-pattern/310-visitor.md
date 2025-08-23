**访问者模式**：组件访问、样式应用、验证处理

### 3.6 访问者模式（Visitor Pattern）

**定义**：表示一个作用于某对象结构中的各元素的操作，它可以在不改变各元素的类的前提下定义作用于这些元素的新操作。

**React中的应用**：

#### 3.6.1 组件访问者

```jsx
import React from 'react';

// 访问者接口
class ComponentVisitor {
  visitButton(button) {}
  visitInput(input) {}
  visitSelect(select) {}
}

// 具体访问者 - 样式访问者
class StyleVisitor extends ComponentVisitor {
  visitButton(button) {
    return { ...button.props, className: 'styled-button' };
  }

  visitInput(input) {
    return { ...input.props, className: 'styled-input' };
  }

  visitSelect(select) {
    return { ...select.props, className: 'styled-select' };
  }
}

// 具体访问者 - 验证访问者
class ValidationVisitor extends ComponentVisitor {
  visitButton(button) {
    return button;
  }

  visitInput(input) {
    return { ...input.props, required: true };
  }

  visitSelect(select) {
    return { ...select.props, required: true };
  }
}

// 可访问组件
const VisitableButton = ({ visitor, ...props }) => {
  const enhancedProps = visitor.visitButton({ props });
  return <button {...enhancedProps} />;
};

const VisitableInput = ({ visitor, ...props }) => {
  const enhancedProps = visitor.visitInput({ props });
  return <input {...enhancedProps} />;
};

// 使用访问者模式
const FormWithVisitor = () => {
  const styleVisitor = new StyleVisitor();
  const validationVisitor = new ValidationVisitor();

  return (
    <form>
      <VisitableButton visitor={styleVisitor}>Submit</VisitableButton>
      <VisitableInput visitor={validationVisitor} placeholder="Name" />
    </form>
  );
};
```

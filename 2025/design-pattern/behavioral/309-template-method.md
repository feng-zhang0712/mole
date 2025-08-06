**模板方法模式**：组件基类、生命周期模板

### 3.5 模板方法模式（Template Method Pattern）

**定义**：定义一个操作中的算法骨架，将某些步骤延迟到子类中实现。

**React中的应用**：

#### 3.5.1 组件生命周期模板

```jsx
import React, { Component } from 'react';

// 抽象基类
class BaseComponent extends Component {
  // 模板方法
  componentDidMount() {
    this.initialize();
    this.setupEventListeners();
    this.loadData();
  }

  componentWillUnmount() {
    this.cleanup();
    this.removeEventListeners();
  }

  // 具体方法
  initialize() {
    // 默认实现
  }

  setupEventListeners() {
    // 默认实现
  }

  loadData() {
    // 默认实现
  }

  cleanup() {
    // 默认实现
  }

  removeEventListeners() {
    // 默认实现
  }

  render() {
    return this.renderContent();
  }

  // 抽象方法
  renderContent() {
    throw new Error('renderContent must be implemented');
  }
}

// 具体实现
class UserProfile extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  loadData() {
    fetch(`/api/users/${this.props.userId}`)
      .then(res => res.json())
      .then(user => this.setState({ user }));
  }

  renderContent() {
    const { user } = this.state;
    if (!user) return <div>Loading...</div>;
    
    return (
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  }
}
```




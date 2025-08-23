**适配器模式**：API数据适配、第三方库适配

### 2.2 适配器模式（Adapter Pattern）

**定义**：将一个类的接口转换成客户期望的另一个接口。

**React中的应用**：

#### 2.2.1 API数据适配器

```jsx
import React from 'react';

// 旧API数据格式
const legacyUserData = {
  user_id: 1,
  user_name: 'John Doe',
  user_email: 'john@example.com'
};

// 新组件期望的数据格式
interface User {
  id: number;
  name: string;
  email: string;
}

// 适配器组件
const UserDataAdapter = ({ legacyData, children }) => {
  const adaptedData = {
    id: legacyData.user_id,
    name: legacyData.user_name,
    email: legacyData.user_email
  };

  return children(adaptedData);
};

// 使用适配器
const UserProfile = ({ user }) => (
  <div>
    <h2>{user.name}</h2>
    <p>Email: {user.email}</p>
  </div>
);

const App = () => (
  <UserDataAdapter legacyData={legacyUserData}>
    {(adaptedUser) => <UserProfile user={adaptedUser} />}
  </UserDataAdapter>
);
```

#### 2.2.2 第三方库适配器

```jsx
// 适配第三方图表库
class ChartAdapter {
  constructor(chartLibrary) {
    this.chartLibrary = chartLibrary;
  }

  createChart(container, data, options) {
    // 将React组件的数据格式转换为第三方库期望的格式
    const adaptedData = this.adaptData(data);
    const adaptedOptions = this.adaptOptions(options);
    
    return this.chartLibrary.create(container, adaptedData, adaptedOptions);
  }

  adaptData(data) {
    // 数据格式转换逻辑
    return data.map(item => ({
      label: item.name,
      value: item.count
    }));
  }

  adaptOptions(options) {
    // 选项格式转换逻辑
    return {
      ...options,
      responsive: true
    };
  }
}
```

# 单例模式

## 一、介绍

单例模式（Singleton Pattern）是一种**创建型**设计模式，它确保一个类只有一个实例，并提供一个全局访问点来访问该实例。

单例模式的核心思想是，通过限制类的实例化次数，确保在整个应用程序中只有一个实例存在。这样可以控制对某些资源的访问，同时避免创建多个实例造成的资源浪费。

通过单例模式，可以实现全局状态管理、资源共享和访问控制等功能。不过，使用单例模式，会增加代码的耦合性，造成测试困难，以及违反单一职责原则等。

单例模式中只有一个参与者。

- **单例**（Singleton）：定义一个实例操作，让客户端访问它的唯一实例。单例类负责创建自己的唯一实例，并提供一个全局访问点。

## 二、伪代码实现

```typescript
class Singleton {
  private static instance: Singleton;
  private constructor() {}

  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  public someBusinessLogic(): string {
    return "Singleton: Executing business logic...";
  }
}
```

下面是一个示例代码。

```typescript
const ins1 = Singleton.getInstance();
const ins2 = Singleton.getInstance();

ins1 === ins2; // true
```

## 三、React 中的单例模式应用

### 3.1 React Context - 全局状态单例

React Context 可以作为全局状态的单例，确保整个应用中只有一个状态实例。

```jsx
class GlobalState {
  private static instance: GlobalState;
  private state: any = {};

  private constructor() {}

  public static getInstance(): GlobalState {
    if (!GlobalState.instance) {
      GlobalState.instance = new GlobalState();
    }
    return GlobalState.instance;
  }

  public getState(): any {
    return this.state;
  }

  public setState(newState: any): void {
    this.state = { ...this.state, ...newState };
  }
}

// 使用 Context 包装单例
const GlobalContext = React.createContext<GlobalState | null>(null);

const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const globalState = GlobalState.getInstance();

  return (
    <GlobalContext.Provider value={globalState}>
      {children}
    </GlobalContext.Provider>
  );
};
```

下面是示例代码。

```jsx
const App: React.FC = () => {
  return (
    <GlobalProvider>
      <ComponentA />
      <ComponentB />
    </GlobalProvider>
  );
};

const ComponentA: React.FC = () => {
  const globalState = useContext(GlobalContext)!;
  
  const updateState = () => globalState.setState({ user: 'John' });

  return <button onClick={updateState}>Update State</button>;
};

const ComponentB: React.FC = () => {
  const globalState = useContext(GlobalContext)!;
  
  return <div>Current state: {JSON.stringify(globalState.getState())}</div>;
};
```

### 3.2 服务类单例 - API 服务

API 服务类可以作为单例，确保整个应用中只有一个服务实例。

```jsx
class ApiService {
  private static instance: ApiService;
  private baseURL: string;

  private constructor() {
    this.baseURL = 'https://api.example.com';
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return response.json();
  }

  public async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

下面是示例代码。

```jsx
const UserComponent: React.FC = () => {
  const [users, setUsers] = useState([]);
  const apiService = ApiService.getInstance();

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await apiService.get('/users');
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return <div>{JSON.stringify(users)}</div>;
};
```

### 3.3 配置管理单例 - 应用配置

应用配置可以作为单例，确保整个应用中只有一个配置实例。

```jsx
class AppConfig {
  private static instance: AppConfig;
  private config: any = {};

  private constructor() {
    this.config = {
      apiUrl: process.env.REACT_APP_API_URL || 'https://api.example.com',
      theme: process.env.REACT_APP_THEME || 'light',
      language: process.env.REACT_APP_LANGUAGE || 'en',
    };
  }

  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  public get(key: string): any {
    return this.config[key];
  }

  public set(key: string, value: any): void {
    this.config[key] = value;
  }

  public getAll(): any {
    return { ...this.config };
  }
}
```

下面是示例代码。

```jsx
const ConfigComponent: React.FC = () => {
  const config = AppConfig.getInstance();
  
  return (
    <div>
      <p>API URL: {config.get('apiUrl')}</p>
      <p>Theme: {config.get('theme')}</p>
      <p>Language: {config.get('language')}</p>
    </div>
  );
};
```

### 3.4 事件总线单例 - 全局事件管理

事件总线可以作为单例，提供全局的事件管理功能。

```jsx
class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  public emit(event: string, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }
}
```

下面是示例代码。

```jsx
const EventComponent: React.FC = () => {
  const eventBus = EventBus.getInstance();

  useEffect(() => {
    const handleUserUpdate = (data: any) => {
      console.log('User updated:', data);
    };

    eventBus.on('user:update', handleUserUpdate);

    return () => eventBus.off('user:update', handleUserUpdate);
  }, []);

  const handleClick = () => {
    eventBus.emit('user:update', { id: 1, name: 'John' });
  };

  return <button onClick={handleClick}>Update User</button>;
};
```

### 3.5 Redux Store - 状态管理单例

```jsx
import { createStore } from 'redux';

// Redux Store 是典型的单例模式
const store = createStore(reducer);

// 在整个应用中只有一个 store 实例
export default store;
```

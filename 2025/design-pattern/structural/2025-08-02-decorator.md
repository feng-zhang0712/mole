# 装饰者模式

## 一、概念

装饰者模式（Decorator Pattern）是一种**结构型**设计模式，它允许在不改变原对象结构的情况下，动态地给对象添加新的功能。装饰者模式通过**组合**的方式，将对象包装在装饰者对象中，从而实现对原对象功能的扩展。

装饰者模式的核心思想是，**用组合替代继承，实现功能的动态扩展**。

装饰者模式的优点是它比继承更灵活，可以动态地组合功能。并且符合单一职责和开闭原则。另外，装饰者可以任意组合。它的缺点是复杂、调试困难以及可能导致可能导致过度使用或者设计。

装饰者模式一般包含四个角色。

- **组件**（Component）：为装饰者和被装饰提供统一的接口，并声明所有具体组件和装饰者都要实现的方法。
- **具体组件**（ConcreteComponent）：实现组件接口，定义可以被装饰的基础对象。提供核心功能，是被装饰的原始对象。
- **装饰者**（Decorator）：维护一个指向组件对象的引用，实现组件接口。作为所有具体装饰者的基类，提供装饰功能的基础结构。
- **具体装饰者**（ConcreteDecorator）：实现具体的装饰逻辑，可以添加新的方法和属性，扩展被装饰对象的功能。

## 二、TypeScript实现

```typescript
interface Component {
  operation(): string;
}

class ConcreteComponent implements Component {
  public operation(): string {
    return "ConcreteComponent";
  }
}

class Decorator implements Component {
  protected component: Component;

  constructor(component: Component) {
    this.component = component;
  }

  public operation(): string {
    return this.component.operation();
  }
}

class ConcreteDecoratorA extends Decorator {
  public operation(): string {
    return `ConcreteDecoratorA(${super.operation()})`;
  }
}

class ConcreteDecoratorB extends Decorator {
  public operation(): string {
    return `ConcreteDecoratorB(${super.operation()})`;
  }
}

function clientCode(component: Component) {
  console.log(`RESULT: ${component.operation()}`);
}
```

下面是一个示例。

```typescript
const component = new ConcreteComponent();
clientCode(component);

const decorator1 = new ConcreteDecoratorA(component);
const decorator2 = new ConcreteDecoratorB(decorator1);
clientCode(decorator2); 
```

## 三、React 中的装饰者模式应用

### 3.1 Higher-Order Components (HOC)

HOC 是 React 中装饰者模式的典型应用。

```jsx
interface ComponentProps {
  [key: string]: any;
}

const UserProfile: React.FC<ComponentProps> = (props) => {
  return <div>User Profile: {props.name}</div>;
};

function withUserData<P extends ComponentProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithUserDataComponent(props: P) {
    const [userData, setUserData] = useState(null);
    
    useEffect(() => fetchUserData().then(setUserData), []);

    return <WrappedComponent {...props} userData={userData} />;
  };
}

function withAuth<P extends ComponentProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => checkAuthStatus().then(setIsAuthenticated), []);

    if (!isAuthenticated) {
      return <div>Please login first</div>;
    }

    return <WrappedComponent {...props} />;
  };
}

function withLogging<P extends ComponentProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLoggingComponent(props: P) {
    useEffect(() => {
      console.log(`Component ${WrappedComponent.name} mounted`);
      return () => {
        console.log(`Component ${WrappedComponent.name} unmounted`);
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
}

// 组合多个装饰者
const EnhancedUserProfile = withLogging(withAuth(withUserData(UserProfile)));
```

### 3.2 中间件模式（Redux）

Redux 中间件是装饰者模式的典型应用。

```jsx
interface Store {
  dispatch: (action: any) => any;
  getState: () => any;
}

type Middleware = (store: Store) => (next: any) => (action: any) => any;

const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.log('Dispatching:', action);
  const result = next(action);
  console.log('Next State:', store.getState());
  return result;
};

const asyncMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

function applyMiddleware(...middlewares: Middleware[]) {
  return (createStore: any) => (reducer: any) => {
    const store = createStore(reducer);
    let dispatch = store.dispatch;
    
    const chain = middlewares.map(middleware => middleware(store));
    dispatch = chain.reduce((a, b) => (...args: any[]) => a(b(...args)))(dispatch);
    
    return { ...store, dispatch };
  };
}
```

### 3.3 React Context 作为装饰者

```jsx
const ThemeContext = React.createContext('light');

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const LanguageContext = React.createContext('en');

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  );
};

// 组合多个装饰者
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProfile />
      </LanguageProvider>
    </ThemeProvider>
  );
};
```

### 3.4 自定义 Hook 作为装饰者

自定义 Hook 可以视为函数式装饰者。

```jsx
function useUserData() {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => fetchUserData().then(setUserData), []);
  
  return userData;
}

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => checkAuthStatus().then(setIsAuthenticated), []);
  
  return isAuthenticated;
}

function useTheme() {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}

const UserProfile: React.FC = () => {
  const userData = useUserData(); 
  const isAuthenticated = useAuth();
  const { theme } = useTheme();
  
  if (!isAuthenticated) {
    return <div>Please login first</div>;
  }
  
  return (
    <div className={`profile ${theme}`}>
      <h1>{userData?.name}</h1>
    </div>
  );
};
```
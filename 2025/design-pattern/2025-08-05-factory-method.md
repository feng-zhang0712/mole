# 工厂方法模式

## 一、介绍

工厂方法模式（Factory Method Pattern）是一种**创建型**设计模式，它定义了一个用于创建对象的接口，让子类决定实例化哪个类。**工厂方法使一个类的实例化延迟到其子类**。

工厂方法模式的核心思想是，**将对象的创建与使用分离，通过工厂方法来创建对象，而不是直接使用 `new` 关键字**。这样可以提高代码的灵活性和可扩展性，同时遵循开闭原则。

通过工厂方法模式，可以实现对象的创建与使用分离，提高代码的灵活性和可扩展性。不过，使用工厂方法模式，会增加类的数量，造成系统复杂性增加。

工厂方法模式中有四个参与者。

- **产品**（Product）：定义产品的接口，声明产品对象的基本操作。
- **具体产品**（ConcreteProduct）：实现产品接口，定义具体的产品对象。
- **工厂**（Creator）：声明工厂方法，该方法返回一个产品类型的对象。
- **具体工厂**（ConcreteCreator）：实现工厂方法，返回具体产品的实例。

## 二、代码实现

```typescript
interface Product {
  operation(): string;
}

abstract class Creator {
  public abstract factoryMethod(): Product;

  public someOperation(): string {
    const product = this.factoryMethod();
    return `Creator: The same creator's code has just worked with ${product.operation()}`;
  }
}

class ConcreteCreator1 extends Creator {
  public factoryMethod(): Product {
    return new ConcreteProduct1();
  }
}

class ConcreteCreator2 extends Creator {
  public factoryMethod(): Product {
    return new ConcreteProduct2();
  }
}

class ConcreteProduct1 implements Product {
  public operation(): string {
    return "{Result of the ConcreteProduct1}";
  }
}

class ConcreteProduct2 implements Product {
  public operation(): string {
    return "{Result of the ConcreteProduct2}";
  }
}
```

下面是一个示例代码。

```typescript
function clientCode(creator: Creator) {
  console.log(creator.someOperation());
}

clientCode(new ConcreteCreator1());
clientCode(new ConcreteCreator2());
```

## 三、React 中的工厂方法模式应用

### 3.1 React.createElement - 组件创建工厂

`React.createElement` 是 React 中最典型的工厂方法模式应用，它根据传入的参数创建不同类型的 React 元素。

```jsx
// React.createElement 的工厂方法模式实现
interface ReactElement {
  type: string | React.ComponentType<any>;
  key?: string | number;
  props: any;
}

function createElement(
  type: string | React.ComponentType<any>,
  props: any = {},
  ...children: React.ReactNode[]
): ReactElement {
  return {
    type,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children,
    },
  };
}
```

下面是示例代码。

```jsx
// 使用工厂方法创建不同类型的元素
const divElement = React.createElement('div', { className: 'container' }, 'Hello');
const buttonElement = React.createElement('button', { onClick: handleClick }, 'Click me');
const customElement = React.createElement(CustomComponent, { title: 'Custom' });

// JSX 语法糖实际上就是调用 React.createElement
const jsxElement = <div className="container">Hello</div>;
// 等价于
const jsxElementEquivalent = React.createElement('div', { className: 'container' }, 'Hello');
```

### 3.2 React.Component 工厂 - 组件类型创建

React 的组件系统本身就是工厂方法模式的应用，不同类型的组件通过不同的工厂方法创建。

```jsx
abstract class ComponentFactory {
  abstract createComponent(props: any): React.Component;
}

class ButtonFactory extends ComponentFactory {
  createComponent(props: any): React.Component {
    return new ButtonComponent(props);
  }
}

class InputFactory extends ComponentFactory {
  createComponent(props: any): React.Component {
    return new InputComponent(props);
  }
}

const buttonFactory = new ButtonFactory();
const inputFactory = new InputFactory();

const button = buttonFactory.createComponent({ text: 'Click me' });
const input = inputFactory.createComponent({ placeholder: 'Enter text' });

const ComponentFactory = {
  button: (props: any) => <button {...props} />,
  input: (props: any) => <input {...props} />,
  div: (props: any) => <div {...props} />,
};

const DynamicComponent = ({ type, ...props }) => {
  const Component = ComponentFactory[type];
  return Component ? <Component {...props} /> : null;
};
```

下面是示例代码。

```jsx
const App: React.FC = () => {
  return (
    <div>
      <DynamicComponent type="button" onClick={() => alert('clicked')}>
        Click me
      </DynamicComponent>
      <DynamicComponent type="input" placeholder="Enter text" />
      <DynamicComponent type="div">
        Container
      </DynamicComponent>
    </div>
  );
};
```

### 3.3 Hook 工厂 - 自定义 Hook 创建

自定义 Hook 可以作为工厂方法，根据不同的参数创建不同的 Hook 实例。

```jsx
function createDataHook<T>(fetchFunction: () => Promise<T>) {
  return function useData() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const result = await fetchFunction();
          setData(result);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    return { data, loading, error };
  };
}
```

下面是示例代码。

```jsx
const useUserData = createDataHook(() => fetch('/api/users').then(res => res.json()));
const usePostData = createDataHook(() => fetch('/api/posts').then(res => res.json()));

const UserComponent: React.FC = () => {
  const { data, loading, error } = useUserData();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
};
```

### 3.4 Context 工厂 - Context 创建

React Context 的创建过程也是工厂方法模式的应用。

```jsx
function createContext<T>(defaultValue: T) {
  const Context = React.createContext<T>(defaultValue);
  
  const Provider: React.FC<{ children: React.ReactNode; value: T }> = ({ children, value }) => (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
  
  const Consumer: React.FC<{ children: (value: T) => React.ReactNode }> = ({ children }) => (
    <Context.Consumer>
      {children}
    </Context.Consumer>
  );
  
  return { Context, Provider, Consumer };
}
```

下面是示例代码。

```jsx
const { Context: UserContext, Provider: UserProvider } = createContext(null);
const { Context: ThemeContext, Provider: ThemeProvider } = createContext('light');

const App: React.FC = () => {
  return (
    <UserProvider value={{ name: 'John', age: 30 }}>
      <ThemeProvider value="dark">
        <UserComponent />
      </ThemeProvider>
    </UserProvider>
  );
};
```

### 3.5 路由工厂 - 路由组件创建

React Router 中的路由创建也是工厂方法模式的应用。

```jsx
function createRoute(path: string, component: React.ComponentType<any>) {
  return {
    path,
    element: React.createElement(component),
  };
}

function createRouter(routes: Array<{ path: string; component: React.ComponentType<any> }>) {
  return routes.map(route => createRoute(route.path, route.component));
}
```

下面是示例代码。

```jsx
const routes = createRouter([
  { path: '/', component: HomeComponent },
  { path: '/about', component: AboutComponent },
  { path: '/contact', component: ContactComponent },
]);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {routes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
};
```

### 3.6 动态组件工厂 - 创建不同类型组件

```jsx
import React from 'react';

const ComponentFactory = {
  button: (props) => <button {...props} />,
  input: (props) => <input {...props} />,
  select: (props) => <select {...props} />,
};

const DynamicComponent = ({ type, ...props }) => {
  const Component = ComponentFactory[type];
  return Component ? <Component {...props} /> : null;
};
```

下面是示例代码。

```jsx
<DynamicComponent type="button" onClick={() => alert('clicked')}>
  Click me
</DynamicComponent>
```

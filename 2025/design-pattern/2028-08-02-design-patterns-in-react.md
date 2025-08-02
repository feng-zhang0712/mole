# React 中的设计模式

## 一、单例模式（Singleton Pattern）

确保一个类只有一个实例，并提供全局访问点。

- 单例模式在 React 中通常用于全局状态管理，例如通过 Redux 创建单一的 Store 实例。
- 使用 React 的 Context API 也可以实现类似单例的效果，确保全局共享的状态实例。

```jsx
import { createContext, useContext } from 'react';

const StoreContext = createContext(null);

// 全局唯一的 Store 实例
const store = {
  data: {},
  setData: (key, value) => {
    store.data[key] = value;
  },
  getData: (key) => store.data[key],
};

function StoreProvider({ children }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

function Component() {
  const store = useContext(StoreContext);
  return <button onClick={() => store.setData('key', 'value')}>Update</button>;
}
```

## 二、工厂方法模式（Factory Method Pattern）

定义一个创建对象的接口，让子类决定实例化哪个类。

- 用于动态创建不同类型的组件。例如，基于 props 或配置动态渲染不同的UI组件。
- 常用于组件库或需要根据条件生成不同组件的场景。

 ```jsx
 function ButtonFactory({ type, ...props }) {
   const buttonTypes = {
     primary: PrimaryButton,
     secondary: SecondaryButton,
   };
   const ButtonComponent = buttonTypes[type] || DefaultButton;
   return <ButtonComponent {...props} />;
 }

 function PrimaryButton({ children }) {
   return <button className="primary">{children}</button>;
 }

 function SecondaryButton({ children }) {
   return <button className="secondary">{children}</button>;
 }

 function DefaultButton({ children }) {
   return <button>{children}</button>;
 }
 ```

## 三、察者模式（Observer Pattern）

定义对象间一对多的依赖关系，当一个对象状态变化时，所有依赖对象都会收到通知。

- React 的状态管理和事件系统天然支持观察者模式。例如，`useState` 和 `useEffect` 通过状态变化触发组件重新渲染。
- Redux 通过订阅 Store 的变化实现观察者模式。

 ```jsx
 import { createStore } from 'redux';

 const reducer = (state = { count: 0 }, action) => {
   switch (action.type) {
     case 'INCREMENT':
       return { count: state.count + 1 };
     default:
       return state;
   }
 };

 const store = createStore(reducer);

 function Counter() {
   const [state, setState] = useState(store.getState());
   useEffect(() => {
     const unsubscribe = store.subscribe(() => setState(store.getState()));
     return unsubscribe;
   }, []);
   return <div>Count: {state.count}</div>;
 }
 ```

## 四、装饰者模式（Decorator Pattern）

动态为对象添加职责，而不修改其代码。

高阶组件（HOC）是装饰者模式的典型实现，用于为组件添加额外功能，如权限控制、日志记录或数据获取。

```jsx
function withLogging(Component) {
 return function WrappedComponent(props) {
   useEffect(() => {
     console.log(`Component ${Component.name} mounted`);
     return () => console.log(`Component ${Component.name} unmounted`);
   }, []);
   return <Component {...props} />;
 };
}

const EnhancedComponent = withLogging(MyComponent);
```

## 六、组合模式（Composite Pattern）

将对象组合成树形结构以表示“部分-整体”层次结构。

- React的组件树本质上就是组合模式，父组件包含子组件，共同构成复杂的UI结构。
- 复合组件（Compound Components）通过 Context 共享状态，实现灵活的组件组合。

```jsx
import { createContext, useContext, useState } from 'react';

const MenuContext = createContext();

function Menu({ children }) {
 const [active, setActive] = useState(null);
 return (
   <MenuContext.Provider value={{ active, setActive }}>
     <div className="menu">{children}</div>
   </MenuContext.Provider>
 );
}

function MenuItem({ id, children }) {
 const { active, setActive } = useContext(MenuContext);
 return (
   <div
     className={active === id ? 'active' : ''}
     onClick={() => setActive(id)}
   >
     {children}
   </div>
 );
}

function App() {
 return (
   <Menu>
     <MenuItem id="1">Item 1</MenuItem>
     <MenuItem id="2">Item 2</MenuItem>
   </Menu>
 );
}
```

## 六、策略模式（Strategy Pattern）

定义一系列算法，封装起来并使它们可互换。

根据条件选择不同的渲染逻辑或行为。例如，基于 props 选择不同的排序算法或格式化逻辑。

```jsx
function DataList({ data, strategy }) {
 const sortedData = strategy(data);
 return (
   <ul>
     {sortedData.map(item => (
       <li key={item.id}>{item.name}</li>
     ))}
   </ul>
 );
}

const sortByName = (data) => [...data].sort((a, b) => a.name.localeCompare(b.name));
const sortById = (data) => [...data].sort((a, b) => a.id - b.id);

function App() {
 const data = [{ id: 2, name: 'Bob' }, { id: 1, name: 'Alice' }];
 return <DataList data={data} strategy={sortByName} />;
}
```

## 七、适配器模式（Adapter Pattern）

将一个类的接口转换为客户端期望的另一个接口。

用于适配不同的数据格式或 API。例如，将旧 API 的数据格式转换为组件期望的格式。

```jsx
function LegacyDataAdapter({ data, render }) {
 // 假设旧API返回的数据格式为 { id, userName }
 const adaptedData = data.map(item => ({
   id: item.id,
   name: item.userName, // 转换为新格式
 }));
 return render(adaptedData);
}

function UserList({ users }) {
 return (
   <ul>
     {users.map(user => (
       <li key={user.id}>{user.name}</li>
     ))}
   </ul>
 );
}

function App() {
 const legacyData = [{ id: 1, userName: 'Alice' }, { id: 2, userName: 'Bob' }];
 return (
   <LegacyDataAdapter
     data={legacyData}
     render={adaptedData => <UserList users={adaptedData} />}
   />
 );
}
```

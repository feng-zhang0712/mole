# 抽象工厂模式

## 一、介绍

抽象工厂模式（Abstract Factory Pattern）是一种**创建型**设计模式，它提供了一个创建一系列相关或相互依赖对象的接口，而无需指定它们的具体类。

抽象工厂模式的核心思想是，通过定义一个抽象工厂接口，让具体的工厂类负责创建一系列相关的产品对象。这样可以确保创建的对象之间具有一致性，同时提供更好的扩展性和维护性。

通过抽象工厂模式，可以实现产品族的创建、确保产品之间的兼容性和提供更好的扩展性等功能。不过，使用抽象工厂模式，会增加系统的复杂性，造成类的数量增加，以及可能过度设计等。

抽象工厂模式中有四个参与者。

- **抽象工厂**（AbstractFactory）：声明创建抽象产品对象的操作接口。
- **具体工厂**（ConcreteFactory）：实现创建具体产品对象的操作。
- **抽象产品**（AbstractProduct）：为一类产品对象声明一个接口。
- **具体产品**（ConcreteProduct）：定义一个将被相应的具体工厂创建的产品对象。实现 AbstractProduct 接口。

## 二、伪代码实现

```typescript
interface AbstractProductA {
  usefulFunctionA(): string;
}

interface AbstractProductB {
  usefulFunctionB(): string;
  anotherUsefulFunctionB(collaborator: AbstractProductA): string;
}

class ConcreteProductA1 implements AbstractProductA {
  public usefulFunctionA(): string {
    return "The result of the product A1.";
  }
}

class ConcreteProductA2 implements AbstractProductA {
  public usefulFunctionA(): string {
    return "The result of the product A2.";
  }
}

class ConcreteProductB1 implements AbstractProductB {
  public usefulFunctionB(): string {
    return "The result of the product B1.";
  }

  public anotherUsefulFunctionB(collaborator: AbstractProductA): string {
    const result = collaborator.usefulFunctionA();
    return `The result of the B1 collaborating with the (${result})`;
  }
}

class ConcreteProductB2 implements AbstractProductB {
  public usefulFunctionB(): string {
    return "The result of the product B2.";
  }

  public anotherUsefulFunctionB(collaborator: AbstractProductA): string {
    const result = collaborator.usefulFunctionA();
    return `The result of the B2 collaborating with the (${result})`;
  }
}

interface AbstractFactory {
  createProductA(): AbstractProductA;
  createProductB(): AbstractProductB;
}

class ConcreteFactory1 implements AbstractFactory {
  public createProductA(): AbstractProductA {
    return new ConcreteProductA1();
  }

  public createProductB(): AbstractProductB {
    return new ConcreteProductB1();
  }
}

class ConcreteFactory2 implements AbstractFactory {
  public createProductA(): AbstractProductA {
    return new ConcreteProductA2();
  }

  public createProductB(): AbstractProductB {
    return new ConcreteProductB2();
  }
}
```

下面是一个示例代码。

```typescript
function clientCode(factory: AbstractFactory) {
  const productA = factory.createProductA();
  const productB = factory.createProductB();

  console.log(productB.usefulFunctionB());
  console.log(productB.anotherUsefulFunctionB(productA));
}

clientCode(new ConcreteFactory1());
clientCode(new ConcreteFactory2());
```

## 三、React 中的抽象工厂模式应用

### 3.1 UI 组件工厂 - 主题相关组件创建

UI 组件工厂可以通过抽象工厂模式创建一系列相关的 UI 组件。

```typescript
// 抽象产品 - 按钮
interface AbstractButton {
  render(): React.ReactNode;
  onClick(): void;
}

// 抽象产品 - 输入框
interface AbstractInput {
  render(): React.ReactNode;
  getValue(): string;
  setValue(value: string): void;
}

// 抽象产品 - 卡片
interface AbstractCard {
  render(): React.ReactNode;
  setContent(content: React.ReactNode): void;
}

// 具体产品 - 浅色主题按钮
class LightButton implements AbstractButton {
  constructor(private text: string, private onClick: () => void) {}

  render(): React.ReactNode {
    return (
      <button 
        className="light-button"
        onClick={this.onClick}
        style={{ backgroundColor: '#ffffff', color: '#333333', border: '1px solid #cccccc' }}
      >
        {this.text}
      </button>
    );
  }

  onClick(): void {
    this.onClick();
  }
}

// 具体产品 - 深色主题按钮
class DarkButton implements AbstractButton {
  constructor(private text: string, private onClick: () => void) {}

  render(): React.ReactNode {
    return (
      <button 
        className="dark-button"
        onClick={this.onClick}
        style={{ backgroundColor: '#333333', color: '#ffffff', border: '1px solid #666666' }}
      >
        {this.text}
      </button>
    );
  }

  onClick(): void {
    this.onClick();
  }
}

// 具体产品 - 浅色主题输入框
class LightInput implements AbstractInput {
  private value: string = '';

  render(): React.ReactNode {
    return (
      <input
        className="light-input"
        value={this.value}
        onChange={(e) => this.setValue(e.target.value)}
        style={{ backgroundColor: '#ffffff', color: '#333333', border: '1px solid #cccccc' }}
      />
    );
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
  }
}

// 具体产品 - 深色主题输入框
class DarkInput implements AbstractInput {
  private value: string = '';

  render(): React.ReactNode {
    return (
      <input
        className="dark-input"
        value={this.value}
        onChange={(e) => this.setValue(e.target.value)}
        style={{ backgroundColor: '#333333', color: '#ffffff', border: '1px solid #666666' }}
      />
    );
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
  }
}

// 具体产品 - 浅色主题卡片
class LightCard implements AbstractCard {
  private content: React.ReactNode = null;

  render(): React.ReactNode {
    return (
      <div 
        className="light-card"
        style={{ backgroundColor: '#ffffff', color: '#333333', border: '1px solid #cccccc', padding: '16px' }}
      >
        {this.content}
      </div>
    );
  }

  setContent(content: React.ReactNode): void {
    this.content = content;
  }
}

// 具体产品 - 深色主题卡片
class DarkCard implements AbstractCard {
  private content: React.ReactNode = null;

  render(): React.ReactNode {
    return (
      <div 
        className="dark-card"
        style={{ backgroundColor: '#333333', color: '#ffffff', border: '1px solid #666666', padding: '16px' }}
      >
        {this.content}
      </div>
    );
  }

  setContent(content: React.ReactNode): void {
    this.content = content;
  }
}

// 抽象工厂
interface AbstractUIFactory {
  createButton(text: string, onClick: () => void): AbstractButton;
  createInput(): AbstractInput;
  createCard(): AbstractCard;
}

// 具体工厂 - 浅色主题工厂
class LightUIFactory implements AbstractUIFactory {
  createButton(text: string, onClick: () => void): AbstractButton {
    return new LightButton(text, onClick);
  }

  createInput(): AbstractInput {
    return new LightInput();
  }

  createCard(): AbstractCard {
    return new LightCard();
  }
}

// 具体工厂 - 深色主题工厂
class DarkUIFactory implements AbstractUIFactory {
  createButton(text: string, onClick: () => void): AbstractButton {
    return new DarkButton(text, onClick);
  }

  createInput(): AbstractInput {
    return new DarkInput();
  }

  createCard(): AbstractCard {
    return new DarkCard();
  }
}
```

下面是示例代码。

```typescript
// 使用 UI 组件工厂
const UIComponent: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const factory = useMemo(() => {
    return theme === 'light' ? new LightUIFactory() : new DarkUIFactory();
  }, [theme]);

  const button = factory.createButton('Click me', () => console.log('Button clicked'));
  const input = factory.createInput();
  const card = factory.createCard();

  card.setContent(
    <div>
      <h3>Card Title</h3>
      <p>This is card content</p>
      {input.render()}
    </div>
  );

  return (
    <div>
      {button.render()}
      {card.render()}
    </div>
  );
};
```

### 3.2 数据存储工厂 - 存储方式相关组件创建

数据存储工厂可以通过抽象工厂模式创建一系列相关的存储组件。

```typescript
// 抽象产品 - 数据存储
interface AbstractStorage {
  save(key: string, value: any): void;
  load(key: string): any;
  delete(key: string): void;
}

// 抽象产品 - 数据同步器
interface AbstractSynchronizer {
  sync(data: any): Promise<void>;
  getLastSyncTime(): Date;
}

// 抽象产品 - 数据验证器
interface AbstractValidator {
  validate(data: any): { isValid: boolean; errors: string[] };
}

// 具体产品 - 本地存储
class LocalStorage implements AbstractStorage {
  save(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  load(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  delete(key: string): void {
    localStorage.removeItem(key);
  }
}

// 具体产品 - 会话存储
class SessionStorage implements AbstractStorage {
  save(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  load(key: string): any {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  delete(key: string): void {
    sessionStorage.removeItem(key);
  }
}

// 具体产品 - 本地同步器
class LocalSynchronizer implements AbstractSynchronizer {
  private lastSyncTime: Date = new Date();

  async sync(data: any): Promise<void> {
    // 模拟本地同步逻辑
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lastSyncTime = new Date();
  }

  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }
}

// 具体产品 - 远程同步器
class RemoteSynchronizer implements AbstractSynchronizer {
  private lastSyncTime: Date = new Date();

  async sync(data: any): Promise<void> {
    // 模拟远程同步逻辑
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    this.lastSyncTime = new Date();
  }

  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }
}

// 具体产品 - 本地验证器
class LocalValidator implements AbstractValidator {
  validate(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data) {
      errors.push('Data is required');
    }
    
    if (typeof data !== 'object') {
      errors.push('Data must be an object');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 具体产品 - 远程验证器
class RemoteValidator implements AbstractValidator {
  async validate(data: any): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation service unavailable']
      };
    }
  }
}

// 抽象工厂
interface AbstractStorageFactory {
  createStorage(): AbstractStorage;
  createSynchronizer(): AbstractSynchronizer;
  createValidator(): AbstractValidator;
}

// 具体工厂 - 本地存储工厂
class LocalStorageFactory implements AbstractStorageFactory {
  createStorage(): AbstractStorage {
    return new LocalStorage();
  }

  createSynchronizer(): AbstractSynchronizer {
    return new LocalSynchronizer();
  }

  createValidator(): AbstractValidator {
    return new LocalValidator();
  }
}

// 具体工厂 - 远程存储工厂
class RemoteStorageFactory implements AbstractStorageFactory {
  createStorage(): AbstractStorage {
    return new SessionStorage();
  }

  createSynchronizer(): AbstractSynchronizer {
    return new RemoteSynchronizer();
  }

  createValidator(): AbstractValidator {
    return new RemoteValidator();
  }
}
```

下面是示例代码。

```typescript
// 使用数据存储工厂
const DataManager: React.FC<{ storageType: 'local' | 'remote' }> = ({ storageType }) => {
  const factory = useMemo(() => {
    return storageType === 'local' ? new LocalStorageFactory() : new RemoteStorageFactory();
  }, [storageType]);

  const storage = factory.createStorage();
  const synchronizer = factory.createSynchronizer();
  const validator = factory.createValidator();

  const handleSave = (data: any) => {
    const validation = validator.validate(data);
    if (validation.isValid) {
      storage.save('userData', data);
      synchronizer.sync(data);
    } else {
      console.error('Validation errors:', validation.errors);
    }
  };

  const handleLoad = () => {
    return storage.load('userData');
  };

  return (
    <div>
      <button onClick={() => handleSave({ name: 'John', age: 30 })}>
        Save Data
      </button>
      <button onClick={() => console.log(handleLoad())}>
        Load Data
      </button>
      <p>Last sync: {synchronizer.getLastSyncTime().toLocaleString()}</p>
    </div>
  );
};
```

### 3.3 表单工厂 - 表单类型相关组件创建

表单工厂可以通过抽象工厂模式创建一系列相关的表单组件。

```typescript
// 抽象产品 - 表单字段
interface AbstractFormField {
  render(): React.ReactNode;
  getValue(): any;
  setValue(value: any): void;
  validate(): { isValid: boolean; message: string };
}

// 抽象产品 - 表单验证器
interface AbstractFormValidator {
  validateForm(fields: AbstractFormField[]): { isValid: boolean; errors: string[] };
}

// 抽象产品 - 表单提交器
interface AbstractFormSubmitter {
  submit(data: any): Promise<{ success: boolean; message: string }>;
}

// 具体产品 - 文本字段
class TextField implements AbstractFormField {
  private value: string = '';

  render(): React.ReactNode {
    return (
      <input
        type="text"
        value={this.value}
        onChange={(e) => this.setValue(e.target.value)}
        placeholder="Enter text"
      />
    );
  }

  getValue(): any {
    return this.value;
  }

  setValue(value: any): void {
    this.value = value;
  }

  validate(): { isValid: boolean; message: string } {
    const isValid = this.value.length > 0;
    return {
      isValid,
      message: isValid ? '' : 'This field is required'
    };
  }
}

// 具体产品 - 数字字段
class NumberField implements AbstractFormField {
  private value: number = 0;

  render(): React.ReactNode {
    return (
      <input
        type="number"
        value={this.value}
        onChange={(e) => this.setValue(Number(e.target.value))}
        placeholder="Enter number"
      />
    );
  }

  getValue(): any {
    return this.value;
  }

  setValue(value: any): void {
    this.value = value;
  }

  validate(): { isValid: boolean; message: string } {
    const isValid = this.value > 0;
    return {
      isValid,
      message: isValid ? '' : 'Number must be greater than 0'
    };
  }
}

// 具体产品 - 简单验证器
class SimpleValidator implements AbstractFormValidator {
  validateForm(fields: AbstractFormField[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    fields.forEach(field => {
      const validation = field.validate();
      if (!validation.isValid) {
        errors.push(validation.message);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 具体产品 - 严格验证器
class StrictValidator implements AbstractFormValidator {
  validateForm(fields: AbstractFormField[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    fields.forEach((field, index) => {
      const validation = field.validate();
      if (!validation.isValid) {
        errors.push(`Field ${index + 1}: ${validation.message}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 具体产品 - 本地提交器
class LocalSubmitter implements AbstractFormSubmitter {
  async submit(data: any): Promise<{ success: boolean; message: string }> {
    // 模拟本地提交
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      success: true,
      message: 'Data saved locally'
    };
  }
}

// 具体产品 - 远程提交器
class RemoteSubmitter implements AbstractFormSubmitter {
  async submit(data: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        return {
          success: true,
          message: 'Data submitted successfully'
        };
      } else {
        return {
          success: false,
          message: 'Submission failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }
}

// 抽象工厂
interface AbstractFormFactory {
  createTextField(): AbstractFormField;
  createNumberField(): AbstractFormField;
  createValidator(): AbstractFormValidator;
  createSubmitter(): AbstractFormSubmitter;
}

// 具体工厂 - 简单表单工厂
class SimpleFormFactory implements AbstractFormFactory {
  createTextField(): AbstractFormField {
    return new TextField();
  }

  createNumberField(): AbstractFormField {
    return new NumberField();
  }

  createValidator(): AbstractFormValidator {
    return new SimpleValidator();
  }

  createSubmitter(): AbstractFormSubmitter {
    return new LocalSubmitter();
  }
}

// 具体工厂 - 严格表单工厂
class StrictFormFactory implements AbstractFormFactory {
  createTextField(): AbstractFormField {
    return new TextField();
  }

  createNumberField(): AbstractFormField {
    return new NumberField();
  }

  createValidator(): AbstractFormValidator {
    return new StrictValidator();
  }

  createSubmitter(): AbstractFormSubmitter {
    return new RemoteSubmitter();
  }
}
```

下面是示例代码。

```typescript
// 使用表单工厂
const FormComponent: React.FC<{ formType: 'simple' | 'strict' }> = ({ formType }) => {
  const factory = useMemo(() => {
    return formType === 'simple' ? new SimpleFormFactory() : new StrictFormFactory();
  }, [formType]);

  const textField = factory.createTextField();
  const numberField = factory.createNumberField();
  const validator = factory.createValidator();
  const submitter = factory.createSubmitter();

  const handleSubmit = async () => {
    const fields = [textField, numberField];
    const validation = validator.validateForm(fields);
    
    if (validation.isValid) {
      const data = {
        text: textField.getValue(),
        number: numberField.getValue(),
      };
      
      const result = await submitter.submit(data);
      console.log(result.message);
    } else {
      console.error('Validation errors:', validation.errors);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div>{textField.render()}</div>
      <div>{numberField.render()}</div>
      <button type="submit">Submit</button>
    </form>
  );
};
```

### 3.4 路由工厂 - 路由类型相关组件创建

路由工厂可以通过抽象工厂模式创建一系列相关的路由组件。

```typescript
// 抽象产品 - 路由导航器
interface AbstractNavigator {
  navigate(path: string): void;
  getCurrentPath(): string;
}

// 抽象产品 - 路由守卫
interface AbstractGuard {
  canActivate(path: string): boolean;
  canDeactivate(path: string): boolean;
}

// 抽象产品 - 路由解析器
interface AbstractResolver {
  resolve(path: string): Promise<any>;
}

// 具体产品 - 浏览器导航器
class BrowserNavigator implements AbstractNavigator {
  navigate(path: string): void {
    window.history.pushState({}, '', path);
  }

  getCurrentPath(): string {
    return window.location.pathname;
  }
}

// 具体产品 - 哈希导航器
class HashNavigator implements AbstractNavigator {
  navigate(path: string): void {
    window.location.hash = path;
  }

  getCurrentPath(): string {
    return window.location.hash.slice(1);
  }
}

// 具体产品 - 简单守卫
class SimpleGuard implements AbstractGuard {
  canActivate(path: string): boolean {
    return path !== '/admin';
  }

  canDeactivate(path: string): boolean {
    return true;
  }
}

// 具体产品 - 严格守卫
class StrictGuard implements AbstractGuard {
  private isAuthenticated = false;

  canActivate(path: string): boolean {
    if (path.startsWith('/admin') && !this.isAuthenticated) {
      return false;
    }
    return true;
  }

  canDeactivate(path: string): boolean {
    return path !== '/admin';
  }
}

// 具体产品 - 本地解析器
class LocalResolver implements AbstractResolver {
  async resolve(path: string): Promise<any> {
    // 模拟本地解析
    await new Promise(resolve => setTimeout(resolve, 50));
    return { component: 'LocalComponent', data: { path } };
  }
}

// 具体产品 - 远程解析器
class RemoteResolver implements AbstractResolver {
  async resolve(path: string): Promise<any> {
    try {
      const response = await fetch(`/api/resolve?path=${path}`);
      return await response.json();
    } catch (error) {
      return { component: 'ErrorComponent', data: { error } };
    }
  }
}

// 抽象工厂
interface AbstractRouterFactory {
  createNavigator(): AbstractNavigator;
  createGuard(): AbstractGuard;
  createResolver(): AbstractResolver;
}

// 具体工厂 - 简单路由工厂
class SimpleRouterFactory implements AbstractRouterFactory {
  createNavigator(): AbstractNavigator {
    return new BrowserNavigator();
  }

  createGuard(): AbstractGuard {
    return new SimpleGuard();
  }

  createResolver(): AbstractResolver {
    return new LocalResolver();
  }
}

// 具体工厂 - 严格路由工厂
class StrictRouterFactory implements AbstractRouterFactory {
  createNavigator(): AbstractNavigator {
    return new HashNavigator();
  }

  createGuard(): AbstractGuard {
    return new StrictGuard();
  }

  createResolver(): AbstractResolver {
    return new RemoteResolver();
  }
}
```

下面是示例代码。

```typescript
// 使用路由工厂
const RouterComponent: React.FC<{ routerType: 'simple' | 'strict' }> = ({ routerType }) => {
  const factory = useMemo(() => {
    return routerType === 'simple' ? new SimpleRouterFactory() : new StrictRouterFactory();
  }, [routerType]);

  const navigator = factory.createNavigator();
  const guard = factory.createGuard();
  const resolver = factory.createResolver();

  const handleNavigation = async (path: string) => {
    if (guard.canActivate(path)) {
      const resolved = await resolver.resolve(path);
      navigator.navigate(path);
      console.log('Navigated to:', path, 'Resolved:', resolved);
    } else {
      console.log('Access denied to:', path);
    }
  };

  return (
    <div>
      <button onClick={() => handleNavigation('/home')}>Home</button>
      <button onClick={() => handleNavigation('/about')}>About</button>
      <button onClick={() => handleNavigation('/admin')}>Admin</button>
      <p>Current path: {navigator.getCurrentPath()}</p>
    </div>
  );
};
```

### 3.5 状态管理工厂 - 状态类型相关组件创建

状态管理工厂可以通过抽象工厂模式创建一系列相关的状态管理组件。

```typescript
// 抽象产品 - 状态存储
interface AbstractStateStore {
  getState(): any;
  setState(state: any): void;
  subscribe(listener: (state: any) => void): () => void;
}

// 抽象产品 - 状态选择器
interface AbstractSelector {
  select(state: any): any;
}

// 抽象产品 - 状态分发器
interface AbstractDispatcher {
  dispatch(action: any): void;
}

// 具体产品 - 本地状态存储
class LocalStateStore implements AbstractStateStore {
  private state: any = {};
  private listeners: ((state: any) => void)[] = [];

  getState(): any {
    return this.state;
  }

  setState(state: any): void {
    this.state = { ...this.state, ...state };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: any) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// 具体产品 - 全局状态存储
class GlobalStateStore implements AbstractStateStore {
  private state: any = {};
  private listeners: ((state: any) => void)[] = [];

  getState(): any {
    return this.state;
  }

  setState(state: any): void {
    this.state = { ...this.state, ...state };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: any) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// 具体产品 - 简单选择器
class SimpleSelector implements AbstractSelector {
  select(state: any): any {
    return state;
  }
}

// 具体产品 - 过滤选择器
class FilterSelector implements AbstractSelector {
  constructor(private filter: (state: any) => any) {}

  select(state: any): any {
    return this.filter(state);
  }
}

// 具体产品 - 简单分发器
class SimpleDispatcher implements AbstractDispatcher {
  constructor(private store: AbstractStateStore) {}

  dispatch(action: any): void {
    this.store.setState(action);
  }
}

// 具体产品 - 异步分发器
class AsyncDispatcher implements AbstractDispatcher {
  constructor(private store: AbstractStateStore) {}

  async dispatch(action: any): Promise<void> {
    if (typeof action === 'function') {
      const result = await action();
      this.store.setState(result);
    } else {
      this.store.setState(action);
    }
  }
}

// 抽象工厂
interface AbstractStateFactory {
  createStore(): AbstractStateStore;
  createSelector(filter?: (state: any) => any): AbstractSelector;
  createDispatcher(store: AbstractStateStore): AbstractDispatcher;
}

// 具体工厂 - 简单状态工厂
class SimpleStateFactory implements AbstractStateFactory {
  createStore(): AbstractStateStore {
    return new LocalStateStore();
  }

  createSelector(filter?: (state: any) => any): AbstractSelector {
    return filter ? new FilterSelector(filter) : new SimpleSelector();
  }

  createDispatcher(store: AbstractStateStore): AbstractDispatcher {
    return new SimpleDispatcher(store);
  }
}

// 具体工厂 - 复杂状态工厂
class ComplexStateFactory implements AbstractStateFactory {
  createStore(): AbstractStateStore {
    return new GlobalStateStore();
  }

  createSelector(filter?: (state: any) => any): AbstractSelector {
    return filter ? new FilterSelector(filter) : new SimpleSelector();
  }

  createDispatcher(store: AbstractStateStore): AbstractDispatcher {
    return new AsyncDispatcher(store);
  }
}
```

下面是示例代码。

```typescript
// 使用状态管理工厂
const StateManager: React.FC<{ stateType: 'simple' | 'complex' }> = ({ stateType }) => {
  const factory = useMemo(() => {
    return stateType === 'simple' ? new SimpleStateFactory() : new ComplexStateFactory();
  }, [stateType]);

  const store = factory.createStore();
  const selector = factory.createSelector(state => state.user);
  const dispatcher = factory.createDispatcher(store);

  const [currentState, setCurrentState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setCurrentState);
    return unsubscribe;
  }, [store]);

  const handleUpdateUser = () => {
    dispatcher.dispatch({ user: { name: 'John', age: 30 } });
  };

  const selectedState = selector.select(currentState);

  return (
    <div>
      <button onClick={handleUpdateUser}>Update User</button>
      <p>Current state: {JSON.stringify(currentState)}</p>
      <p>Selected state: {JSON.stringify(selectedState)}</p>
    </div>
  );
};
```

## 四、抽象工厂模式和工厂方法模式的区别

抽象工厂模式和工厂方法模式，本质区别是，工厂方法模式关注**单个对象**的创建，而抽象工厂模式关注**一系列相关对象**的创建和它们之间的兼容性。

### 1. 创建对象的数量不同

工厂方法模式：创建单个对象。每个工厂方法只负责创建一种产品，一个工厂类通常只有一个工厂方法。

```typescript
abstract class Creator {
  abstract factoryMethod(): Product;
}

class ConcreteCreator extends Creator {
  factoryMethod(): Product {
    return new ConcreteProduct();
  }
}
```

抽象工厂模式：创建一系列相关对象。一个工厂类负责创建多个相关的产品，一个工厂类通常有多个工厂方法。

```typescript
interface AbstractFactory {
  createProductA(): AbstractProductA;
  createProductB(): AbstractProductB;
  createProductC(): AbstractProductC;
}
```

### 2. 产品之间的关系不同

工厂方法模式：产品之间无关联。创建的产品是独立的，不需要相互配合。每个产品都是独立的个体。

```typescript
class ButtonCreator extends Creator {
  factoryMethod(): Product {
    return new Button();
  }
}

class InputCreator extends Creator {
  factoryMethod(): Product {
    return new Input();
  }
}
```

抽象工厂模式：产品之间有关联：创建的产品属于同一个产品族，需要相互配合。产品之间有依赖关系或兼容性要求。

```typescript
class LightThemeFactory implements AbstractFactory {
  createButton(): Button { return new LightButton(); }
  createInput(): Input { return new LightInput(); }
  createCard(): Card { return new LightCard(); }
}

class DarkThemeFactory implements AbstractFactory {
  createButton(): Button { return new DarkButton(); }
  createInput(): Input { return new DarkInput(); }
  createCard(): Card { return new DarkCard(); }
}
```

### 3. 扩展方式不同

工厂方法模式：扩展新产品：添加新的具体产品类，同时添加对应的工厂类。扩展时需要同时修改产品类和工厂类。

```typescript
// 工厂方法模式扩展 - 需要添加新的产品类和工厂类
class NewProduct extends Product { /* ... */ }
class NewCreator extends Creator {
  factoryMethod(): Product {
    return new NewProduct();
  }
}
```

抽象工厂模式：扩展新产品族：添加新的具体工厂类，创建新的产品族。扩展时只需要添加新的工厂类，不需要修改现有代码。

```typescript
// 抽象工厂模式扩展 - 只需要添加新的工厂类
class HighContrastThemeFactory implements AbstractFactory {
  createButton(): Button { return new HighContrastButton(); }
  createInput(): Input { return new HighContrastInput(); }
  createCard(): Card { return new HighContrastCard(); }
}
```

### 4. 使用场景不同

工厂方法模式：适用需要创建单个对象，且对象类型在运行时确定。典型应用是 React.createElement、组件创建。

```typescript
// React中的工厂方法模式
const createElement = (type, props, children) => {
  return { type, props, children };
};

const button = createElement('button', { onClick: handleClick }, 'Click me');
const input = createElement('input', { type: 'text' });
```

抽象工厂模式：适用需要创建一系列相关的对象，确保对象之间的兼容性。典型应用是主题系统、平台适配。

```typescript
class LightThemeFactory {
  createButton() { return <button className="light-button" />; }
  createInput() { return <input className="light-input" />; }
  createCard() { return <div className="light-card" />; }
}

class DarkThemeFactory {
  createButton() { return <button className="dark-button" />; }
  createInput() { return <input className="dark-input" />; }
  createCard() { return <div className="dark-card" />; }
}
```

### 5. 复杂度不同

工厂方法模式：相对简单，只需要一个抽象工厂类和具体工厂类。结构清晰，易于理解。

```typescript
abstract class Creator {
  abstract factoryMethod(): Product;
}

class ConcreteCreator extends Creator {
  factoryMethod(): Product {
    return new ConcreteProduct();
  }
}
```

抽象工厂模式：相对复杂，需要多个抽象产品接口和多个具体产品类。结构更复杂，但提供更好的扩展性。

```typescript
interface AbstractProductA { /* ... */ }
interface AbstractProductB { /* ... */ }
interface AbstractFactory {
  createProductA(): AbstractProductA;
  createProductB(): AbstractProductB;
}
```

### 6. 设计目的不同

工厂方法模式：目的是将对象的创建延迟到子类。关注点是单个对象的创建过程。

抽象工厂模式：目的是确保创建的对象之间具有一致性。关注点是产品族之间的兼容性和一致性。

### 总结

| 特征 | 工厂方法模式 | 抽象工厂模式 |
|------|-------------|-------------|
| 创建对象数量 | 单个对象 | 一系列相关对象 |
| 产品关系 | 独立 | 相关/兼容 |
| 扩展方式 | 添加产品类和工厂类 | 添加工厂类 |
| 复杂度 | 简单 | 复杂 |
| 使用场景 | 单个对象创建 | 产品族创建 |
| 设计目的 | 延迟创建 | 确保一致性 |

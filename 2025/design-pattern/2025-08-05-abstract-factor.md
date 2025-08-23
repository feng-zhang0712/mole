# 抽象工厂模式

## 一、介绍

抽象工厂模式（Abstract Factory Pattern）是一种**创建型**设计模式，它提供了一个创建一系列相关或相互依赖对象的接口，而无需指定它们的具体类。

抽象工厂模式的核心思想是，通过定义一个抽象工厂接口，让具体的工厂类负责创建一系列相关的产品对象。这样可以确保创建的对象之间具有一致性，同时提供更好的扩展性和维护性。

抽象工厂模式中有四个参与者。

- **抽象工厂**（AbstractFactory）：声明创建抽象产品的接口。
- **具体工厂**（ConcreteFactory）：实现抽象工厂定义的接口，在接口方法中创建具体的产品。
- **抽象产品**（AbstractProduct）：定义一类产品特性的接口。
- **具体产品**（ConcreteProduct）：实现抽象产品接口，定义一个将被相应的具体工厂创建的产品。

通过抽象工厂模式，可以实现产品族的创建、确保产品之间的兼容性和提供更好的扩展性等功能。不过，使用抽象工厂模式，会增加系统的复杂性，造成类的数量增加，以及带来过度设计等问题。

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

UI 组件工厂可以创建一系列相关的 UI 组件。

```jsx
// AbstractProduct - 按钮
interface AbstractButton {
  render(): React.ReactNode;
  onClick(): void;
}

// AbstractProduct - 输入框
interface AbstractInput {
  render(): React.ReactNode;
  getValue(): string;
  setValue(value: string): void;
}

// AbstractProduct - 卡片
interface AbstractCard {
  render(): React.ReactNode;
  setContent(content: React.ReactNode): void;
}

// ConcreteProduct - 浅色主题按钮
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

// ConcreteProduct - 深色主题按钮
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

// ConcreteProduct - 浅色主题输入框
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

// ConcreteProduct - 深色主题输入框
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

// ConcreteProduct - 浅色主题卡片
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

// ConcreteProduct - 深色主题卡片
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

// AbstractFactory
interface AbstractUIFactory {
  createButton(text: string, onClick: () => void): AbstractButton;
  createInput(): AbstractInput;
  createCard(): AbstractCard;
}

// ConcreteFactory - 浅色主题工厂
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

// ConcreteFactory - 深色主题工厂
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

```jsx
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

### 3.2 表单工厂 - 表单类型相关组件创建

表单工厂可以创建一系列相关的表单组件。

```jsx
// AbstractProduct - 表单字段
interface AbstractFormField {
  render(): React.ReactNode;
  getValue(): any;
  setValue(value: any): void;
  validate(): { isValid: boolean; message: string };
}

// AbstractProduct - 表单验证器
interface AbstractFormValidator {
  validateForm(fields: AbstractFormField[]): { isValid: boolean; errors: string[] };
}

// AbstractProduct - 表单提交器
interface AbstractFormSubmitter {
  submit(data: any): Promise<{ success: boolean; message: string }>;
}

// ConcreteProduct - 文本字段
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

// ConcreteProduct - 数字字段
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

// ConcreteProduct - 简单验证器
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

// ConcreteProduct - 严格验证器
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

// ConcreteProduct - 本地提交器
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

// ConcreteProduct - 远程提交器
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

// AbstractFactory
interface AbstractFormFactory {
  createTextField(): AbstractFormField;
  createNumberField(): AbstractFormField;
  createValidator(): AbstractFormValidator;
  createSubmitter(): AbstractFormSubmitter;
}

// ConcreteFactory - 简单表单工厂
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

// ConcreteFactory - 严格表单工厂
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

```jsx
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

### 3.3 路由工厂 - 路由类型相关组件创建

路由工厂可以创建一系列相关的路由组件。

```jsx
// AbstractProduct - 路由导航器
interface AbstractNavigator {
  navigate(path: string): void;
  getCurrentPath(): string;
}

// AbstractProduct - 路由守卫
interface AbstractGuard {
  canActivate(path: string): boolean;
  canDeactivate(path: string): boolean;
}

// AbstractProduct - 路由解析器
interface AbstractResolver {
  resolve(path: string): Promise<any>;
}

// ConcreteProduct - 浏览器导航器
class BrowserNavigator implements AbstractNavigator {
  navigate(path: string): void {
    window.history.pushState({}, '', path);
  }

  getCurrentPath(): string {
    return window.location.pathname;
  }
}

// ConcreteProduct - 哈希导航器
class HashNavigator implements AbstractNavigator {
  navigate(path: string): void {
    window.location.hash = path;
  }

  getCurrentPath(): string {
    return window.location.hash.slice(1);
  }
}

// ConcreteProduct - 简单守卫
class SimpleGuard implements AbstractGuard {
  canActivate(path: string): boolean {
    return path !== '/admin';
  }

  canDeactivate(path: string): boolean {
    return true;
  }
}

// ConcreteProduct - 严格守卫
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

// ConcreteProduct - 本地解析器
class LocalResolver implements AbstractResolver {
  async resolve(path: string): Promise<any> {
    // 模拟本地解析
    await new Promise(resolve => setTimeout(resolve, 50));
    return { component: 'LocalComponent', data: { path } };
  }
}

// ConcreteProduct - 远程解析器
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

// AbstractFactory
interface AbstractRouterFactory {
  createNavigator(): AbstractNavigator;
  createGuard(): AbstractGuard;
  createResolver(): AbstractResolver;
}

// ConcreteFactory - 简单路由工厂
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

// ConcreteFactory - 严格路由工厂
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

```jsx
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

## 四、抽象工厂模式和工厂方法模式的区别

抽象工厂模式和工厂方法模式，本质区别是，抽象工厂模式关注**一系列相关对象**的创建和它们之间的兼容性，而工厂方法模式关注**单个对象**的创建。

### 4.1 创建对象的数量不同

抽象工厂模式创建一系列相关对象。一个工厂类负责创建多个相关的产品，一个工厂类通常有多个工厂方法。

```typescript
interface AbstractFactory {
  createProductA(): AbstractProductA;
  createProductB(): AbstractProductB;
  createProductC(): AbstractProductC;
}
```

工厂方法模式创建单个对象。每个工厂方法只负责创建一种产品，一个工厂类通常只有一个工厂方法。

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

### 4.2 产品之间的关系不同

抽象工厂模式产品之间有关联。创建的产品属于同一个产品族，需要相互配合。产品之间有依赖关系或兼容性要求。

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

工厂方法模式产品之间无关联。创建的产品是独立的，不需要相互配合。

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

### 4.3 扩展方式不同

抽象工厂模式扩展新产品族：添加新的具体工厂类，创建新的产品族。扩展时只需要添加新的工厂类，不需要修改现有代码。

```typescript
// 抽象工厂模式扩展 - 只需要添加新的工厂类
class HighContrastThemeFactory implements AbstractFactory {
  createButton(): Button { return new HighContrastButton(); }
  createInput(): Input { return new HighContrastInput(); }
  createCard(): Card { return new HighContrastCard(); }
}
```

工厂方法模式扩展新产品：添加新的具体产品类，同时添加对应的工厂类。扩展时需要同时修改产品类和工厂类。

```typescript
// 工厂方法模式扩展 - 需要添加新的产品类和工厂类
class NewProduct extends Product { /* ... */ }
class NewCreator extends Creator {
  factoryMethod(): Product {
    return new NewProduct();
  }
}
```

### 4.4 使用场景不同

抽象工厂模式的典型应用是主题系统、平台适配。

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

工厂方法模式的典型应用是 `React.createElement`、组件创建。

```jsx
// React中的工厂方法模式
const createElement = (type, props, children) => {
  return { type, props, children };
};

const button = createElement('button', { onClick: handleClick }, 'Click me');
const input = createElement('input', { type: 'text' });
```

### 4.5 复杂度不同

抽象工厂模式相对复杂，需要多个抽象产品接口和多个具体产品类。结构复杂，但提供更好的扩展性。

```typescript
interface AbstractProductA { /* ... */ }
interface AbstractProductB { /* ... */ }
interface AbstractFactory {
  createProductA(): AbstractProductA;
  createProductB(): AbstractProductB;
}
```

工厂方法模式相对简单，只需要一个抽象工厂类和具体工厂类。结构清晰，易于理解。

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

### 4.6 设计目的不同

工厂方法模式：目的是将对象的创建延迟到子类。关注点是单个对象的创建过程。

抽象工厂模式：目的是确保创建的对象之间具有一致性。关注点是产品族之间的兼容性和一致性。

| 特征 | 工厂方法模式 | 抽象工厂模式 |
|------|-------------|-------------|
| 创建对象数量 | 单个对象 | 一系列相关对象 |
| 产品关系 | 独立 | 相关/兼容 |
| 扩展方式 | 添加产品类和工厂类 | 添加工厂类 |
| 复杂度 | 简单 | 复杂 |
| 使用场景 | 单个对象创建 | 产品族创建 |
| 设计目的 | 延迟创建 | 确保一致性 |

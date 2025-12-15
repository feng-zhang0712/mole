# 领域模型详解

## 一、概述

领域模型（Domain Model）是软件工程中的一个核心概念，它是对业务领域中概念、规则和关系的抽象表示。领域模型是领域驱动设计（Domain-Driven Design，DDD）的核心组成部分，用于捕获和表达业务逻辑。

### 1.1 什么是领域模型

领域模型是一个概念模型，它描述了业务领域中的：

- 实体（Entities）：具有唯一标识的对象
- 值对象（Value Objects）：没有标识的对象，通过属性值来区分
- 聚合（Aggregates）：一组相关对象的集合
- 领域服务（Domain Services）：不属于任何实体的业务逻辑
- 领域事件（Domain Events）：业务中发生的重要事件

### 1.2 领域模型的特点

1. 业务导向：直接反映业务需求和规则
2. 高内聚：相关概念聚集在一起
3. 低耦合：不同概念之间依赖最小化
4. 可扩展：易于添加新的业务概念
5. 可测试：业务逻辑独立，便于测试

## 二、领域模型的核心概念

### 2.1 实体（Entity）

实体是具有唯一标识的对象，即使属性发生变化，标识保持不变。

```typescript
// 用户实体
class User {
  private readonly id: UserId;
  private name: string;
  private email: Email;
  private status: UserStatus;

  constructor(id: UserId, name: string, email: Email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.status = UserStatus.ACTIVE;
  }

  // 业务方法
  changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('用户名不能为空');
    }
    this.name = newName;
  }

  deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }

  // 标识比较
  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}

// 用户ID值对象
class UserId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('用户ID不能为空');
    }
    this.value = value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// 邮箱值对象
class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error('邮箱格式不正确');
    }
    this.value = value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// 用户状态枚举
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}
```

### 2.2 值对象（Value Object）

值对象是没有标识的对象，通过属性值来区分，不可变。

```typescript
// 金额值对象
class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'CNY') {
    if (amount < 0) {
      throw new Error('金额不能为负数');
    }
    if (!currency || currency.trim().length === 0) {
      throw new Error('货币不能为空');
    }
    this.amount = amount;
    this.currency = currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('不同货币不能相加');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}

// 地址值对象
class Address {
  private readonly street: string;
  private readonly city: string;
  private readonly postalCode: string;
  private readonly country: string;

  constructor(street: string, city: string, postalCode: string, country: string) {
    this.street = street;
    this.city = city;
    this.postalCode = postalCode;
    this.country = country;
  }

  equals(other: Address): boolean {
    return this.street === other.street &&
           this.city === other.city &&
           this.postalCode === other.postalCode &&
           this.country === other.country;
  }

  toString(): string {
    return `${this.street}, ${this.city}, ${this.postalCode}, ${this.country}`;
  }
}
```

### 2.3 聚合（Aggregate）

聚合是一组相关对象的集合，有一个根实体作为聚合根。

```typescript
// 订单聚合
class Order {
  private readonly id: OrderId;
  private customerId: CustomerId;
  private items: OrderItem[];
  private status: OrderStatus;
  private totalAmount: Money;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(id: OrderId, customerId: CustomerId) {
    this.id = id;
    this.customerId = customerId;
    this.items = [];
    this.status = OrderStatus.PENDING;
    this.totalAmount = new Money(0);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // 添加商品
  addItem(productId: ProductId, quantity: number, unitPrice: Money): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('只能向待处理订单添加商品');
    }

    const existingItem = this.items.find(item => item.productId.equals(productId));
    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      const newItem = new OrderItem(productId, quantity, unitPrice);
      this.items.push(newItem);
    }

    this.calculateTotalAmount();
    this.updatedAt = new Date();
  }

  // 移除商品
  removeItem(productId: ProductId): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('只能从待处理订单移除商品');
    }

    this.items = this.items.filter(item => !item.productId.equals(productId));
    this.calculateTotalAmount();
    this.updatedAt = new Date();
  }

  // 确认订单
  confirm(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('只能确认待处理订单');
    }

    if (this.items.length === 0) {
      throw new Error('订单不能为空');
    }

    this.status = OrderStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  // 计算总金额
  private calculateTotalAmount(): void {
    this.totalAmount = this.items.reduce((total, item) => {
      return total.add(item.getSubtotal());
    }, new Money(0));
  }

  // 获取订单项
  getItems(): ReadonlyArray<OrderItem> {
    return [...this.items];
  }

  // 获取总金额
  getTotalAmount(): Money {
    return this.totalAmount;
  }
}

// 订单项实体
class OrderItem {
  private readonly productId: ProductId;
  private quantity: number;
  private unitPrice: Money;

  constructor(productId: ProductId, quantity: number, unitPrice: Money) {
    if (quantity <= 0) {
      throw new Error('商品数量必须大于0');
    }
    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }

  increaseQuantity(amount: number): void {
    if (amount <= 0) {
      throw new Error('增加数量必须大于0');
    }
    this.quantity += amount;
  }

  decreaseQuantity(amount: number): void {
    if (amount <= 0) {
      throw new Error('减少数量必须大于0');
    }
    if (this.quantity - amount <= 0) {
      throw new Error('商品数量不能为0');
    }
    this.quantity -= amount;
  }

  getSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}

// 订单ID值对象
class OrderId {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// 订单状态枚举
enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
```

### 2.4 领域服务（Domain Service）

领域服务包含不属于任何实体的业务逻辑。

```typescript
// 订单领域服务
class OrderDomainService {
  // 计算订单折扣
  calculateDiscount(order: Order, customer: Customer): Money {
    let discountAmount = new Money(0);

    // 会员折扣
    if (customer.isVip()) {
      discountAmount = order.getTotalAmount().multiply(0.1); // 10%折扣
    }

    // 满减优惠
    const totalAmount = order.getTotalAmount();
    if (totalAmount.getAmount() >= 1000) {
      discountAmount = discountAmount.add(new Money(50));
    }

    return discountAmount;
  }

  // 检查订单是否可以取消
  canCancelOrder(order: Order): boolean {
    return order.getStatus() === OrderStatus.PENDING || 
           order.getStatus() === OrderStatus.CONFIRMED;
  }

  // 计算运费
  calculateShippingFee(order: Order, address: Address): Money {
    const totalWeight = this.calculateTotalWeight(order);
    const baseFee = new Money(10); // 基础运费
    
    if (totalWeight > 5) {
      return baseFee.add(new Money(totalWeight * 2));
    }
    
    return baseFee;
  }

  private calculateTotalWeight(order: Order): number {
    // 计算订单总重量
    return order.getItems().reduce((total, item) => {
      return total + item.getWeight();
    }, 0);
  }
}

// 用户领域服务
class UserDomainService {
  // 检查用户名是否可用
  isUsernameAvailable(username: string): boolean {
    // 这里应该调用仓储检查用户名是否存在
    // 为了示例，我们简化处理
    return username.length >= 3 && username.length <= 20;
  }

  // 生成用户推荐码
  generateReferralCode(user: User): string {
    const prefix = user.getName().substring(0, 2).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomSuffix}`;
  }
}
```

### 2.5 领域事件（Domain Event）

领域事件表示业务中发生的重要事件。

```typescript
// 领域事件基类
abstract class DomainEvent {
  private readonly occurredOn: Date;
  private readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = this.generateEventId();
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  getOccurredOn(): Date {
    return this.occurredOn;
  }

  getEventId(): string {
    return this.eventId;
  }
}

// 订单确认事件
class OrderConfirmedEvent extends DomainEvent {
  private readonly orderId: OrderId;
  private readonly customerId: CustomerId;
  private readonly totalAmount: Money;

  constructor(orderId: OrderId, customerId: CustomerId, totalAmount: Money) {
    super();
    this.orderId = orderId;
    this.customerId = customerId;
    this.totalAmount = totalAmount;
  }

  getOrderId(): OrderId {
    return this.orderId;
  }

  getCustomerId(): CustomerId {
    return this.customerId;
  }

  getTotalAmount(): Money {
    return this.totalAmount;
  }
}

// 用户注册事件
class UserRegisteredEvent extends DomainEvent {
  private readonly userId: UserId;
  private readonly email: Email;

  constructor(userId: UserId, email: Email) {
    super();
    this.userId = userId;
    this.email = email;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getEmail(): Email {
    return this.email;
  }
}
```

## 三、领域模型的设计原则

### 3.1 单一职责原则

每个类应该只有一个改变的理由。

```typescript
// 好的设计：职责分离
class User {
  private id: UserId;
  private name: string;
  private email: Email;

  changeName(newName: string): void {
    // 只负责用户名称变更
  }
}

class UserNotificationService {
  sendWelcomeEmail(user: User): void {
    // 只负责发送欢迎邮件
  }
}

// 不好的设计：职责混乱
class User {
  private id: UserId;
  private name: string;
  private email: Email;

  changeName(newName: string): void {
    // 用户名称变更
  }

  sendWelcomeEmail(): void {
    // 发送邮件不应该在用户实体中
  }
}
```

### 3.2 开闭原则

对扩展开放，对修改关闭。

```typescript
// 抽象策略接口
interface PaymentStrategy {
  processPayment(amount: Money): PaymentResult;
}

// 具体支付策略
class CreditCardPayment implements PaymentStrategy {
  processPayment(amount: Money): PaymentResult {
    // 信用卡支付逻辑
    return new PaymentResult(true, '支付成功');
  }
}

class AlipayPayment implements PaymentStrategy {
  processPayment(amount: Money): PaymentResult {
    // 支付宝支付逻辑
    return new PaymentResult(true, '支付成功');
  }
}

// 支付服务
class PaymentService {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processPayment(amount: Money): PaymentResult {
    return this.strategy.processPayment(amount);
  }
}
```

### 3.3 依赖倒置原则

依赖抽象而不是具体实现。

```typescript
// 抽象仓储接口
interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

// 用户服务
class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: UserId): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async createUser(name: string, email: Email): Promise<User> {
    const user = new User(UserId.generate(), name, email);
    await this.userRepository.save(user);
    return user;
  }
}

// 具体仓储实现
class DatabaseUserRepository implements UserRepository {
  async findById(id: UserId): Promise<User | null> {
    // 数据库查询逻辑
    return null;
  }

  async save(user: User): Promise<void> {
    // 数据库保存逻辑
  }

  async delete(id: UserId): Promise<void> {
    // 数据库删除逻辑
  }
}
```

## 四、领域模型的实现模式

### 4.1 工厂模式

用于创建复杂的领域对象。

```typescript
// 用户工厂
class UserFactory {
  static createUser(name: string, email: string, userType: UserType): User {
    const userId = UserId.generate();
    const emailObj = new Email(email);
    
    switch (userType) {
      case UserType.REGULAR:
        return new RegularUser(userId, name, emailObj);
      case UserType.VIP:
        return new VipUser(userId, name, emailObj);
      case UserType.ADMIN:
        return new AdminUser(userId, name, emailObj);
      default:
        throw new Error('未知的用户类型');
    }
  }

  static createUserFromData(data: UserData): User {
    return this.createUser(data.name, data.email, data.type);
  }
}

// 订单工厂
class OrderFactory {
  static createOrder(customerId: CustomerId, items: OrderItemData[]): Order {
    const orderId = OrderId.generate();
    const order = new Order(orderId, customerId);

    items.forEach(itemData => {
      const productId = new ProductId(itemData.productId);
      const unitPrice = new Money(itemData.unitPrice);
      order.addItem(productId, itemData.quantity, unitPrice);
    });

    return order;
  }
}
```

### 4.2 仓储模式

用于管理聚合的持久化。

```typescript
// 用户仓储接口
interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  findAll(): Promise<User[]>;
}

// 订单仓储接口
interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: OrderId): Promise<void>;
}

// 仓储实现
class DatabaseUserRepository implements UserRepository {
  async findById(id: UserId): Promise<User | null> {
    // 数据库查询实现
    const userData = await this.db.query('SELECT * FROM users WHERE id = ?', [id.toString()]);
    return userData ? this.mapToUser(userData) : null;
  }

  async save(user: User): Promise<void> {
    // 数据库保存实现
    const userData = this.mapToUserData(user);
    await this.db.query('INSERT INTO users VALUES (?, ?, ?)', [
      userData.id,
      userData.name,
      userData.email
    ]);
  }

  private mapToUser(data: any): User {
    return new User(
      new UserId(data.id),
      data.name,
      new Email(data.email)
    );
  }

  private mapToUserData(user: User): any {
    return {
      id: user.getId().toString(),
      name: user.getName(),
      email: user.getEmail().toString()
    };
  }
}
```

### 4.3 领域事件模式

用于处理领域事件。

```typescript
// 事件处理器接口
interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

// 订单确认事件处理器
class OrderConfirmedEventHandler implements DomainEventHandler<OrderConfirmedEvent> {
  async handle(event: OrderConfirmedEvent): Promise<void> {
    // 发送确认邮件
    await this.emailService.sendOrderConfirmation(event.getOrderId());
    
    // 更新库存
    await this.inventoryService.reserveItems(event.getOrderId());
    
    // 记录日志
    await this.logService.logOrderConfirmation(event);
  }
}

// 事件总线
class DomainEventBus {
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map();

  register<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];

    for (const handler of handlers) {
      await handler.handle(event);
    }
  }
}
```

## 五、领域模型的最佳实践

### 5.1 保持模型简单

```typescript
// 好的设计：简单清晰
class Product {
  private id: ProductId;
  private name: string;
  private price: Money;

  constructor(id: ProductId, name: string, price: Money) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  changePrice(newPrice: Money): void {
    if (newPrice.getAmount() <= 0) {
      throw new Error('价格必须大于0');
    }
    this.price = newPrice;
  }
}

// 不好的设计：过于复杂
class Product {
  private id: ProductId;
  private name: string;
  private price: Money;
  private category: Category;
  private tags: string[];
  private description: string;
  private images: string[];
  private specifications: Map<string, string>;
  private reviews: Review[];
  private inventory: Inventory;
  private discounts: Discount[];

  // 太多职责，难以维护
}
```

### 5.2 使用值对象

```typescript
// 好的设计：使用值对象
class Order {
  private totalAmount: Money;
  private shippingAddress: Address;
  private customerEmail: Email;

  constructor(totalAmount: Money, shippingAddress: Address, customerEmail: Email) {
    this.totalAmount = totalAmount;
    this.shippingAddress = shippingAddress;
    this.customerEmail = customerEmail;
  }
}

// 不好的设计：使用原始类型
class Order {
  private totalAmount: number;
  private currency: string;
  private street: string;
  private city: string;
  private postalCode: string;
  private country: string;
  private email: string;

  // 原始类型无法表达业务含义
}
```

### 5.3 封装业务规则

```typescript
// 好的设计：业务规则封装在实体中
class BankAccount {
  private balance: Money;
  private accountType: AccountType;

  withdraw(amount: Money): void {
    if (amount.getAmount() <= 0) {
      throw new Error('取款金额必须大于0');
    }

    if (this.balance.getAmount() < amount.getAmount()) {
      throw new Error('余额不足');
    }

    if (this.accountType === AccountType.SAVINGS && amount.getAmount() > 10000) {
      throw new Error('储蓄账户单次取款不能超过10000元');
    }

    this.balance = this.balance.subtract(amount);
  }
}

// 不好的设计：业务规则分散在服务中
class BankAccountService {
  withdraw(account: BankAccount, amount: Money): void {
    // 业务规则应该在实体中，而不是服务中
    if (amount.getAmount() <= 0) {
      throw new Error('取款金额必须大于0');
    }
    // ... 其他规则
  }
}
```

## 六、领域模型的测试

### 6.1 单元测试

```typescript
// 用户实体测试
describe('User', () => {
  let user: User;
  let userId: UserId;
  let email: Email;

  beforeEach(() => {
    userId = new UserId('user-123');
    email = new Email('test@example.com');
    user = new User(userId, 'John Doe', email);
  });

  describe('changeName', () => {
    it('应该能够更改用户名', () => {
      user.changeName('Jane Doe');
      expect(user.getName()).toBe('Jane Doe');
    });

    it('应该拒绝空用户名', () => {
      expect(() => {
        user.changeName('');
      }).toThrow('用户名不能为空');
    });

    it('应该拒绝只有空格用户名', () => {
      expect(() => {
        user.changeName('   ');
      }).toThrow('用户名不能为空');
    });
  });

  describe('deactivate', () => {
    it('应该能够停用用户', () => {
      user.deactivate();
      expect(user.getStatus()).toBe(UserStatus.INACTIVE);
    });
  });
});

// 订单聚合测试
describe('Order', () => {
  let order: Order;
  let customerId: CustomerId;
  let productId: ProductId;
  let unitPrice: Money;

  beforeEach(() => {
    customerId = new CustomerId('customer-123');
    productId = new ProductId('product-456');
    unitPrice = new Money(100);
    order = new Order(OrderId.generate(), customerId);
  });

  describe('addItem', () => {
    it('应该能够添加商品到订单', () => {
      order.addItem(productId, 2, unitPrice);
      
      const items = order.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].getQuantity()).toBe(2);
      expect(order.getTotalAmount().getAmount()).toBe(200);
    });

    it('应该能够增加已存在商品的数量', () => {
      order.addItem(productId, 2, unitPrice);
      order.addItem(productId, 3, unitPrice);
      
      const items = order.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].getQuantity()).toBe(5);
      expect(order.getTotalAmount().getAmount()).toBe(500);
    });
  });

  describe('confirm', () => {
    it('应该能够确认订单', () => {
      order.addItem(productId, 2, unitPrice);
      order.confirm();
      
      expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);
    });

    it('应该拒绝确认空订单', () => {
      expect(() => {
        order.confirm();
      }).toThrow('订单不能为空');
    });
  });
});
```

### 6.2 集成测试

```typescript
// 订单服务集成测试
describe('OrderService Integration', () => {
  let orderService: OrderService;
  let userRepository: UserRepository;
  let orderRepository: OrderRepository;
  let eventBus: DomainEventBus;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    orderRepository = new InMemoryOrderRepository();
    eventBus = new DomainEventBus();
    orderService = new OrderService(orderRepository, userRepository, eventBus);
  });

  it('应该能够创建和确认订单', async () => {
    // 创建用户
    const user = await userRepository.save(new User(
      UserId.generate(),
      'John Doe',
      new Email('john@example.com')
    ));

    // 创建订单
    const order = await orderService.createOrder(
      user.getId(),
      [{ productId: 'product-123', quantity: 2, unitPrice: 100 }]
    );

    // 确认订单
    await orderService.confirmOrder(order.getId());

    // 验证订单状态
    const confirmedOrder = await orderRepository.findById(order.getId());
    expect(confirmedOrder?.getStatus()).toBe(OrderStatus.CONFIRMED);
  });
});
```

## 七、总结

领域模型是软件工程中的重要概念，它帮助我们：

1. 理解业务：通过模型深入理解业务领域
2. 设计架构：基于领域模型设计系统架构
3. 实现逻辑：将业务逻辑封装在模型中
4. 测试验证：通过模型验证业务规则
5. 维护扩展：基于模型进行系统维护和扩展

### 关键要点

- 业务导向：模型应该反映真实的业务需求
- 高内聚低耦合：相关概念聚集，不同概念分离
- 封装业务规则：将业务逻辑封装在相应的对象中
- 使用值对象：用值对象表达业务概念
- 事件驱动：使用领域事件处理业务变化
- 测试驱动：通过测试验证模型正确性

领域模型是构建高质量软件系统的基础，它帮助我们创建更加清晰、可维护和可扩展的代码。

## 参考

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Domain Model](https://martinfowler.com/eaaCatalog/domainModel.html)
- [Value Objects](https://martinfowler.com/bliki/ValueObject.html)
- [Aggregate](https://martinfowler.com/bliki/Aggregate.html)
- [Domain Events](https://martinfowler.com/eaaDev/DomainEvent.html)

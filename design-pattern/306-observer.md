# 观察者模式

## 一、介绍

观察者模式是一种行为设计模式，它实现了一种订阅机制，可以在对象事件发生时通知多个 “观察” 该对象的其他对象。观察者模式中只有两个角色：**发布者**和**观察者**。它定义了一种**一对多**的依赖关系。

## 二、结构

![观察者模式结构](./assets/observer-structure.png)

1. **发布者**（Publisher）会向其他对象发送事件。事件会在发布者自身状态改变或执行特定行为后发生。发布者中维护着一个包含所有订阅者的对象，以及添加、删除和通知订阅者的方法。
2. 当新事件发生时，发送者会遍历订阅列表并调用每个订阅者对象的通知方法（该方法通常在订阅者接口中声明）。
3. **订阅者**（Subscriber）接口声明了通知接口。多数情况下，该接口仅包含一个 `update` 更新方法。该方法可以拥有多个参数，使发布者能在更新时传递事件的详细信息。
4. **具体订阅者**（Concrete Subscribers）可以执行一些操作来回应发布者的通知。所有具体订阅者类都实现了同样的接口，因此发布者不需要与具体类相耦合。
5. 订阅者通常需要一些上下文信息来正确地处理更新。因此，发布者通常会将一些上下文数据作为通知方法的参数进行传递。发布者也可将自身作为参数进行传递，使订阅者直接获取所需的数据。
6. **客户端**（Client）会分别创建发布者和订阅者对象，然后为订阅者注册发布者更新。

## 三、代码

```typescript
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

class ConcreteSubject implements Subject {
  public state: number;
  private observers: Observer[] = [];

  public attach(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      return console.log('Subject: Observer has been attached already.');
    }

    console.log('Subject: Attached an observer.');
    this.observers.push(observer);
  }

  public detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    console.log('Subject: Detached an observer.');
  }

  public notify(): void {
    console.log('Subject: Notifying observers...');
    for (const observer of this.observers) {
      observer.update(this);
    }
  }

  public someBusinessLogic(): void {
    console.log('\nSubject: I\'m doing something important.');
    this.state = Math.floor(Math.random() * (10 + 1));

    console.log(`Subject: My state has just changed to: ${this.state}`);
    this.notify();
  }
}

interface Observer {
  update(subject: Subject): void;
}

class ConcreteObserverA implements Observer {
  public update(subject: Subject): void {
    if (subject instanceof ConcreteSubject && subject.state < 3) {
      console.log('ConcreteObserverA: Reacted to the event.');
    }
  }
}

class ConcreteObserverB implements Observer {
  public update(subject: Subject): void {
    if (subject instanceof ConcreteSubject && (subject.state === 0 || subject.state >= 2)) {
      console.log('ConcreteObserverB: Reacted to the event.');
    }
  }
}

// Examples

const subject = new ConcreteSubject();

const observer1 = new ConcreteObserverA();
subject.attach(observer1);

const observer2 = new ConcreteObserverB();
subject.attach(observer2);

subject.someBusinessLogic();
subject.someBusinessLogic();

subject.detach(observer2);

subject.someBusinessLogic();
```

上面的代码，结果输出如下。

```text
Subject: Attached an observer.
Subject: Attached an observer.

Subject: I'm doing something important.
Subject: My state has just changed to: 6
Subject: Notifying observers...
ConcreteObserverB: Reacted to the event.

Subject: I'm doing something important.
Subject: My state has just changed to: 1
Subject: Notifying observers...
ConcreteObserverA: Reacted to the event.
Subject: Detached an observer.

Subject: I'm doing something important.
Subject: My state has just changed to: 5
Subject: Notifying observers...
```

## 四、特点

- 开闭原则。
- 可以在运行时建立对象之间的联系。

注意，订阅者的通知顺序是随机的。

## 五、适用场景

- 当一个对象状态的改变需要改变其他对象，或实际对象是事先未知的或动态变化的时，可使用观察者模式。
- 当应用中的一些对象必须观察其他对象时，可使用该模式。但仅能在有限时间内或特定情况下使用。

## 六、与发布/订阅的关系

### 6.1 介绍

发布/订阅（Publish–subscribe pattern）是一种**消息传递**模式，发布者不需要知道订阅者是谁，甚至也不需要知道订阅者是否存在；同样的，订阅者也不需要知道发布者是谁，以及发布者是否存在。发布/订阅模式将发布者与订阅者解耦，使得两者不需要建立直接的联系也不需要知道对方的存在。

发布/订阅模式的关键在于由一个被称为**代理**（Broker）的中间角色负责所有消息的路由和分发工作，发布者将消息发送给代理，订阅者则向代理订阅来接收感兴趣的消息。

发布/订阅模式有三个主要组成部分：**发布者**、**订阅者**和**代理**。

- 发布者（Publisher）：负责将消息发布到主题上，发布者一次只能向一个主题发送数据，发布者发布消息时也无需关心订阅者是否在线。
- 订阅者（Subscriber）：订阅者通过订阅主题接收消息，且可一次订阅多个主题。MQTT 还支持通过共享订阅的方式在多个订阅者之间实现订阅的负载均衡。
- 代理（Broker）：负责接收发布者的消息，并将消息转发至符合条件的订阅者。另外，代理也需要负责处理客户端发起的连接、断开连接、订阅、取消订阅等请求。

发布/订阅模式具有松耦合和可扩展的优点，但也存在着发布者订阅者解藕的问题。

## 6.2 代码

```typescript
interface User {
  id: number;
  name: string;
}

interface EventMap {
  'userLoggedIn': User;
}

class EventBus {
  private events: {
    [K in keyof EventMap]?: Array<(data: EventMap[K]) => void>
  } = {};

  subscribe<T extends keyof EventMap>(event: T, callback: (data: EventMap[T]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(callback);
  }

  unsubscribe<T extends keyof EventMap>(event: T, callback: (data: EventMap[T]) => void): void {
    if (this.events[event]) {
      const callbacks = this.events[event]!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  publish<T extends keyof EventMap>(event: T, data: EventMap[T]): void {
    if (this.events[event]) {
      this.events[event]!.forEach(callback => callback(data));
    }
  }
}

// Examples

const eventBus = new EventBus();

const userSubscriber = (user: User) => {
  console.log(`用户登录: ${user.name}`);
};
eventBus.subscribe('userLoggedIn', userSubscriber);
eventBus.publish('userLoggedIn', { id: 1, name: 'Alice' });
```

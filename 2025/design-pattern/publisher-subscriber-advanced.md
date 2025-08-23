# 发布订阅模式高级特性与详细应用

## 一、高级特性实现

### 1.1 异步事件处理

```typescript
// 异步事件处理器
type AsyncEventHandler<T = any> = (data: T) => Promise<void> | void;

// 事件选项
interface EventOptions {
  once?: boolean;           // 是否只执行一次
  priority?: number;        // 优先级
  timeout?: number;         // 超时时间
  retry?: number;           // 重试次数
}

// 高级事件中心
class AdvancedEventBus {
  private events = new Map<EventType, Array<{
    handler: AsyncEventHandler;
    options: EventOptions;
    id: string;
  }>>();
  private subscriptionId = 0;

  // 订阅事件
  subscribe<T>(
    event: EventType, 
    handler: AsyncEventHandler<T>, 
    options: EventOptions = {}
  ): string {
    const subscriptionId = `sub_${++this.subscriptionId}_${Date.now()}`;
    const subscriptionInfo = {
      handler,
      options: { 
        once: false, 
        priority: 0, 
        timeout: 5000, 
        retry: 0,
        ...options 
      },
      id: subscriptionId
    };

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const subscriptions = this.events.get(event)!;
    subscriptions.push(subscriptionInfo);
    
    // 按优先级排序
    subscriptions.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));

    return subscriptionId;
  }

  // 发布事件
  async publish<T>(event: EventType, data?: T): Promise<void> {
    const subscriptions = this.events.get(event);
    if (!subscriptions || subscriptions.length === 0) return;

    const promises: Promise<void>[] = [];
    const toRemove: string[] = [];

    for (const subscription of subscriptions) {
      const promise = this.executeHandler(subscription, data);
      promises.push(promise);

      if (subscription.options.once) {
        toRemove.push(subscription.id);
      }
    }

    // 移除一次性订阅
    toRemove.forEach(id => this.removeSubscription(event, id));

    // 等待所有处理器完成
    await Promise.allSettled(promises);
  }

  // 执行处理器
  private async executeHandler<T>(
    subscription: { handler: AsyncEventHandler; options: EventOptions; id: string }, 
    data?: T
  ): Promise<void> {
    const { handler, options } = subscription;
    
    let retryCount = 0;
    const maxRetries = options.retry || 0;

    while (retryCount <= maxRetries) {
      try {
        if (options.timeout) {
          await Promise.race([
            handler(data),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Handler timeout')), options.timeout)
            )
          ]);
        } else {
          await handler(data);
        }
        break; // 成功执行，跳出重试循环
      } catch (error) {
        retryCount++;
        if (retryCount > maxRetries) {
          console.error(`Error in event handler ${subscription.id} after ${maxRetries} retries:`, error);
          throw error;
        }
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }

  // 移除订阅
  private removeSubscription(event: EventType, subscriptionId: string): boolean {
    const subscriptions = this.events.get(event);
    if (!subscriptions) return false;

    const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
    if (index !== -1) {
      subscriptions.splice(index, 1);
      if (subscriptions.length === 0) {
        this.events.delete(event);
      }
      return true;
    }
    return false;
  }

  // 通过ID取消订阅
  unsubscribeById(event: EventType, subscriptionId: string): boolean {
    return this.removeSubscription(event, subscriptionId);
  }

  // 获取订阅者数量
  getSubscriberCount(event: EventType): number {
    return this.events.get(event)?.length || 0;
  }

  // 检查是否有订阅者
  hasSubscribers(event: EventType): boolean {
    return this.getSubscriberCount(event) > 0;
  }
}
```

### 1.2 事件过滤和中间件

```typescript
// 事件中间件类型
type EventMiddleware<T = any> = (
  event: EventType, 
  data: T, 
  next: () => Promise<void>
) => Promise<void>;

// 事件过滤器
type EventFilter<T = any> = (event: EventType, data: T) => boolean;

// 带中间件的事件中心
class MiddlewareEventBus extends AdvancedEventBus {
  private middlewares: EventMiddleware[] = [];
  private filters: EventFilter[] = [];

  // 添加中间件
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  // 添加过滤器
  addFilter(filter: EventFilter): void {
    this.filters.push(filter);
  }

  // 重写发布方法，支持中间件和过滤
  async publish<T>(event: EventType, data?: T): Promise<void> {
    // 应用过滤器
    for (const filter of this.filters) {
      if (!filter(event, data)) {
        console.log(`Event ${String(event)} filtered out`);
        return;
      }
    }

    // 应用中间件
    if (this.middlewares.length > 0) {
      await this.applyMiddlewares(event, data, 0);
    } else {
      await super.publish(event, data);
    }
  }

  // 应用中间件
  private async applyMiddlewares<T>(
    event: EventType, 
    data: T, 
    index: number
  ): Promise<void> {
    if (index >= this.middlewares.length) {
      await super.publish(event, data);
      return;
    }

    const middleware = this.middlewares[index];
    await middleware(event, data, () => 
      this.applyMiddlewares(event, data, index + 1)
    );
  }
}
```

### 1.3 事件持久化和重放

```typescript
// 事件记录
interface EventRecord {
  id: string;
  event: EventType;
  data: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

// 持久化事件中心
class PersistentEventBus extends MiddlewareEventBus {
  private eventHistory: EventRecord[] = [];
  private maxHistorySize: number;
  private isReplaying = false;

  constructor(maxHistorySize = 1000) {
    super();
    this.maxHistorySize = maxHistorySize;
  }

  // 重写发布方法，记录事件
  async publish<T>(event: EventType, data?: T): Promise<void> {
    if (!this.isReplaying) {
      this.recordEvent(event, data);
    }
    await super.publish(event, data);
  }

  // 记录事件
  private recordEvent<T>(event: EventType, data?: T): void {
    const record: EventRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      data,
      timestamp: Date.now(),
      metadata: {
        subscriberCount: this.getSubscriberCount(event)
      }
    };

    this.eventHistory.push(record);

    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  // 重放事件
  async replayEvents(
    filter?: (record: EventRecord) => boolean,
    fromTimestamp?: number
  ): Promise<void> {
    this.isReplaying = true;
    
    try {
      const eventsToReplay = this.eventHistory.filter(record => {
        if (fromTimestamp && record.timestamp < fromTimestamp) {
          return false;
        }
        return filter ? filter(record) : true;
      });

      for (const record of eventsToReplay) {
        await super.publish(record.event, record.data);
      }
    } finally {
      this.isReplaying = false;
    }
  }

  // 获取事件历史
  getEventHistory(): EventRecord[] {
    return [...this.eventHistory];
  }

  // 清空事件历史
  clearHistory(): void {
    this.eventHistory = [];
  }

  // 导出事件历史
  exportHistory(): string {
    return JSON.stringify(this.eventHistory, null, 2);
  }

  // 导入事件历史
  importHistory(historyJson: string): void {
    try {
      const history = JSON.parse(historyJson);
      this.eventHistory = history;
    } catch (error) {
      console.error('Failed to import event history:', error);
    }
  }
}
```

## 二、React中的高级应用

### 2.1 自定义Hook实现

```typescript
// 自定义Hook实现发布订阅
function useEventBus() {
  const eventBusRef = useRef<PersistentEventBus>(new PersistentEventBus());
  const subscriptionsRef = useRef<Set<string>>(new Set());

  const subscribe = useCallback(<T>(
    event: EventType, 
    handler: AsyncEventHandler<T>,
    options?: EventOptions
  ) => {
    const subscriptionId = eventBusRef.current.subscribe(event, handler, options);
    subscriptionsRef.current.add(subscriptionId);
    return subscriptionId;
  }, []);

  const unsubscribe = useCallback((subscriptionId: string) => {
    eventBusRef.current.unsubscribeById('*', subscriptionId);
    subscriptionsRef.current.delete(subscriptionId);
  }, []);

  const publish = useCallback(<T>(
    event: EventType, 
    data?: T
  ) => {
    return eventBusRef.current.publish(event, data);
  }, []);

  // 组件卸载时清理订阅
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(subscriptionId => {
        eventBusRef.current.unsubscribeById('*', subscriptionId);
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  return { subscribe, unsubscribe, publish, eventBus: eventBusRef.current };
}

// 使用示例
const ChatComponent: React.FC = () => {
  const { subscribe, publish } = useEventBus();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // 订阅新消息
    const messageSubscription = subscribe('chat:new-message', async (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // 订阅输入状态
    const typingSubscription = subscribe('chat:typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== 'current-user') {
        setIsTyping(data.isTyping);
      }
    });

    // 订阅消息已读
    const readSubscription = subscribe('chat:message-read', (messageId: string) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    });

    return () => {
      unsubscribe(messageSubscription);
      unsubscribe(typingSubscription);
      unsubscribe(readSubscription);
    };
  }, [subscribe, unsubscribe]);

  const sendMessage = async (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      userId: 'current-user'
    };

    // 发布新消息事件
    await publish('chat:new-message', message);
    
    // 发布输入状态事件
    publish('chat:typing', { userId: 'current-user', isTyping: false });
  };

  const handleTyping = (isTyping: boolean) => {
    publish('chat:typing', { userId: 'current-user', isTyping });
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.userId === 'current-user' ? 'own' : ''}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Someone is typing...</div>}
      </div>
      <input 
        onKeyPress={() => handleTyping(true)}
        onBlur={() => handleTyping(false)}
        placeholder="Type a message..."
      />
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  );
};
```

### 2.2 状态管理集成

```typescript
// 基于发布订阅的状态管理
class EventBasedStore<T> {
  private state: T;
  private eventBus: PersistentEventBus;
  private subscribers = new Set<(state: T) => void>();

  constructor(initialState: T) {
    this.state = initialState;
    this.eventBus = new PersistentEventBus();
    
    // 订阅状态变更事件
    this.eventBus.subscribe('state:changed', (newState: T) => {
      this.state = newState;
      this.notifySubscribers();
    });
  }

  // 获取状态
  getState(): T {
    return this.state;
  }

  // 更新状态
  setState(updater: (state: T) => T): void {
    const newState = updater(this.state);
    this.eventBus.publish('state:changed', newState);
  }

  // 订阅状态变化
  subscribe(callback: (state: T) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // 通知订阅者
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    });
  }

  // 获取事件总线
  getEventBus(): PersistentEventBus {
    return this.eventBus;
  }
}

// 使用示例
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

const appStore = new EventBasedStore<AppState>({
  user: null,
  theme: 'light',
  notifications: []
});

// React Hook
function useEventStore<T>(store: EventBasedStore<T>): [T, (updater: (state: T) => T) => void] {
  const [state, setState] = useState<T>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, [store]);

  const updateState = useCallback((updater: (state: T) => T) => {
    store.setState(updater);
  }, [store]);

  return [state, updateState];
}

// 在组件中使用
const App: React.FC = () => {
  const [state, setState] = useEventStore(appStore);

  const login = (user: User) => {
    setState(prev => ({ ...prev, user }));
    // 发布登录事件
    appStore.getEventBus().publish('user:logged-in', user);
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  return (
    <div className={`app ${state.theme}`}>
      {state.user ? (
        <div>
          <p>Welcome, {state.user.name}!</p>
          <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
      ) : (
        <button onClick={() => login({ id: '1', name: 'John' })}>Login</button>
      )}
    </div>
  );
};
```

## 三、实际应用场景详解

### 3.1 微前端通信

```typescript
// 微前端事件总线
class MicroFrontendEventBus extends PersistentEventBus {
  private appId: string;
  private parentWindow: Window | null = null;

  constructor(appId: string) {
    super();
    this.appId = appId;
    this.setupCrossWindowCommunication();
  }

  // 设置跨窗口通信
  private setupCrossWindowCommunication(): void {
    if (window.parent !== window) {
      this.parentWindow = window.parent;
      
      // 监听来自父窗口的消息
      window.addEventListener('message', (event) => {
        if (event.data.type === 'micro-frontend-event') {
          const { eventName, data, sourceAppId } = event.data;
          if (sourceAppId !== this.appId) {
            this.publish(eventName, data);
          }
        }
      });
    }
  }

  // 重写发布方法，支持跨窗口通信
  async publish<T>(event: EventType, data?: T): Promise<void> {
    await super.publish(event, data);

    // 向父窗口发送消息
    if (this.parentWindow) {
      this.parentWindow.postMessage({
        type: 'micro-frontend-event',
        eventName: event,
        data,
        sourceAppId: this.appId
      }, '*');
    }
  }

  // 向特定应用发送事件
  publishToApp<T>(appId: string, event: EventType, data?: T): void {
    if (this.parentWindow) {
      this.parentWindow.postMessage({
        type: 'micro-frontend-event',
        eventName: event,
        data,
        sourceAppId: this.appId,
        targetAppId: appId
      }, '*');
    }
  }
}

// 使用示例
const appEventBus = new MicroFrontendEventBus('user-app');

// 订阅全局事件
appEventBus.subscribe('user:selected', (user: User) => {
  console.log('User selected in another app:', user);
});

// 发布事件到其他应用
appEventBus.publishToApp('order-app', 'order:created', { orderId: '123' });
```

### 3.2 实时协作系统

```typescript
// 协作事件类型
interface CollaborationEvent {
  type: 'cursor-move' | 'text-change' | 'selection-change' | 'user-join' | 'user-leave';
  userId: string;
  timestamp: number;
  data: any;
}

// 协作事件总线
class CollaborationEventBus extends PersistentEventBus {
  private userId: string;
  private roomId: string;
  private websocket: WebSocket | null = null;

  constructor(userId: string, roomId: string) {
    super();
    this.userId = userId;
    this.roomId = roomId;
    this.setupWebSocket();
  }

  // 设置WebSocket连接
  private setupWebSocket(): void {
    this.websocket = new WebSocket(`ws://localhost:8080/room/${this.roomId}`);
    
    this.websocket.onmessage = (event) => {
      const collaborationEvent: CollaborationEvent = JSON.parse(event.data);
      if (collaborationEvent.userId !== this.userId) {
        this.publish(collaborationEvent.type, collaborationEvent);
      }
    };
  }

  // 重写发布方法，支持实时同步
  async publish<T>(event: EventType, data?: T): Promise<void> {
    await super.publish(event, data);

    // 发送到WebSocket
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const collaborationEvent: CollaborationEvent = {
        type: event as any,
        userId: this.userId,
        timestamp: Date.now(),
        data
      };
      this.websocket.send(JSON.stringify(collaborationEvent));
    }
  }

  // 获取房间用户列表
  async getRoomUsers(): Promise<string[]> {
    // 实现获取房间用户列表的逻辑
    return [];
  }
}

// 使用示例
const collaborationBus = new CollaborationEventBus('user-123', 'room-456');

// 订阅其他用户的鼠标移动
collaborationBus.subscribe('cursor-move', (event: CollaborationEvent) => {
  updateRemoteCursor(event.userId, event.data.position);
});

// 订阅文本变更
collaborationBus.subscribe('text-change', (event: CollaborationEvent) => {
  applyRemoteChange(event.data.change);
});

// 发布本地变更
collaborationBus.publish('text-change', {
  change: { type: 'insert', position: 10, text: 'Hello' }
});
```

## 四、性能优化和最佳实践

### 4.1 内存泄漏防护

```typescript
// 防内存泄漏的事件总线
class MemorySafeEventBus extends PersistentEventBus {
  private weakSubscriptions = new WeakMap<object, Set<string>>();
  private cleanupTimers = new Map<string, NodeJS.Timeout>();

  // 带自动清理的订阅
  subscribeWithAutoCleanup<T>(
    event: EventType,
    handler: AsyncEventHandler<T>,
    context: object,
    options: EventOptions & { autoCleanupMs?: number } = {}
  ): string {
    const subscriptionId = this.subscribe(event, handler, options);

    // 记录订阅关系
    if (!this.weakSubscriptions.has(context)) {
      this.weakSubscriptions.set(context, new Set());
    }
    this.weakSubscriptions.get(context)!.add(subscriptionId);

    // 设置自动清理
    if (options.autoCleanupMs) {
      const timer = setTimeout(() => {
        this.unsubscribeById(event, subscriptionId);
        this.cleanupTimers.delete(subscriptionId);
      }, options.autoCleanupMs);
      this.cleanupTimers.set(subscriptionId, timer);
    }

    return subscriptionId;
  }

  // 清理上下文相关的订阅
  cleanupContext(context: object): void {
    const subscriptions = this.weakSubscriptions.get(context);
    if (subscriptions) {
      subscriptions.forEach(subscriptionId => {
        this.unsubscribeById('*', subscriptionId);
        
        // 清除定时器
        const timer = this.cleanupTimers.get(subscriptionId);
        if (timer) {
          clearTimeout(timer);
          this.cleanupTimers.delete(subscriptionId);
        }
      });
      this.weakSubscriptions.delete(context);
    }
  }

  // 获取内存使用情况
  getMemoryUsage(): {
    eventCount: number;
    subscriptionCount: number;
    historySize: number;
    weakMapSize: number;
  } {
    let totalSubscriptions = 0;
    this.events.forEach(subscriptions => {
      totalSubscriptions += subscriptions.length;
    });

    return {
      eventCount: this.events.size,
      subscriptionCount: totalSubscriptions,
      historySize: this.getEventHistory().length,
      weakMapSize: this.weakSubscriptions.size
    };
  }
}
```

### 4.2 批量处理优化

```typescript
// 批量处理事件总线
class BatchEventBus extends MemorySafeEventBus {
  private batchQueue: Array<{ event: EventType; data: any; timestamp: number }> = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private batchDelay: number;

  constructor(batchDelay = 16) { // 默认16ms，约60fps
    super();
    this.batchDelay = batchDelay;
  }

  // 批量发布
  batchPublish<T>(event: EventType, data?: T): void {
    this.batchQueue.push({ event, data, timestamp: Date.now() });

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchDelay);
    }
  }

  // 处理批量事件
  private async processBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    // 按事件类型分组
    const eventGroups = new Map<EventType, any[]>();
    batch.forEach(({ event, data }) => {
      if (!eventGroups.has(event)) {
        eventGroups.set(event, []);
      }
      eventGroups.get(event)!.push(data);
    });

    // 批量发布
    for (const [event, dataArray] of eventGroups) {
      await super.publish(event, dataArray);
    }
  }

  // 立即处理所有待处理的事件
  flush(): Promise<void> {
    return this.processBatch();
  }
}
```

<!-- ## 五、总结

发布订阅模式的高级特性包括：

1. **异步处理**：支持Promise和async/await
2. **事件过滤**：通过中间件和过滤器控制事件流
3. **持久化**：事件历史记录和重放功能
4. **跨窗口通信**：支持微前端架构
5. **实时协作**：WebSocket集成
6. **内存安全**：自动清理和内存泄漏防护
7. **批量处理**：性能优化

这些高级特性使得发布订阅模式能够适应更复杂的应用场景，提供更好的性能和用户体验。  -->
# React 事件系统深度解析 - 基于源码的详细分析

## 目录

1. [概述与架构](#概述与架构)
2. [事件系统初始化](#事件系统初始化)
3. [合成事件的创建与标准化](#合成事件的创建与标准化)
4. [事件委托机制](#事件委托机制)
5. [事件优先级系统](#事件优先级系统)
6. [事件处理生命周期](#事件处理生命周期)
7. [特殊事件处理](#特殊事件处理)
8. [性能优化机制](#性能优化机制)
9. [源码实现细节](#源码实现细节)

## 概述与架构

React 的事件系统是一个复杂而精密的合成事件系统，它不仅仅是对原生 DOM 事件的简单封装，而是一个完整的事件处理架构。

### 核心设计原则

1. **统一性**: 提供跨浏览器的一致性 API
2. **性能**: 通过事件委托和批处理优化性能
3. **可控性**: 与 React 的更新机制深度集成
4. **扩展性**: 支持插件化的事件处理

### 架构组件

```javascript
// React 事件系统的核心组件架构
const EventSystem = {
  // 事件注册表
  EventRegistry: {
    allNativeEvents: Set<DOMEventName>,
    registrationNameDependencies: Map<string, Array<DOMEventName>>,
    topLevelEventsToReactNames: Map<DOMEventName, string>
  },
  
  // 事件插件系统
  EventPlugins: [
    SimpleEventPlugin,      // 处理大部分标准事件
    EnterLeaveEventPlugin,  // 处理 mouseenter/mouseleave
    ChangeEventPlugin,      // 处理复杂的 change 事件
    SelectEventPlugin,      // 处理 select 事件
    BeforeInputEventPlugin, // 处理输入前事件
    FormActionEventPlugin   // 处理表单动作事件
  ],
  
  // 合成事件构造器
  SyntheticEvents: {
    SyntheticEvent,
    SyntheticKeyboardEvent,
    SyntheticMouseEvent,
    SyntheticFocusEvent,
    SyntheticTouchEvent,
    // ... 更多特定类型的合成事件
  },
  
  // 事件分发器
  EventDispatcher: {
    dispatchEvent,
    dispatchEventForPluginEventSystem,
    processDispatchQueue
  }
};
```

## 事件系统初始化

### 1. 事件注册表的构建

React 在模块加载时就开始构建事件注册表，这个过程包括：

```javascript
// react/packages/react-dom-bindings/src/events/EventRegistry.js

// 全局事件注册表
export const allNativeEvents: Set<DOMEventName> = new Set();

// React 事件名到原生事件名的映射
export const registrationNameDependencies: {
  [registrationName: string]: Array<DOMEventName>,
} = {};

// 原生事件名到 React 事件名的映射
export const topLevelEventsToReactNames: Map<DOMEventName, string> = new Map();

// 注册双阶段事件（捕获 + 冒泡）
export function registerTwoPhaseEvent(
  registrationName: string,
  dependencies: Array<DOMEventName>,
): void {
  // 注册冒泡阶段
  registerDirectEvent(registrationName, dependencies);
  // 注册捕获阶段
  registerDirectEvent(registrationName + 'Capture', dependencies);
}

// 注册直接事件
export function registerDirectEvent(
  registrationName: string,
  dependencies: Array<DOMEventName>,
) {
  // 建立 React 事件名到原生事件名的映射
  registrationNameDependencies[registrationName] = dependencies;
  
  // 将所有依赖的原生事件添加到全局集合
  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]);
  }
}
```

### 2. 事件插件的注册过程

每个事件插件都有自己的注册逻辑：

```javascript
// react/packages/react-dom-bindings/src/events/plugins/SimpleEventPlugin.js

// 简单事件插件支持的所有事件类型
const simpleEventPluginEvents = [
  'abort', 'auxClick', 'cancel', 'canPlay', 'canPlayThrough', 'click',
  'close', 'contextMenu', 'copy', 'cut', 'drag', 'dragEnd', 'dragEnter',
  'dragExit', 'dragLeave', 'dragOver', 'dragStart', 'drop', 'durationChange',
  'emptied', 'encrypted', 'ended', 'error', 'gotPointerCapture', 'input',
  'invalid', 'keyDown', 'keyPress', 'keyUp', 'load', 'loadedData',
  'loadedMetadata', 'loadStart', 'lostPointerCapture', 'mouseDown',
  'mouseMove', 'mouseOut', 'mouseOver', 'mouseUp', 'paste', 'pause',
  'play', 'playing', 'pointerCancel', 'pointerDown', 'pointerMove',
  'pointerOut', 'pointerOver', 'pointerUp', 'progress', 'rateChange',
  'reset', 'resize', 'seeked', 'seeking', 'stalled', 'submit', 'suspend',
  'timeUpdate', 'touchCancel', 'touchEnd', 'touchStart', 'volumeChange',
  'scroll', 'toggle', 'touchMove', 'waiting', 'wheel',
];

// 注册简单事件的函数
function registerSimpleEvent(domEventName: DOMEventName, reactName: string) {
  // 建立原生事件名到 React 事件名的映射
  topLevelEventsToReactNames.set(domEventName, reactName);
  // 注册双阶段事件
  registerTwoPhaseEvent(reactName, [domEventName]);
}

// SimpleEventPlugin 的注册方法
export function registerSimpleEvents() {
  // 批量注册标准事件
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = ((simpleEventPluginEvents[i]: any): string);
    const domEventName = ((eventName.toLowerCase(): any): DOMEventName);
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
    registerSimpleEvent(domEventName, 'on' + capitalizedEvent);
  }

  // 注册特殊映射的事件
  registerSimpleEvent(ANIMATION_END, 'onAnimationEnd');
  registerSimpleEvent(ANIMATION_ITERATION, 'onAnimationIteration');
  registerSimpleEvent(ANIMATION_START, 'onAnimationStart');
  registerSimpleEvent('dblclick', 'onDoubleClick');
  registerSimpleEvent('focusin', 'onFocus');
  registerSimpleEvent('focusout', 'onBlur');
  registerSimpleEvent(TRANSITION_RUN, 'onTransitionRun');
  registerSimpleEvent(TRANSITION_START, 'onTransitionStart');
  registerSimpleEvent(TRANSITION_CANCEL, 'onTransitionCancel');
  registerSimpleEvent(TRANSITION_END, 'onTransitionEnd');
}
```

### 3. 复杂事件插件的注册

以 `ChangeEventPlugin` 为例，它处理复杂的 change 事件：

```javascript
// react/packages/react-dom-bindings/src/events/plugins/ChangeEventPlugin.js

function registerEvents() {
  // onChange 事件依赖多个原生事件
  registerTwoPhaseEvent('onChange', [
    'change',
    'click',
    'focusin',
    'focusout',
    'input',
    'keydown',
    'keyup',
    'selectionchange',
  ]);
}

// 这意味着当任何一个依赖事件触发时，都可能产生 onChange 合成事件
```

## 合成事件的创建与标准化

### 1. 合成事件构造器工厂

React 使用工厂模式创建不同类型的合成事件：

```javascript
// react/packages/react-dom-bindings/src/events/SyntheticEvent.js

// 事件接口定义
const EventInterface = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: function (event: {[propName: string]: mixed}) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: 0,
  isTrusted: 0,
};

// 创建合成事件构造器的工厂函数
function createSyntheticEvent(Interface: EventInterfaceType) {
  // 合成事件构造函数
  function SyntheticBaseEvent(
    reactName: string | null,
    reactEventType: string,
    targetInst: Fiber | null,
    nativeEvent: {[propName: string]: mixed, ...},
    nativeEventTarget: null | EventTarget,
  ) {
    this._reactName = reactName;
    this._targetInst = targetInst;
    this.type = reactEventType;
    this.nativeEvent = nativeEvent;
    this.target = nativeEventTarget;
    this.currentTarget = null;

    // 复制和标准化事件属性
    for (const propName in Interface) {
      if (!Interface.hasOwnProperty(propName)) {
        continue;
      }
      const normalize = Interface[propName];
      if (normalize) {
        // 使用标准化函数处理属性
        this[propName] = normalize(nativeEvent);
      } else {
        // 直接复制属性
        this[propName] = nativeEvent[propName];
      }
    }

    // 处理默认阻止状态
    const defaultPrevented =
      nativeEvent.defaultPrevented != null
        ? nativeEvent.defaultPrevented
        : nativeEvent.returnValue === false;
    
    this.isDefaultPrevented = defaultPrevented 
      ? functionThatReturnsTrue 
      : functionThatReturnsFalse;
    this.isPropagationStopped = functionThatReturnsFalse;
    
    return this;
  }

  // 添加原型方法
  assign(SyntheticBaseEvent.prototype, {
    preventDefault: function () {
      this.defaultPrevented = true;
      const event = this.nativeEvent;
      if (!event) {
        return;
      }

      // 调用原生事件的 preventDefault
      if (event.preventDefault) {
        event.preventDefault();
      } else if (typeof event.returnValue !== 'unknown') {
        // IE 兼容性处理
        event.returnValue = false;
      }
      this.isDefaultPrevented = functionThatReturnsTrue;
    },

    stopPropagation: function () {
      const event = this.nativeEvent;
      if (!event) {
        return;
      }

      // 调用原生事件的 stopPropagation
      if (event.stopPropagation) {
        event.stopPropagation();
      } else if (typeof event.cancelBubble !== 'unknown') {
        // IE 兼容性处理
        event.cancelBubble = true;
      }

      this.isPropagationStopped = functionThatReturnsTrue;
    },

    persist: function () {
      // React 17+ 中，事件不再被池化，这个方法变成空操作
    },

    isPersistent: functionThatReturnsTrue,
  });

  return SyntheticBaseEvent;
}

// 基础合成事件
const SyntheticEvent = createSyntheticEvent(EventInterface);
```

### 2. 键盘事件的标准化处理

键盘事件是标准化处理最复杂的例子：

```javascript
// react/packages/react-dom-bindings/src/events/getEventKey.js

// 标准化过时的键值
const normalizeKey = {
  Esc: 'Escape',
  Spacebar: ' ',
  Left: 'ArrowLeft',
  Up: 'ArrowUp',
  Right: 'ArrowRight',
  Down: 'ArrowDown',
  Del: 'Delete',
  Win: 'OS',
  Menu: 'ContextMenu',
  Apps: 'ContextMenu',
  Scroll: 'ScrollLock',
  MozPrintableKey: 'Unidentified',
};

// 从 keyCode 到标准键名的映射
const translateToKey = {
  '8': 'Backspace',
  '9': 'Tab',
  '12': 'Clear',
  '13': 'Enter',
  '16': 'Shift',
  '17': 'Control',
  '18': 'Alt',
  '19': 'Pause',
  '20': 'CapsLock',
  '27': 'Escape',
  '32': ' ',
  '33': 'PageUp',
  '34': 'PageDown',
  '35': 'End',
  '36': 'Home',
  '37': 'ArrowLeft',
  '38': 'ArrowUp',
  '39': 'ArrowRight',
  '40': 'ArrowDown',
  '45': 'Insert',
  '46': 'Delete',
  '112': 'F1', '113': 'F2', '114': 'F3', '115': 'F4',
  '116': 'F5', '117': 'F6', '118': 'F7', '119': 'F8',
  '120': 'F9', '121': 'F10', '122': 'F11', '123': 'F12',
  '144': 'NumLock',
  '145': 'ScrollLock',
  '224': 'Meta',
};

// 获取标准化的键值
function getEventKey(nativeEvent: {[propName: string]: mixed}) {
  // 如果浏览器支持 key 属性
  if (nativeEvent.key) {
    // 标准化已知的非标准键值
    const key = normalizeKey[nativeEvent.key] || nativeEvent.key;
    if (key !== 'Unidentified') {
      return key;
    }
  }

  // 为不支持 key 属性的浏览器提供 polyfill
  if (nativeEvent.type === 'keypress') {
    const charCode = getEventCharCode(nativeEvent);
    // Enter 键的特殊处理
    return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
  }

  if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
    // 使用 keyCode 映射表
    return translateToKey[nativeEvent.keyCode] || 'Unidentified';
  }

  return '';
}

// 键盘事件接口定义
const KeyboardEventInterface = {
  ...UIEventInterface,
  key: getEventKey,
  code: 0,
  location: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  repeat: 0,
  locale: 0,
  getModifierState: getEventModifierState,
  // 兼容性属性
  charCode: function (event: {[propName: string]: mixed}) {
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    return 0;
  },
  keyCode: function (event: {[propName: string]: mixed}) {
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
  which: function (event: {[propName: string]: mixed}) {
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
};

// 创建键盘合成事件
const SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
```

### 3. 鼠标事件的标准化处理

```javascript
// react/packages/react-dom-bindings/src/events/SyntheticMouseEvent.js

// 获取事件相关元素（relatedTarget）
function getEventRelatedTarget(nativeEvent) {
  const relatedTarget = nativeEvent.relatedTarget;
  if (relatedTarget === undefined) {
    // IE 兼容性处理
    return nativeEvent.fromElement === nativeEvent.srcElement
      ? nativeEvent.toElement
      : nativeEvent.fromElement;
  }
  return relatedTarget;
}

// 鼠标事件接口
const MouseEventInterface = {
  ...UIEventInterface,
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  getModifierState: getEventModifierState,
  button: 0,
  buttons: 0,
  relatedTarget: function (event) {
    if (event.relatedTarget === undefined) {
      return getEventRelatedTarget(event);
    }
    return event.relatedTarget;
  },
};

const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
```

## 事件委托机制

### 1. 根节点监听器设置

React 将所有事件监听器绑定到根容器节点：

```javascript
// react/packages/react-dom-bindings/src/events/DOMPluginEventSystem.js

// 媒体事件类型（这些事件不冒泡）
export const mediaEventTypes: Array<DOMEventName> = [
  'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied',
  'encrypted', 'ended', 'error', 'loadeddata', 'loadedmetadata',
  'loadstart', 'pause', 'play', 'playing', 'progress', 'ratechange',
  'resize', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate',
  'volumechange', 'waiting',
];

// 非委托事件（直接绑定到目标元素）
export const nonDelegatedEvents: Set<DOMEventName> = new Set([
  'beforetoggle', 'cancel', 'close', 'invalid', 'load', 'scroll', 
  'scrollend', 'toggle', ...mediaEventTypes,
]);

// 监听标记，防止重复绑定
const listeningMarker = '_reactListening' + Math.random().toString(36).slice(2);

export function listenToAllSupportedEvents(rootContainerElement: EventTarget) {
  // 检查是否已经设置过监听器
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true;
    
    // 遍历所有注册的原生事件
    allNativeEvents.forEach(domEventName => {
      // selectionchange 事件特殊处理
      if (domEventName !== 'selectionchange') {
        // 对于可委托的事件，设置冒泡阶段监听器
        if (!nonDelegatedEvents.has(domEventName)) {
          listenToNativeEvent(domEventName, false, rootContainerElement);
        }
        // 所有事件都设置捕获阶段监听器
        listenToNativeEvent(domEventName, true, rootContainerElement);
      }
    });

    // selectionchange 事件绑定到 document
    const ownerDocument =
      rootContainerElement.nodeType === DOCUMENT_NODE
        ? rootContainerElement
        : rootContainerElement.ownerDocument;
    
    if (ownerDocument !== null) {
      if (!ownerDocument[listeningMarker]) {
        ownerDocument[listeningMarker] = true;
        listenToNativeEvent('selectionchange', false, ownerDocument);
      }
    }
  }
}
```

### 2. 事件监听器的创建和绑定

```javascript
// react/packages/react-dom-bindings/src/events/DOMPluginEventSystem.js

export function listenToNativeEvent(
  domEventName: DOMEventName,
  isCapturePhaseListener: boolean,
  target: EventTarget,
): void {
  let eventSystemFlags = 0;
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }

  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener,
  );
}

function addTrappedEventListener(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  isCapturePhaseListener: boolean,
) {
  // 创建带优先级的事件监听器包装器
  let listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventSystemFlags,
  );

  // 处理被动监听器
  let isPassiveListener: void | boolean = undefined;
  if (passiveBrowserEventsSupported) {
    // 这些事件类型默认使用被动监听器以提高性能
    if (
      domEventName === 'touchstart' ||
      domEventName === 'touchmove' ||
      domEventName === 'wheel'
    ) {
      isPassiveListener = true;
    }
  }

  let unsubscribeListener;
  // 根据阶段和被动性选择绑定方式
  if (isCapturePhaseListener) {
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventCaptureListenerWithPassiveFlag(
        targetContainer,
        domEventName,
        listener,
        isPassiveListener,
      );
    } else {
      unsubscribeListener = addEventCaptureListener(
        targetContainer,
        domEventName,
        listener,
      );
    }
  } else {
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventBubbleListenerWithPassiveFlag(
        targetContainer,
        domEventName,
        listener,
        isPassiveListener,
      );
    } else {
      unsubscribeListener = addEventBubbleListener(
        targetContainer,
        domEventName,
        listener,
      );
    }
  }
}
```

### 3. 实际的 DOM 事件绑定

```javascript
// react/packages/react-dom-bindings/src/events/EventListener.js

export function addEventBubbleListener(
  target: EventTarget,
  eventType: string,
  listener: Function,
): Function {
  target.addEventListener(eventType, listener, false);
  return listener;
}

export function addEventCaptureListener(
  target: EventTarget,
  eventType: string,
  listener: Function,
): Function {
  target.addEventListener(eventType, listener, true);
  return listener;
}

export function addEventBubbleListenerWithPassiveFlag(
  target: EventTarget,
  eventType: string,
  listener: Function,
  passive: boolean,
): Function {
  target.addEventListener(eventType, listener, {
    passive,
    capture: false,
  });
  return listener;
}

export function addEventCaptureListenerWithPassiveFlag(
  target: EventTarget,
  eventType: string,
  listener: Function,
  passive: boolean,
): Function {
  target.addEventListener(eventType, listener, {
    passive,
    capture: true,
  });
  return listener;
}
```

## 事件优先级系统

### 1. 优先级定义

React 根据事件类型定义了不同的优先级：

```javascript
// react/packages/react-reconciler/src/ReactEventPriorities.js

export const NoEventPriority: EventPriority = NoLane;
export const DiscreteEventPriority: EventPriority = SyncLane;
export const ContinuousEventPriority: EventPriority = InputContinuousLane;
export const DefaultEventPriority: EventPriority = DefaultLane;
export const IdleEventPriority: EventPriority = IdleLane;

// 获取事件优先级
export function getEventPriority(domEventName: DOMEventName): EventPriority {
  switch (domEventName) {
    // 离散事件 - 最高优先级
    case 'cancel':
    case 'click':
    case 'close':
    case 'contextmenu':
    case 'copy':
    case 'cut':
    case 'auxclick':
    case 'dblclick':
    case 'dragend':
    case 'dragstart':
    case 'drop':
    case 'focusin':
    case 'focusout':
    case 'input':
    case 'invalid':
    case 'keydown':
    case 'keypress':
    case 'keyup':
    case 'mousedown':
    case 'mouseup':
    case 'paste':
    case 'pause':
    case 'play':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'ratechange':
    case 'reset':
    case 'resize':
    case 'seeked':
    case 'submit':
    case 'touchcancel':
    case 'touchend':
    case 'touchstart':
    case 'volumechange':
      return DiscreteEventPriority;

    // 连续事件 - 中等优先级
    case 'drag':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'scroll':
    case 'toggle':
    case 'touchmove':
    case 'wheel':
    case 'mouseenter':
    case 'mouseleave':
    case 'pointerenter':
    case 'pointerleave':
      return ContinuousEventPriority;

    // 默认事件 - 低优先级
    case 'message':
      // 可能是连续的，也可能不是
      const schedulerPriority = getCurrentSchedulerPriorityLevel();
      switch (schedulerPriority) {
        case ImmediateSchedulerPriority:
          return DiscreteEventPriority;
        case UserBlockingSchedulerPriority:
          return ContinuousEventPriority;
        case NormalSchedulerPriority:
        case LowSchedulerPriority:
          return DefaultEventPriority;
        case IdleSchedulerPriority:
          return IdleEventPriority;
        default:
          return DefaultEventPriority;
      }
    default:
      return DefaultEventPriority;
  }
}
```

### 2. 优先级包装器的创建

```javascript
// react/packages/react-dom-bindings/src/events/ReactDOMEventListener.js

export function createEventListenerWrapperWithPriority(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
): Function {
  const eventPriority = getEventPriority(domEventName);
  let listenerWrapper;
  
  switch (eventPriority) {
    case DiscreteEventPriority:
      listenerWrapper = dispatchDiscreteEvent;
      break;
    case ContinuousEventPriority:
      listenerWrapper = dispatchContinuousEvent;
      break;
    case DefaultEventPriority:
    default:
      listenerWrapper = dispatchEvent;
      break;
  }
  
  return listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer,
  );
}

// 离散事件分发器
function dispatchDiscreteEvent(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  container: EventTarget,
  nativeEvent: AnyNativeEvent,
) {
  const prevTransition = ReactSharedInternals.T;
  const previousPriority = getCurrentUpdatePriority();
  
  try {
    // 设置为离散事件优先级
    ReactSharedInternals.T = null;
    setCurrentUpdatePriority(DiscreteEventPriority);
    dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    // 恢复之前的优先级
    setCurrentUpdatePriority(previousPriority);
    ReactSharedInternals.T = prevTransition;
  }
}

// 连续事件分发器
function dispatchContinuousEvent(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  container: EventTarget,
  nativeEvent: AnyNativeEvent,
) {
  const prevTransition = ReactSharedInternals.T;
  const previousPriority = getCurrentUpdatePriority();
  
  try {
    // 设置为连续事件优先级
    ReactSharedInternals.T = null;
    setCurrentUpdatePriority(ContinuousEventPriority);
    dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    // 恢复之前的优先级
    setCurrentUpdatePriority(previousPriority);
    ReactSharedInternals.T = prevTransition;
  }
}
```

## 事件处理生命周期

### 1. 事件触发到处理的完整流程

```javascript
// 完整的事件处理流程
const EventHandlingLifecycle = {
  // 1. 原生事件触发
  nativeEventTriggered: (nativeEvent) => {
    // 用户操作触发原生 DOM 事件
    // 例如：用户点击按钮
  },

  // 2. 根节点捕获事件
  rootContainerCapture: (nativeEvent) => {
    // React 在根节点捕获事件
    // 调用 dispatchEvent
  },

  // 3. 事件分发
  eventDispatch: (domEventName, eventSystemFlags, nativeEvent) => {
    // 根据优先级包装事件处理器
    // 调用相应的分发器（discrete/continuous/default）
  },

  // 4. 事件提取
  eventExtraction: (nativeEvent) => {
    // 各个插件提取合成事件
    // 创建合成事件对象
    // 收集监听器
  },

  // 5. 监听器执行
  listenerExecution: (syntheticEvent, listeners) => {
    // 按照捕获->冒泡的顺序执行监听器
    // 处理事件传播控制
  }
};
```

### 2. 事件分发的详细实现

```javascript
// react/packages/react-dom-bindings/src/events/ReactDOMEventListener.js

export function dispatchEvent(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent,
): void {
  // 检查事件系统是否启用
  if (!_enabled) {
    return;
  }

  // 获取事件目标的 Fiber 节点
  let blockedOn = findInstanceBlockingEvent(nativeEvent);
  
  if (blockedOn === null) {
    // 没有阻塞，直接分发事件
    dispatchEventForPluginEventSystem(
      domEventName,
      eventSystemFlags,
      nativeEvent,
      return_targetInst,
      targetContainer,
    );
    clearIfContinuousEvent(domEventName, nativeEvent);
    return;
  }

  // 处理连续事件的排队
  if (
    queueIfContinuousEvent(
      blockedOn,
      domEventName,
      eventSystemFlags,
      targetContainer,
      nativeEvent,
    )
  ) {
    nativeEvent.stopPropagation();
    return;
  }

  // 清理连续事件
  clearIfContinuousEvent(domEventName, nativeEvent);

  // 处理需要水合的离散事件
  if (
    eventSystemFlags & IS_CAPTURE_PHASE &&
    isDiscreteEventThatRequiresHydration(domEventName)
  ) {
    while (blockedOn !== null) {
      const fiber = getInstanceFromNode(blockedOn);
      if (fiber !== null) {
        attemptSynchronousHydration(fiber);
      }
      
      const nextBlockedOn = findInstanceBlockingEvent(nativeEvent);
      if (nextBlockedOn === null) {
        dispatchEventForPluginEventSystem(
          domEventName,
          eventSystemFlags,
          nativeEvent,
          return_targetInst,
          targetContainer,
        );
      }
      
      if (nextBlockedOn === blockedOn) {
        break;
      }
      blockedOn = nextBlockedOn;
    }
    
    if (blockedOn !== null) {
      nativeEvent.stopPropagation();
    }
    return;
  }

  // 对于不可重放的事件，在没有目标的情况下调用
  dispatchEventForPluginEventSystem(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    null,
    targetContainer,
  );
}
```

### 3. 插件系统的事件分发

```javascript
// react/packages/react-dom-bindings/src/events/DOMPluginEventSystem.js

export function dispatchEventForPluginEventSystem(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber,
  targetContainer: EventTarget,
): void {
  let ancestorInst = targetInst;

  // 只有委托事件才需要祖先节点查找
  if (
    (eventSystemFlags & IS_EVENT_HANDLE_NON_MANAGED_NODE) === 0 &&
    (eventSystemFlags & IS_NON_DELEGATED) === 0
  ) {
    const targetContainerNode = ((targetContainer: any): Node);

    // 祖先节点查找逻辑
    if (targetInst !== null) {
      let node: null | Fiber = targetInst;

      mainLoop: while (true) {
        if (node === null) {
          return;
        }
        
        const nodeTag = node.tag;
        
        // 检查是否为根节点或 Portal 节点
        if (nodeTag === HostRoot || nodeTag === HostPortal) {
          let container = node.stateNode.containerInfo;
          if (isMatchingRootContainer(container, targetContainerNode)) {
            break;
          }

          // Portal 特殊处理
          if (nodeTag === HostPortal) {
            let grandNode = node.return;
            while (grandNode !== null) {
              const grandTag = grandNode.tag;
              if (grandTag === HostRoot || grandTag === HostPortal) {
                const grandContainer = grandNode.stateNode.containerInfo;
                if (isMatchingRootContainer(grandContainer, targetContainerNode)) {
                  return;
                }
              }
              grandNode = grandNode.return;
            }
          }

          // 继续向上查找
          while (container !== null) {
            const parentNode = getClosestInstanceFromNode(container);
            if (parentNode === null) {
              return;
            }
            
            const parentTag = parentNode.tag;
            if (
              parentTag === HostComponent ||
              parentTag === HostText ||
              parentTag === HostHoistable ||
              parentTag === HostSingleton
            ) {
              node = ancestorInst = parentNode;
              continue mainLoop;
            }
            container = container.parentNode;
          }
        }
        node = node.return;
      }
    }
  }

  // 在批处理上下文中执行事件分发
  batchedUpdates(() =>
    dispatchEventsForPlugins(
      domEventName,
      eventSystemFlags,
      nativeEvent,
      ancestorInst,
      targetContainer,
    ),
  );
}
```

### 4. 监听器收集机制

```javascript
// react/packages/react-dom-bindings/src/events/DOMPluginEventSystem.js

// 双阶段监听器收集（捕获 + 冒泡）
export function accumulateTwoPhaseListeners(
  targetFiber: Fiber | null,
  reactName: string,
): Array<DispatchListener> {
  const captureName = reactName + 'Capture';
  const listeners: Array<DispatchListener> = [];
  let instance = targetFiber;

  // 从目标节点向上遍历到根节点
  while (instance !== null) {
    const {stateNode, tag} = instance;
    
    // 处理 HostComponent（如 div、button 等）
    if (
      (tag === HostComponent ||
        tag === HostHoistable ||
        tag === HostSingleton) &&
      stateNode !== null
    ) {
      const currentTarget = stateNode;

      // 收集捕获阶段监听器（添加到数组开头）
      const captureListener = getListener(instance, captureName);
      if (captureListener != null) {
        listeners.unshift(
          createDispatchListener(instance, captureListener, currentTarget),
        );
      }

      // 收集冒泡阶段监听器（添加到数组末尾）
      const bubbleListener = getListener(instance, reactName);
      if (bubbleListener != null) {
        listeners.push(
          createDispatchListener(instance, bubbleListener, currentTarget),
        );
      }
    }

    // 到达根节点时停止
    if (instance.tag === HostRoot) {
      return listeners;
    }
    instance = instance.return;
  }

  return [];
}

// 单阶段监听器收集
export function accumulateSinglePhaseListeners(
  targetFiber: Fiber | null,
  reactName: string | null,
  nativeEventType: string,
  inCapturePhase: boolean,
  accumulateTargetOnly: boolean,
  nativeEvent: AnyNativeEvent,
): Array<DispatchListener> {
  const captureName = reactName !== null ? reactName + 'Capture' : null;
  const reactEventName = inCapturePhase ? captureName : reactName;
  let listeners: Array<DispatchListener> = [];

  let instance = targetFiber;
  let lastHostComponent = null;

  // 从目标节点向上遍历
  while (instance !== null) {
    const {stateNode, tag} = instance;
    
    if (
      (tag === HostComponent ||
        tag === HostHoistable ||
        tag === HostSingleton) &&
      stateNode !== null
    ) {
      lastHostComponent = stateNode;

      // 收集标准 React 监听器
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName);
        if (listener != null) {
          listeners.push(
            createDispatchListener(instance, listener, lastHostComponent),
          );
        }
      }
    }
    
    if (accumulateTargetOnly) {
      break;
    }
    
    instance = instance.return;
  }
  
  return listeners;
}

// 创建分发监听器对象
function createDispatchListener(
  instance: null | Fiber,
  listener: Function,
  currentTarget: EventTarget,
): DispatchListener {
  return {
    instance,
    listener,
    currentTarget,
  };
}
```

### 5. 事件队列处理

```javascript
// react/packages/react-dom-bindings/src/events/DOMPluginEventSystem.js

export function processDispatchQueue(
  dispatchQueue: DispatchQueue,
  eventSystemFlags: EventSystemFlags,
): void {
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  
  for (let i = 0; i < dispatchQueue.length; i++) {
    const {event, listeners} = dispatchQueue[i];
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
  }
}

function processDispatchQueueItemsInOrder(
  event: ReactSyntheticEvent,
  dispatchListeners: Array<DispatchListener>,
  inCapturePhase: boolean,
): void {
  let previousInstance;

  if (inCapturePhase) {
    // 捕获阶段：从外到内（数组末尾到开头）
    for (let i = dispatchListeners.length - 1; i >= 0; i--) {
      const {instance, currentTarget, listener} = dispatchListeners[i];
      if (instance !== previousInstance && event.isPropagationStopped()) {
        return;
      }
      executeDispatch(event, listener, currentTarget);
      previousInstance = instance;
    }
  } else {
    // 冒泡阶段：从内到外（数组开头到末尾）
    for (let i = 0; i < dispatchListeners.length; i++) {
      const {instance, currentTarget, listener} = dispatchListeners[i];
      if (instance !== previousInstance && event.isPropagationStopped()) {
        return;
      }
      executeDispatch(event, listener, currentTarget);
      previousInstance = instance;
    }
  }
}

function executeDispatch(
  event: ReactSyntheticEvent,
  listener: Function,
  currentTarget: EventTarget,
): void {
  event.currentTarget = currentTarget;
  
  try {
    listener(event);
  } catch (error) {
    reportGlobalError(error);
  }
  
  event.currentTarget = null;
}
```

## 特殊事件处理

### 1. Change 事件的复杂处理

`ChangeEventPlugin` 是 React 事件系统中最复杂的插件之一，它需要处理不同表单元素的 change 事件：

```javascript
// react/packages/react-dom-bindings/src/events/plugins/ChangeEventPlugin.js

// 不同输入类型的 change 事件处理策略
const changeEventTypes = {
  // 文本输入框
  text: {
    dependencies: ['input', 'keydown', 'keyup'],
    extractEvents: extractEventsForInputEventPolyfill,
  },
  
  // 数字输入框
  number: {
    dependencies: ['input', 'keydown', 'keyup'],
    extractEvents: extractEventsForInputEventPolyfill,
  },
  
  // 复选框和单选按钮
  checkbox: {
    dependencies: ['click'],
    extractEvents: extractEventsForInputEventPolyfill,
  },
  
  radio: {
    dependencies: ['click'],
    extractEvents: extractEventsForInputEventPolyfill,
  },
  
  // 选择框
  select: {
    dependencies: ['focusout', 'change', 'selectionchange'],
    extractEvents: extractEventsForSelectEventPolyfill,
  },
};

function extractEvents(
  dispatchQueue: DispatchQueue,
  domEventName: DOMEventName,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
) {
  const targetNode = targetInst ? getNodeFromInstance(targetInst) : window;

  let getTargetInstFunc, handleEventFunc;
  
  // 根据目标节点类型选择处理策略
  if (shouldUseChangeEvent(targetNode)) {
    getTargetInstFunc = getTargetInstForChangeEvent;
  } else if (shouldUseClickEvent(targetNode)) {
    getTargetInstFunc = getTargetInstForClickEvent;
  } else if (shouldUseInputEvent(targetNode)) {
    getTargetInstFunc = getTargetInstForInputOrChangeEvent;
  }

  if (getTargetInstFunc) {
    const inst = getTargetInstFunc(domEventName, targetInst);
    if (inst) {
      const event = createAndAccumulateChangeEvent(
        inst,
        nativeEvent,
        nativeEventTarget,
      );
      dispatchQueue.push({event, listeners: []});
    }
  }

  // 处理输入事件的特殊逻辑
  if (handleEventFunc) {
    handleEventFunc(domEventName, targetNode, targetInst);
  }
}

// 判断是否应该使用原生 change 事件
function shouldUseChangeEvent(elem) {
  const nodeName = elem.nodeName && elem.nodeName.toLowerCase();
  return (
    nodeName === 'select' || 
    (nodeName === 'input' && elem.type === 'file')
  );
}

// 判断是否应该使用 click 事件模拟 change
function shouldUseClickEvent(elem) {
  const nodeName = elem.nodeName;
  return (
    nodeName &&
    nodeName.toLowerCase() === 'input' &&
    (elem.type === 'checkbox' || elem.type === 'radio')
  );
}

// 判断是否应该使用 input 事件模拟 change
function shouldUseInputEvent(elem) {
  const nodeName = elem.nodeName && elem.nodeName.toLowerCase();
  return (
    nodeName === 'input' &&
    (elem.type === 'text' ||
     elem.type === 'number' ||
     elem.type === 'password' ||
     elem.type === 'search' ||
     elem.type === 'tel' ||
     elem.type === 'url' ||
     elem.type === 'email')
  );
}
```

### 2. Enter/Leave 事件的模拟实现

React 需要模拟 `mouseenter` 和 `mouseleave` 事件，因为这些事件不冒泡：

```javascript
// react/packages/react-dom-bindings/src/events/plugins/EnterLeaveEventPlugin.js

function registerEvents() {
  registerDirectEvent('onMouseEnter', ['mouseout', 'mouseover']);
  registerDirectEvent('onMouseLeave', ['mouseout', 'mouseover']);
  registerDirectEvent('onPointerEnter', ['pointerout', 'pointerover']);
  registerDirectEvent('onPointerLeave', ['pointerout', 'pointerover']);
}

function extractEvents(
  dispatchQueue: DispatchQueue,
  domEventName: DOMEventName,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
): void {
  const isOverEvent = domEventName === 'mouseover' || domEventName === 'pointerover';
  const isOutEvent = domEventName === 'mouseout' || domEventName === 'pointerout';

  if (isOverEvent && nativeEvent !== null) {
    const related = nativeEvent.relatedTarget || nativeEvent.fromElement;
    if (related) {
      // 检查相关目标是否在同一个 React 树中
      if (
        getClosestInstanceFromNode(related) ||
        isContainerMarkedAsRoot(related)
      ) {
        return;
      }
    }
  }

  if (!isOutEvent && !isOverEvent) {
    return;
  }

  let win;
  if (nativeEventTarget.window === nativeEventTarget) {
    win = nativeEventTarget;
  } else {
    const doc = nativeEventTarget.ownerDocument;
    if (doc) {
      win = doc.defaultView || doc.parentWindow;
    } else {
      win = window;
    }
  }

  let from;
  let to;
  
  if (isOutEvent) {
    from = targetInst;
    const related = nativeEvent.relatedTarget || nativeEvent.toElement;
    to = related ? getClosestInstanceFromNode(related) : null;
  } else {
    from = null;
    to = targetInst;
  }

  if (from === to) {
    return;
  }

  let eventInterface, leaveEventType, enterEventType, eventTypePrefix;

  if (domEventName === 'mouseout' || domEventName === 'mouseover') {
    eventInterface = SyntheticMouseEvent;
    leaveEventType = 'onMouseLeave';
    enterEventType = 'onMouseEnter';
    eventTypePrefix = 'mouse';
  } else {
    eventInterface = SyntheticPointerEvent;
    leaveEventType = 'onPointerLeave';
    enterEventType = 'onPointerEnter';
    eventTypePrefix = 'pointer';
  }

  const fromNode = from == null ? win : getNodeFromInstance(from);
  const toNode = to == null ? win : getNodeFromInstance(to);

  const leave = new eventInterface(
    leaveEventType,
    eventTypePrefix + 'leave',
    from,
    nativeEvent,
    nativeEventTarget,
  );
  leave.target = fromNode;
  leave.relatedTarget = toNode;

  let enterReturnValue = null;

  const nativeTargetInst = getClosestInstanceFromNode(nativeEventTarget);
  if (nativeTargetInst === to) {
    const enter = new eventInterface(
      enterEventType,
      eventTypePrefix + 'enter',
      to,
      nativeEvent,
      nativeEventTarget,
    );
    enter.target = toNode;
    enter.relatedTarget = fromNode;
    enterReturnValue = enter;
  }

  accumulateEnterLeaveTwoPhaseListeners(dispatchQueue, leave, enterReturnValue, from, to);
}
```

### 3. BeforeInput 事件的处理

```javascript
// react/packages/react-dom-bindings/src/events/plugins/BeforeInputEventPlugin.js

function registerEvents() {
  registerTwoPhaseEvent('onBeforeInput', [
    'compositionend',
    'keypress',
    'textInput',
    'paste',
  ]);
}

function extractEvents(
  dispatchQueue: DispatchQueue,
  domEventName: DOMEventName,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
): void {
  let chars;

  switch (domEventName) {
    case 'keypress':
      // 只处理会产生字符的按键
      const which = nativeEvent.which;
      if (which !== SPACEBAR_CODE) {
        return;
      }
      hasSpaceKeypress = true;
      chars = SPACEBAR_CHAR;
      break;

    case 'textInput':
      // Text input 事件
      chars = nativeEvent.data;
      if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
        return;
      }
      break;

    case 'compositionend':
      // 输入法组合结束
      if (useFallbackCompositionData) {
        chars = getFallbackBeforeInputChars(domEventName, nativeEvent);
      } else {
        chars = nativeEvent.data;
      }
      break;

    case 'paste':
      // 粘贴事件
      chars = null;
      break;

    default:
      return;
  }

  if (chars) {
    const listeners = accumulateTwoPhaseListeners(targetInst, 'onBeforeInput');
    if (listeners.length > 0) {
      const event = new SyntheticInputEvent(
        'onBeforeInput',
        'beforeinput',
        null,
        nativeEvent,
        nativeEventTarget,
      );
      dispatchQueue.push({event, listeners});
      event.data = chars;
    }
  }
}
```

## 性能优化机制

### 1. 事件委托的性能优势

```javascript
// 传统方式：每个元素都绑定事件监听器
// 内存使用：O(n) - n 是元素数量
// 性能问题：大量监听器影响页面性能

function traditionalEventBinding() {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', handleClick); // 每个按钮都有监听器
  });
}

// React 方式：只在根节点绑定监听器
// 内存使用：O(1) - 固定数量的监听器
// 性能优势：减少内存占用，提高页面性能

function reactEventDelegation() {
  // 只在根容器绑定一个监听器
  rootContainer.addEventListener('click', (nativeEvent) => {
    // 通过事件冒泡机制处理所有子元素的点击事件
    const targetFiber = getClosestInstanceFromNode(nativeEvent.target);
    if (targetFiber) {
      dispatchEvent('click', eventSystemFlags, nativeEvent, targetFiber);
    }
  });
}
```

### 2. 批处理优化

```javascript
// react/packages/react-reconciler/src/ReactFiberWorkLoop.js

// 事件批处理：将多个状态更新合并为一次重新渲染
export function batchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;
  
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    // 如果没有其他工作在进行，立即刷新同步工作
    if (executionContext === NoContext) {
      resetRenderTimer();
      flushSyncCallbacks();
    }
  }
}

// 示例：批处理多个状态更新
function handleClick() {
  // 这些状态更新会被批处理为一次重新渲染
  setCount(c => c + 1);
  setFlag(f => !f);
  setData(d => [...d, newItem]);
  // 只会触发一次重新渲染，而不是三次
}
```

### 3. 事件对象复用（React 16 及之前）

```javascript
// React 16 及之前版本的事件池化机制
// 注意：React 17+ 已移除事件池化

const eventPool = [];
const EVENT_POOL_SIZE = 10;

function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
  const EventConstructor = this;
  
  if (EventConstructor.eventPool.length) {
    const instance = EventConstructor.eventPool.pop();
    EventConstructor.call(
      instance,
      dispatchConfig,
      targetInst,
      nativeEvent,
      nativeInst,
    );
    return instance;
  }
  
  return new EventConstructor(
    dispatchConfig,
    targetInst,
    nativeEvent,
    nativeInst,
  );
}

function releasePooledEvent(event) {
  const EventConstructor = this;
  
  // 重置事件对象的所有属性
  event.destructor();
  
  if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
    EventConstructor.eventPool.push(event);
  }
}

// React 17+ 移除了事件池化，因为：
// 1. 现代 JavaScript 引擎的垃圾回收已经足够高效
// 2. 事件池化增加了复杂性和潜在的 bug
// 3. 用户经常忘记调用 event.persist()
```

### 4. 优先级调度优化

```javascript
// react/packages/react-reconciler/src/ReactFiberWorkLoop.js

// 根据事件优先级调度更新
function scheduleUpdateOnFiber(
  fiber: Fiber,
  lane: Lane,
  eventTime: number,
): FiberRoot | null {
  // 检查是否有无限更新循环
  checkForNestedUpdates();

  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (root === null) {
    return null;
  }

  // 标记根节点有待处理的更新
  markRootUpdated(root, lane, eventTime);

  if (root === workInProgressRoot) {
    // 如果正在渲染这个根节点，检查是否需要中断
    if (
      deferRenderPhaseUpdateToNextBatch ||
      (executionContext & RenderContext) !== NoContext
    ) {
      // 延迟到下一个批次
      workInProgressRootUpdatedLanes = mergeLanes(
        workInProgressRootUpdatedLanes,
        lane,
      );
    } else {
      // 标记根节点被挂起
      workInProgressRootInterleavedUpdatedLanes = mergeLanes(
        workInProgressRootInterleavedUpdatedLanes,
        lane,
      );
    }
  }

  // 根据优先级决定调度策略
  if (lane === SyncLane) {
    if (
      (executionContext & LegacyUnbatchedContext) !== NoContext &&
      (executionContext & (RenderContext | CommitContext)) === NoContext
    ) {
      // 同步渲染
      performSyncWorkOnRoot(root);
    } else {
      // 调度同步回调
      ensureRootIsScheduled(root, eventTime);
      if (executionContext === NoContext) {
        resetRenderTimer();
        flushSyncCallbacks();
      }
    }
  } else {
    // 异步渲染
    ensureRootIsScheduled(root, eventTime);
  }

  return root;
}
```

## 源码实现细节

### 1. 事件系统的初始化时机

```javascript
// react/packages/react-dom/src/client/ReactDOMRoot.js

export function createRoot(
  container: Element | Document | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  // 验证容器
  if (!isValidContainer(container)) {
    throw new Error('createRoot(...): Target container is not a DOM element.');
  }

  // 创建 Fiber 根节点
  const root = createContainer(
    container,
    ConcurrentRoot,
    null,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onRecoverableError,
    transitionCallbacks,
  );

  // 标记容器为 React 根节点
  markContainerAsRoot(root.current, container);

  // 设置事件监听器 - 这是事件系统初始化的关键步骤
  const rootContainerElement = container.nodeType === COMMENT_NODE 
    ? container.parentNode 
    : container;
  
  listenToAllSupportedEvents(rootContainerElement);

  return new ReactDOMRoot(root);
}
```

### 2. Fiber 节点与事件的关联

```javascript
// react/packages/react-reconciler/src/ReactFiberHostConfig.js

// 将 Fiber 实例与 DOM 节点关联
export function precacheFiberNode(hostInst: Fiber, node: Instance): void {
  (node: any)[internalInstanceKey] = hostInst;
}

// 将当前 props 缓存到 DOM 节点
export function updateFiberProps(node: Instance, props: Props): void {
  (node: any)[internalPropsKey] = props;
}

// 从 DOM 节点获取 Fiber 实例
export function getInstanceFromNode(node: Node): Fiber | null {
  const inst = (node: any)[internalInstanceKey] || (node: any)[internalContainerInstanceKey];
  if (inst) {
    if (
      inst.tag === HostComponent ||
      inst.tag === HostText ||
      inst.tag === SuspenseComponent ||
      inst.tag === HostRoot ||
      inst.tag === HostPortal ||
      inst.tag === HostHoistable ||
      inst.tag === HostSingleton
    ) {
      return inst;
    } else {
      return null;
    }
  }
  return null;
}

// 从 DOM 节点获取当前 props
export function getFiberCurrentPropsFromNode(node: Instance): Props {
  return (node: any)[internalPropsKey] || null;
}
```

### 3. 事件监听器的获取机制

```javascript
// react/packages/react-dom-bindings/src/events/getListener.js

export default function getListener(
  inst: Fiber,
  registrationName: string,
): Function | null {
  const stateNode = inst.stateNode;
  if (stateNode === null) {
    // 工作在进行中，stateNode 还未创建
    return null;
  }

  // 从 DOM 节点获取当前的 props
  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) {
    // 工作在进行中，props 还未更新
    return null;
  }
  
  const listener = props[registrationName];
  
  // 特殊情况：阻止鼠标事件
  if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
    return null;
  }

  // 验证监听器类型
  if (listener && typeof listener !== 'function') {
    throw new Error(
      `Expected \`${registrationName}\` listener to be a function, instead got a value of \`${typeof listener}\` type.`,
    );
  }

  return listener;
}

// 检查是否应该阻止鼠标事件
function shouldPreventMouseEvent(name: string, type: string, props: Props): boolean {
  switch (name) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
    case 'onMouseEnter':
      return !!(props.disabled && isInteractiveElement(type));
    default:
      return false;
  }
}

// 判断是否为交互式元素
function isInteractiveElement(type: string): boolean {
  return (
    type === 'button' ||
    type === 'input' ||
    type === 'select' ||
    type === 'textarea'
  );
}
```

### 4. 错误处理机制

```javascript
// react/packages/react-dom-bindings/src/events/DOMPluginEventSystem.js

function reportGlobalError(error: mixed): void {
  if (typeof window !== 'undefined' && typeof window.ErrorEvent === 'function') {
    // 在浏览器环境中，使用 ErrorEvent
    const event = new window.ErrorEvent('error', {
      bubbles: false,
      cancelable: false,
      message: typeof error === 'object' && error !== null && typeof error.message === 'string'
        ? error.message
        : String(error),
      error: error,
    });

    const shouldLog = window.dispatchEvent(event);
    if (!shouldLog) {
      return;
    }
  }

  // 回退到控制台错误
  console['error'](error);
}

// 在事件执行中捕获错误
function executeDispatch(
  event: ReactSyntheticEvent,
  listener: Function,
  currentTarget: EventTarget,
): void {
  event.currentTarget = currentTarget;
  
  try {
    listener(event);
  } catch (error) {
    // 捕获并报告事件处理器中的错误
    reportGlobalError(error);
  }
  
  event.currentTarget = null;
}
```

## 实际应用示例

### 1. 基本事件处理

```javascript
// 基本的点击事件处理
function Button() {
  const handleClick = (event) => {
    console.log('Button clicked!');
    console.log('Event type:', event.type);
    console.log('Target:', event.target);
    console.log('Current target:', event.currentTarget);
  };

  return <button onClick={handleClick}>Click me</button>;
}

// React 内部处理流程：
// 1. 用户点击按钮
// 2. 原生 click 事件在根容器被捕获
// 3. React 创建 SyntheticMouseEvent
// 4. 从按钮的 Fiber 节点向上收集监听器
// 5. 执行 handleClick 函数
```

### 2. 事件传播控制

```javascript
function EventPropagationExample() {
  const handleParentClick = (event) => {
    console.log('Parent clicked');
  };

  const handleChildClick = (event) => {
    console.log('Child clicked');
    // 阻止事件冒泡
    event.stopPropagation();
  };

  return (
    <div onClick={handleParentClick}>
      <button onClick={handleChildClick}>
        Click me (won't bubble to parent)
      </button>
    </div>
  );
}
```

### 3. 捕获阶段事件处理

```javascript
function CapturePhaseExample() {
  const handleCaptureClick = (event) => {
    console.log('Captured in parent');
  };

  const handleBubbleClick = (event) => {
    console.log('Bubbled in child');
  };

  return (
    <div onClickCapture={handleCaptureClick}>
      <button onClick={handleBubbleClick}>
        Click me
      </button>
    </div>
  );
}

// 执行顺序：
// 1. "Captured in parent" (捕获阶段)
// 2. "Bubbled in child" (冒泡阶段)
```

### 4. 复杂表单事件处理

```javascript
function FormExample() {
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    // React 的 onChange 事件统一了不同输入类型的行为
    setValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // 阻止默认的表单提交行为
    console.log('Form submitted with value:', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={value} 
        onChange={handleChange}
        placeholder="Type something..."
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 调试和性能分析

### 1. 事件系统调试技巧

```javascript
// 在开发环境中启用事件调试
if (__DEV__) {
  // 监控所有合成事件
  const originalDispatchEvent = dispatchEvent;
  dispatchEvent = function(domEventName, eventSystemFlags, nativeEvent, targetInst) {
    console.group(`🎯 Event: ${domEventName}`);
    console.log('Native event:', nativeEvent);
    console.log('Target Fiber:', targetInst);
    console.log('Event flags:', eventSystemFlags);
    
    const result = originalDispatchEvent.apply(this, arguments);
    
    console.groupEnd();
    return result;
  };
}

// 检查事件监听器数量
function getEventListenerCount() {
  const root = document.querySelector('#root');
  const listeners = getEventListeners(root); // Chrome DevTools API
  console.log('Event listeners on root:', listeners);
}
```

### 2. 性能监控

```javascript
// 监控事件处理性能
function measureEventPerformance() {
  let eventCount = 0;
  let totalTime = 0;

  const originalExecuteDispatch = executeDispatch;
  executeDispatch = function(event, listener, currentTarget) {
    const startTime = performance.now();
    
    const result = originalExecuteDispatch.apply(this, arguments);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    eventCount++;
    totalTime += duration;
    
    if (duration > 16) { // 超过一帧的时间
      console.warn(`Slow event handler: ${duration.toFixed(2)}ms`, {
        event: event.type,
        target: currentTarget,
        listener: listener.name || 'anonymous'
      });
    }
    
    return result;
  };

  // 定期报告性能统计
  setInterval(() => {
    if (eventCount > 0) {
      console.log(`Event performance: ${eventCount} events, avg ${(totalTime / eventCount).toFixed(2)}ms`);
      eventCount = 0;
      totalTime = 0;
    }
  }, 5000);
}
```

## 总结

React 的事件系统是一个高度优化和复杂的系统，它通过以下关键特性提供了卓越的开发体验和性能：

### 核心优势

1. **跨浏览器兼容性**: 通过合成事件系统统一了不同浏览器的事件 API
2. **性能优化**: 事件委托减少了内存使用，批处理减少了重渲染次数
3. **开发体验**: 提供了一致的事件处理 API 和强大的调试能力
4. **与 React 深度集成**: 事件优先级与 React 的调度系统完美配合

### 设计模式

1. **工厂模式**: 用于创建不同类型的合成事件
2. **插件模式**: 通过插件系统处理不同类型的事件
3. **委托模式**: 通过事件委托优化性能
4. **观察者模式**: 事件监听器的注册和触发机制

### 性能考虑

1. **事件委托**: 减少内存占用和提高性能
2. **批处理**: 合并多个状态更新为一次重渲染
3. **优先级调度**: 根据事件类型优化用户体验
4. **懒加载**: 只在需要时创建合成事件对象

React 的事件系统展现了现代前端框架在性能优化、开发体验和架构设计方面的最佳实践，是学习和理解 React 内部机制的重要组成部分。

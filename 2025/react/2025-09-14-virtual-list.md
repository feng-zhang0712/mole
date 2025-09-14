# 虚拟列表详解

## 什么是虚拟列表？

虚拟列表（Virtual List）是一种前端性能优化技术，它只渲染用户当前可见区域内的列表项，而不是渲染整个列表的所有项目。通过动态计算可见区域，只创建和渲染必要的 DOM 元素。

虚拟列表的引入主要是为了解决同时加载大量 DOM 节点导致的页面卡顿、内存占用过高以及渲染耗时严重的问题。

## 虚拟列表实现原理

### 实现虚拟列表组件（List）

虚拟列表组件 `List` 是虚拟列表的容器组件，所有列表项目（Row Element）组件以及胶水（Sizing）组件都直接添加到 `List` 列表组件中。

```jsx
// lib/components/list/List.jsx
export function List({
  tagName = 'div',
  className,
  style,
  defaultHeight = 0,
  rowComponent,
  rowCount,
  rowSize,
  rowProps: rowPropsUnstable,
  overscanCount = 3,
  onResize,
  onRowsRendered,
  children,
  ...rest
}) {
  // ...
}
```

下面是对 `List` 组件 props 属性的分析。

- `tagName` 容器组件类型，默认为 `div`。
- `className` 类名，通过该属性控制容器组件样式。
- `style` 容器组件样式，可通过该属性覆盖默认样式。
- `defaultHeight` 容器组件默认高度，默认值为 `0px`。
- `rowComponent` 必需，列表项目组件，可通过此属性根据后台获取的数据源渲染列表项目。
- `rowCount` 必需，总列数，该属性可以通过查询接口时，由接口返回，对应于姐口中的总数据的条数。
- `rowSize` 必需，列表项目高度。对于固定高度的项目，直接设置此属性；对于不定高度的项目，要通过一定方式计算出每个项目的高度。
- `rowProps` 列表项目属性。
- `overscanCount` 额外计算的行数，这是一个缓冲属性，默认值为 3，即默认会多处理三行列表项目。
- `onResize` 容器组件尺寸变化时的回调函数。
- `onRowsRendered` 列表项目渲染完成时的回调，可通过此属性分页请求后台接口数据。
- `children` 子元素。
- `rest` 容器组件其余属性，可通过该属性覆盖默认属性。

```jsx
// lib/components/list/List.jsx
import { createElement } from 'react';

export function List() {
  // ...
  
  const sizingElement = (
    <div
      style={{
        height: getEstimatedSize(),
        width: '100%',
        zIndex: -1,
      }}
    />
  );

  return createElement(
    tagName,
    {
      ...rest,
      className,
      ref: setElement,
      style: {
        position: 'relative',
        overflowY: 'auto',
        maxHeight: '100%',
        flexGrow: 1,
        ...style,
      },
    },
    rows,
    children,
    sizingElement,
  );
}
```

容器组件通过 React 的 `createElement` 方法创建，这种方式更具有灵活性，可以方便地设置容器组件类型（`tagName`），以及传递子元素（`rows`、`children` 和 `sizingElement`）。

`sizingElement` 元素用于撑开容器组件在垂直方向的滚动条，使容器组件可以上下滚动，其高度为总项目数量与每个项目高度的乘积。

注意设置容器组件的 `overflowY: "auto"`，以使其在垂直方向可以滚动。

```jsx
// lib/components/list/List.jsx
import {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useVirtualizer } from '../../core/useVirtualizer.js';
import { arePropsEqual } from '../../utils/arePropsEqual.js';

export function List() {
  const rowProps = useMemo(
    () => rowPropsUnstable, 
    Object.values(rowPropsUnstable)
  );
  const RowComponent = useMemo(
    () => memo(rowComponent, arePropsEqual),
    [rowComponent],
  );

  const [element, setElement] = useState(null);

  const {
    getCellBounds,
    getEstimatedSize,
    startIndexOverscan, startIndexVisible,
    stopIndexOverscan, stopIndexVisible,
  } = useVirtualizer({
    containerElement: element,
    defaultContainerSize: defaultHeight,
    itemCount: rowCount,
    itemProps: rowProps,
    itemSize: rowSize,
    onResize,
    overscanCount,
  });

  useEffect(() => {
    if (startIndexOverscan >= 0 && stopIndexOverscan >= 0 && onRowsRendered) {
      onRowsRendered(
        {
          startIndex: startIndexVisible,
          stopIndex: stopIndexVisible,
        },
        {
          startIndex: startIndexOverscan,
          stopIndex: stopIndexOverscan,
        },
      );
    }
  }, [
    onRowsRendered,
    startIndexOverscan,
    startIndexVisible,
    stopIndexOverscan,
    stopIndexVisible,
  ]);

  const rows = useMemo(() => {
    if (rowCount <= 0) {
      return [];
    }

    return Array.from(
      { length: stopIndexOverscan - startIndexOverscan + 1 },
      (_, i) => {
        const index = startIndexOverscan + i;
        const bounds = getCellBounds(index);

        return (
          <RowComponent
            {...rowProps}
            key={index}
            index={index}
            style={{
              position: 'absolute',
              left: 0,
              transform: `translateY(${bounds.scrollOffset}px)`,
              height: bounds.size,
              width: '100%',
            }}
          />
        );
      },
    );
  }, [
    RowComponent,
    getCellBounds,
    rowCount,
    rowProps,
    startIndexOverscan,
    stopIndexOverscan,
  ]);

  // ...
}
```

- `rowProps` 和 `rowComponent` 使用 `useMemo` 进行了缓存处理。
- `useVirtualizer` 是一个重要的 Hook，容器滚动时，该方法计算项目开始、结束位置的坐标、每行项目的高度等。
- 列表组件开始、结束位置发生变化时，触发 `onRowsRendered` 回调事件，此时在外层，可以通过该事件的回调函数请求后台对应的分页数据。
- `rows` 根据渲染开始位置（`stopIndexOverscan`）和结束位置（`startIndexOverscan`）动态渲染出项目组件，该方法重要主要任务包括：
  - 将 `index` 传递给 `rowComponent` 属性，这样，在外层渲染项目组件时，就可以根据 `index`，从服务器返回的数据源获取对应位置的数据，进行渲染。
  - 项目组件使用绝对定位，其距离容器组件顶部的高度，没有使用 `top`，而是使用 `transform` 属性，这是性能优化方面的考虑，关于这部分，可以参考 [绝对定位 + `transform` 定位项目组件](#绝对定位--transform-定位项目组件)。

### 实现 `useVirtualizer`

`useVirtualizer` 是虚拟列表的核心 Hook 方法，下面是这个 Hook 的具体实现。

```javascript
// lib/core/useVirtualizer.js
import { useCallback, useState } from 'react';
import { useResizeObserver } from '../hooks/useResizeObserver.js';
import { shallowCompare } from '../utils/shallowCompare.js';
import { getEstimatedSize as getEstimatedSizeUtil } from './getEstimatedSize.js';
import { getStartStopIndices as getStartStopIndicesUtil } from './getStartStopIndices.js';
import { useCachedBounds } from './useCachedBounds.js';
import { useItemSize } from './useItemSize.js';

export function useVirtualizer({
  containerElement,
  containerStyle,
  defaultContainerSize = 0,
  itemCount,
  itemProps,
  itemSize: itemSizeProp,
  overscanCount,
}) {
  const [indices, setIndices] = useState({
    startIndexVisible: 0,
    stopIndexVisible: -1,
    startIndexOverscan: 0,
    stopIndexOverscan: -1,
  });

  const {
    startIndexVisible,
    startIndexOverscan,
    stopIndexVisible,
    stopIndexOverscan,
  } = {
    startIndexVisible: Math.min(itemCount - 1, indices.startIndexVisible),
    startIndexOverscan: Math.min(itemCount - 1, indices.startIndexOverscan),
    stopIndexVisible: Math.min(itemCount - 1, indices.stopIndexVisible),
    stopIndexOverscan: Math.min(itemCount - 1, indices.stopIndexOverscan),
  };

  const { height = defaultContainerSize } =
    useResizeObserver({
      defaultHeight: defaultContainerSize,
      defaultWidth: undefined,
      element: containerElement,
      mode: 'only-height',
      style: containerStyle,
    });

  const containerSize = height;

  const itemSize = useItemSize({ containerSize, itemSize: itemSizeProp });

  const cachedBounds = useCachedBounds({
    itemCount,
    itemProps,
    itemSize,
  });

  const getCellBounds = useCallback(
    (index) => cachedBounds.get(index),
    [cachedBounds],
  );

  const getEstimatedSize = useCallback(
    () =>
      getEstimatedSizeUtil({
        cachedBounds,
        itemCount,
        itemSize,
      }),
    [cachedBounds, itemCount, itemSize],
  );

  const getStartStopIndices = useCallback(
    scrollOffset => getStartStopIndicesUtil({
      cachedBounds,
      containerScrollOffset: scrollOffset,
      containerSize,
      itemCount,
      overscanCount,
    }),
    [
      cachedBounds,
      containerElement,
      containerSize,
      itemCount,
      overscanCount,
    ],
  );

  useLayoutEffect(() => {
    const scrollOffset = containerElement?.scrollTop ?? 0;

    setIndices(getStartStopIndices(scrollOffset));
  }, [containerElement, getStartStopIndices]);

  useLayoutEffect(() => {
    if (!containerElement) {
      return;
    }

    const onScroll = () => {
      setIndices(prev => {
        const { scrollTop } = containerElement;

        const next = getStartStopIndicesUtil({
          cachedBounds,
          containerScrollOffset: scrollTop,
          containerSize,
          itemCount,
          overscanCount,
        });

        if (shallowCompare(next, prev)) {
          return prev;
        }

        return next;
      });
    };

    containerElement.addEventListener('scroll', onScroll);

    return () => containerElement.removeEventListener('scroll', onScroll);
  }, [
    cachedBounds,
    containerElement,
    containerSize,
    itemCount,
    overscanCount,
  ]);

  return {
    getCellBounds,
    getEstimatedSize,
    startIndexOverscan,
    startIndexVisible,
    stopIndexOverscan,
    stopIndexVisible,
  };
}
```

下面是对这个 Hook 的分析。

- `indices` 状态用于控制开始、结束位置。其中 `startIndexVisible` 和 `stopIndexVisible` 表示可见范围，`startIndexOverscan` 和 `stopIndexOverscan` 表示加上缓冲个数（`List` 中的 `overscanCount` 属性，默认值为 3）的范围。
- 页面挂载时，在第一个 `useLayoutEffect` 中，计算出当前的可见范围。
- 在第二个 `useLayoutEffect` 中，设置容器组件的 `scroll` 监听事件，动态计算出可见范围并更新 `indices` 的当前值。`shallowCompare` 方法执行浅比较，避免不必要的渲染。
- `getEstimatedSize` 方法计算胶水组件（`List` 组件中的 `sizingElement`）高度。对于固定高度的项目，高度为项目个数与项目高度的乘积；对于动态高度的项目，高度从之前的缓存中获取。
- `getCellBounds` 从缓存中获取对应 `index` 位置的项目的高度和 `scrollOffset` 值。
- `useResizeObserver` 使用 ResizeObserver 监听页面列表容器 `List` 布局的改变，然后获取改变后的高度。

从上面的分析可以看出，`useVirtualizer` 主要执行了这些操作：

- 计算胶水组件高度。
- 监听容器组件的滚动，动态计算出可见项目的范围。
- 通过 `cachedBounds` 缓存每个项目的尺寸和边界信息。

`getStartStopIndicesUtil` 也是一个重要的方法，该方法在组件挂载和列表组件滚动时，计算项目的可见范围。下面是它的实现。

```javascript
// lib/core/getStartStopIndices.js
export function getStartStopIndices({
  cachedBounds,
  containerScrollOffset,
  containerSize,
  itemCount,
  overscanCount
}) {
  const maxIndex = itemCount - 1;

  let startIndexVisible = 0;
  let stopIndexVisible = -1;
  let startIndexOverscan = 0;
  let stopIndexOverscan = -1;
  let currentIndex = 0;

  while (currentIndex < maxIndex) {
    const bounds = cachedBounds.get(currentIndex);

    if (bounds.scrollOffset + bounds.size > containerScrollOffset) {
      break;
    }

    currentIndex++;
  }

  startIndexVisible = currentIndex;
  startIndexOverscan = Math.max(0, startIndexVisible - overscanCount);

  while (currentIndex < maxIndex) {
    const bounds = cachedBounds.get(currentIndex);

    if (
      bounds.scrollOffset + bounds.size >=
      containerScrollOffset + containerSize
    ) {
      break;
    }

    currentIndex++;
  }

  stopIndexVisible = Math.min(maxIndex, currentIndex);
  stopIndexOverscan = Math.min(itemCount - 1, stopIndexVisible + overscanCount);

  if (startIndexVisible < 0) {
    startIndexVisible = 0;
    stopIndexVisible = -1;
    startIndexOverscan = 0;
    stopIndexOverscan = -1;
  }

  return {
    startIndexVisible,
    stopIndexVisible,
    startIndexOverscan,
    stopIndexOverscan
  };
}
```

`useResizeObserver` 这个 Hook 监听列表容器的尺寸变换情况，下面是它的实现。

```javascript
// lib/hooks/useResizeObserver.js
import { useMemo, useState } from "react";

function parseNumericStyleValue(value) {
  if (value !== undefined) {
    switch (typeof value) {
      case "number": {
        return value;
      }
      case "string": {
        if (value.endsWith("px")) {
          return parseFloat(value);
        }
        break;
      }
    }
  }
}

export function useResizeObserver({
  box,
  defaultHeight,
  defaultWidth,
  disabled: disabledProp,
  element,
  mode,
  style
}) {
  const { styleHeight, styleWidth } = useMemo(
    () => ({
      styleHeight: parseNumericStyleValue(style?.height),
      styleWidth: parseNumericStyleValue(style?.width)
    }),
    [style?.height, style?.width]
  );

  const [state, setState] = useState({
    height: defaultHeight,
    width: defaultWidth
  });

  const disabled =
    disabledProp ||
    (mode === "only-height" && styleHeight !== undefined) ||
    (mode === "only-width" && styleWidth !== undefined) ||
    (styleHeight !== undefined && styleWidth !== undefined);

  UILayoutEffect(() => {
    if (element === null || disabled) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { contentRect, target } = entry;
        if (element === target) {
          setState((prevState) => {
            if (
              prevState.height === contentRect.height &&
              prevState.width === contentRect.width
            ) {
              return prevState;
            }

            return {
              height: contentRect.height,
              width: contentRect.width
            };
          });
        }
      }
    });
    resizeObserver.observe(element, { box });

    return () => resizeObserver?.unobserve(element);
  }, [box, disabled, element, styleHeight, styleWidth]);

  return useMemo(
    () => ({
      height: styleHeight ?? state.height,
      width: styleWidth ?? state.width
    }),
    [state, styleHeight, styleWidth]
  );
}
```

下面是 `getEstimatedSize` 方法的实现。

```javascript
// lib/core/getEstimatedSize.js
import { assert } from "../utils/assert.js";

export function getEstimatedSize({ cachedBounds, itemCount, itemSize }) {
  if (itemCount === 0) {
    return 0;
  } else if (typeof itemSize === "number") {
    return itemCount * itemSize;
  } else {
    const bounds = cachedBounds.get(
      cachedBounds.size === 0 ? 0 : cachedBounds.size - 1
    );
    assert(bounds !== undefined, "Unexpected bounds cache miss");

    const averageItemSize =
      (bounds.scrollOffset + bounds.size) / cachedBounds.size;

    return itemCount * averageItemSize;
  }
}
```

`useCachedBounds` 这个 Hook 是一个缓存方法，用于缓存项目的尺寸信息，下面是它的实现过程。

```javascript
// lib/core/useCachedBounds.js
import { useMemo } from "react";
import { createCachedBounds } from "./createCachedBounds.js";

export function useCachedBounds({ itemCount, itemProps, itemSize }) {
  return useMemo(
    () =>
      createCachedBounds({
        itemCount,
        itemProps,
        itemSize
      }),
    [itemCount, itemProps, itemSize]
  );
}
```

```javascript
// lib/core/createCachedBounds.js
import { assert } from '../utils/assert.js';

export function createCachedBounds({ itemCount, itemProps, itemSize }) {
  const cache = new Map();

  return {
    get(index) {
      assert(index < itemCount, `Invalid index ${index}`);

      while (cache.size - 1 < index) {
        const currentIndex = cache.size;

        let size;
        switch (typeof itemSize) {
          case 'function': {
            size = itemSize(currentIndex, itemProps);
            break;
          }
          case 'number': {
            size = itemSize;
            break;
          }
          default: {
            break;
          }
        }

        if (currentIndex === 0) {
          cache.set(currentIndex, {
            size,
            scrollOffset: 0,
          });
        } else {
          const previousRowBounds = cache.get(currentIndex - 1);
          assert(
            previousRowBounds !== undefined,
            `Unexpected bounds cache miss for index ${index}`,
          );

          cache.set(currentIndex, {
            scrollOffset:
              previousRowBounds.scrollOffset + previousRowBounds.size,
            size,
          });
        }
      }

      const bounds = cache.get(index);
      assert(
        bounds !== undefined,
        `Unexpected bounds cache miss for index ${index}`,
      );

      return bounds;
    },
    set(index, bounds) {
      cache.set(index, bounds);
    },
    get size() {
      return cache.size;
    },
  };
}
```

### 集成到业务代码中

最后将虚拟列表组件集成到业务组件中。

```jsx
// ./src/App.jsx
import React from 'react';
import { List } from '/lib/index.js';

function FixedSizeListDemo() {
  const Row = ({ index, style }) => {
    return (
      <div className="list__row" style={style}>
        Row Item
      </div>
    );
  };

  return (
    <List
      height={800}
      rowCount={50000}
      rowSize={80}
      rowComponent={Row}
    />
  );
}

export default function App() {
  return (
    <div>
      <FixedSizeListDemo />
    </div>
  );
}
```

注意，上面的虚拟列表源码省略了部分非关键代码。

## 关键点分析

### 绝对定位 + `transform` 定位项目组件

项目组件（Row Component）使用绝对定位，方便定位其顶部距离容器组件（`List`）的距离。

控制项目组件顶部距离，没有使用 `top` 而是用了 `transform` 属性，这样做是为了性能优化的考虑。

- `transform` 属性启用硬件加速，在一定程度上，能够解放 CPU 资源。
- `transform` 属性将元素提升到合成层进行处理，而 `top` 属性对元素的处理，处于布局层，后者会触发重流（Reflow），而重流是很耗费性能的。另外，`top` 属性的变化，很可能会触发其他元素的重新布局，而 `transform` 则不会。

从浏览器的渲染流程来看，他们之间的区别大致是这样。

使用 `top` 属性的渲染流程：

```text
1. DOM 解析
2. 样式计算 (Style)
3. 布局计算 (Layout) ← 重新计算所有元素位置
4. 绘制 (Paint) ← 重新绘制受影响区域
5. 合成 (Composite)
```

使用 `transform` 属性的渲染流程：

```text
1. DOM 解析
2. 样式计算 (Style)
3. 布局计算 (Layout) ← 跳过，因为 transform 不影响布局
4. 绘制 (Paint) ← 跳过，因为元素在合成层
5. 合成 (Composite) ← 直接操作合成层
```

从上面的分析可以看出，`transform` 属性带来的属性优化是显而易见的。

### 缓存不定高项目的尺寸信息

## 参考

- [react-window](https://github.com/bvaughn/react-window)

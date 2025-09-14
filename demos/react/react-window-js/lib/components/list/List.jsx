import {
  createElement,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { useVirtualizer } from '../../core/useVirtualizer.js';
import { useMemoizedObject } from '../../hooks/useMemoizedObject.js';
import { arePropsEqual } from '../../utils/arePropsEqual.js';

export function List({
  tagName = 'div',
  className,
  style,
  listRef,
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
  const rowProps = useMemoizedObject(rowPropsUnstable);
  const RowComponent = useMemo(
    () => memo(rowComponent, arePropsEqual),
    [rowComponent],
  );

  const [element, setElement] = useState(null);

  const {
    getCellBounds,
    getEstimatedSize,
    scrollToIndex,
    startIndexOverscan,
    startIndexVisible,
    stopIndexOverscan,
    stopIndexVisible,
  } = useVirtualizer({
    containerElement: element,
    defaultContainerSize: defaultHeight,
    direction: 'vertical',
    itemCount: rowCount,
    itemProps: rowProps,
    itemSize: rowSize,
    onResize,
    overscanCount,
  });

  useImperativeHandle(
    listRef,
    () => ({
      get element() {
        return element;
      },

      scrollToRow({
        align = 'auto',
        behavior = 'auto',
        index,
      }) {
        const top = scrollToIndex({
          align,
          containerScrollOffset: element?.scrollTop ?? 0,
          index,
        });

        if (typeof element?.scrollTo === 'function') {
          element.scrollTo({
            behavior,
            top,
          });
        }
      },
    }),
    [element, scrollToIndex],
  );

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
            ariaAttributes={{
              'aria-posinset': index + 1,
              'aria-setsize': rowCount,
              role: 'listitem',
            }}
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

  const sizingElement = (
    <div
      aria-hidden
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
      role: 'list',
      ...rest,
      className,
      ref: setElement,
      style: {
        position: 'relative',
        maxHeight: '100%',
        flexGrow: 1,
        overflowY: 'auto',
        ...style,
      },
    },
    rows,
    children,
    sizingElement,
  );
}

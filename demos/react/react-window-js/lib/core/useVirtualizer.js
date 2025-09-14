import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect.js';
import { useResizeObserver } from '../hooks/useResizeObserver.js';
import { useStableCallback } from '../hooks/useStableCallback.js';
import { adjustScrollOffsetForRtl } from '../utils/adjustScrollOffsetForRtl.js';
import { shallowCompare } from '../utils/shallowCompare.js';
import { getEstimatedSize as getEstimatedSizeUtil } from './getEstimatedSize.js';
import { getOffsetForIndex } from './getOffsetForIndex.js';
import { getStartStopIndices as getStartStopIndicesUtil } from './getStartStopIndices.js';
import { useCachedBounds } from './useCachedBounds.js';
import { useItemSize } from './useItemSize.js';

export function useVirtualizer({
  containerElement,
  containerStyle,
  defaultContainerSize = 0,
  direction,
  isRtl = false,
  itemCount,
  itemProps,
  itemSize: itemSizeProp,
  onResize,
  overscanCount,
}) {
  const [indices, setIndices] = useState({
    startIndexVisible: 0,
    stopIndexVisible: -1,
    startIndexOverscan: 0,
    stopIndexOverscan: -1,
  });

  // Guard against temporarily invalid indices that may occur when item count decreases
  // Cached bounds object will be re-created and a second render will restore things
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

  const { height = defaultContainerSize, width = defaultContainerSize } =
    useResizeObserver({
      defaultHeight:
        direction === 'vertical' ? defaultContainerSize : undefined,
      defaultWidth:
        direction === 'horizontal' ? defaultContainerSize : undefined,
      element: containerElement,
      mode: direction === 'vertical' ? 'only-height' : 'only-width',
      style: containerStyle,
    });

  const prevSizeRef = useRef({
    height: 0,
    width: 0,
  });

  const containerSize = direction === 'vertical' ? height : width;

  const itemSize = useItemSize({ containerSize, itemSize: itemSizeProp });

  useLayoutEffect(() => {
    if (typeof onResize === 'function') {
      const prevSize = prevSizeRef.current;

      if (prevSize.height !== height || prevSize.width !== width) {
        onResize({ height, width }, { ...prevSize });

        prevSize.height = height;
        prevSize.width = width;
      }
    }
  }, [height, onResize, width]);

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
    (scrollOffset) => {
      const containerScrollOffset = adjustScrollOffsetForRtl({
        containerElement,
        direction,
        isRtl,
        scrollOffset,
      });

      return getStartStopIndicesUtil({
        cachedBounds,
        containerScrollOffset,
        containerSize,
        itemCount,
        overscanCount,
      });
    },
    [
      cachedBounds,
      containerElement,
      containerSize,
      direction,
      isRtl,
      itemCount,
      overscanCount,
    ],
  );

  useIsomorphicLayoutEffect(() => {
    const scrollOffset =
      (direction === 'vertical'
        ? containerElement?.scrollTop
        : containerElement?.scrollLeft) ?? 0;

    setIndices(getStartStopIndices(scrollOffset));
  }, [containerElement, direction, getStartStopIndices]);

  useIsomorphicLayoutEffect(() => {
    if (!containerElement) {
      return;
    }

    const onScroll = () => {
      setIndices((prev) => {
        const { scrollLeft, scrollTop } = containerElement;

        const scrollOffset = adjustScrollOffsetForRtl({
          containerElement,
          direction,
          isRtl,
          scrollOffset: direction === 'vertical' ? scrollTop : scrollLeft,
        });

        const next = getStartStopIndicesUtil({
          cachedBounds,
          containerScrollOffset: scrollOffset,
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

    return () => {
      containerElement.removeEventListener('scroll', onScroll);
    };
  }, [
    cachedBounds,
    containerElement,
    containerSize,
    direction,
    itemCount,
    overscanCount,
  ]);

  const scrollToIndex = useStableCallback(
    ({
      align = 'auto',
      containerScrollOffset,
      index,
    }) => {
      let scrollOffset = getOffsetForIndex({
        align,
        cachedBounds,
        containerScrollOffset,
        containerSize,
        index,
        itemCount,
        itemSize,
      });

      if (containerElement) {
        scrollOffset = adjustScrollOffsetForRtl({
          containerElement,
          direction,
          isRtl,
          scrollOffset,
        });

        if (typeof containerElement.scrollTo !== 'function') {
          // Special case for environments like jsdom that don't implement scrollTo
          const next = getStartStopIndices(scrollOffset);
          if (!shallowCompare(indices, next)) {
            setIndices(next);
          }
        }

        return scrollOffset;
      }
    },
  );

  return {
    getCellBounds,
    getEstimatedSize,
    scrollToIndex,
    startIndexOverscan,
    startIndexVisible,
    stopIndexOverscan,
    stopIndexVisible,
  };
}

# React Window JS

A JavaScript port of the popular [react-window](https://github.com/bvaughn/react-window) library for efficiently rendering large lists and tabular data.

## Overview

This is a complete JavaScript conversion of the original TypeScript react-window library. It provides the same functionality and API as the original, but without TypeScript dependencies.

## Features

- **Virtual Scrolling**: Only renders visible items, dramatically improving performance
- **List Component**: Efficiently render large lists with fixed or variable row heights
- **Grid Component**: Render large grids with both horizontal and vertical scrolling
- **RTL Support**: Full right-to-left language support
- **Accessibility**: Built-in ARIA attributes for screen readers
- **Flexible Sizing**: Support for fixed sizes, percentages, and dynamic sizing functions

## Installation

```bash
npm install react-window-js
```

## Quick Start

### Fixed Size List

```javascript
import React from 'react';
import { List } from 'react-window-js';

const Row = ({ index, style }) => (
  <div style={style}>
    Row {index}
  </div>
);

const App = () => (
  <List
    height={400}
    itemCount={10000}
    itemSize={50}
    rowComponent={Row}
    rowProps={{}}
  />
);
```

### Variable Size List

```javascript
import React from 'react';
import { List } from 'react-window-js';

const Row = ({ index, style }) => (
  <div style={style}>
    Row {index}
  </div>
);

const getItemSize = (index) => 30 + (index % 10) * 10;

const App = () => (
  <List
    height={400}
    itemCount={1000}
    itemSize={getItemSize}
    rowComponent={Row}
    rowProps={{}}
  />
);
```

### Grid

```javascript
import React from 'react';
import { Grid } from 'react-window-js';

const Cell = ({ columnIndex, rowIndex, style }) => (
  <div style={style}>
    {rowIndex}, {columnIndex}
  </div>
);

const App = () => (
  <Grid
    height={400}
    width="100%"
    columnCount={100}
    rowCount={100}
    columnWidth={100}
    rowHeight={50}
    cellComponent={Cell}
    cellProps={{}}
  />
);
```

## API Reference

### List Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | number | - | Height of the list container |
| `itemCount` | number | - | Number of items to render |
| `itemSize` | number \| string \| function | - | Height of each item |
| `rowComponent` | function | - | Component to render each row |
| `rowProps` | object | - | Additional props passed to row component |
| `overscanCount` | number | 3 | Number of items to render outside visible area |
| `onRowsRendered` | function | - | Callback when visible rows change |
| `onResize` | function | - | Callback when container resizes |

### Grid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | number | - | Height of the grid container |
| `width` | number \| string | - | Width of the grid container |
| `columnCount` | number | - | Number of columns |
| `rowCount` | number | - | Number of rows |
| `columnWidth` | number \| string \| function | - | Width of each column |
| `rowHeight` | number \| string \| function | - | Height of each row |
| `cellComponent` | function | - | Component to render each cell |
| `cellProps` | object | - | Additional props passed to cell component |
| `overscanCount` | number | 3 | Number of items to render outside visible area |
| `onCellsRendered` | function | - | Callback when visible cells change |
| `onResize` | function | - | Callback when container resizes |

## Imperative API

Both List and Grid components expose imperative APIs for programmatic control:

### List Imperative API

```javascript
import { useListRef } from 'react-window-js';

const listRef = useListRef();

// Scroll to a specific row
listRef.current?.scrollToRow({
  index: 100,
  align: 'center',
  behavior: 'smooth'
});
```

### Grid Imperative API

```javascript
import { useGridRef } from 'react-window-js';

const gridRef = useGridRef();

// Scroll to a specific cell
gridRef.current?.scrollToCell({
  rowIndex: 50,
  columnIndex: 25,
  rowAlign: 'center',
  columnAlign: 'center',
  behavior: 'smooth'
});

// Scroll to a specific row
gridRef.current?.scrollToRow({
  index: 50,
  align: 'center',
  behavior: 'smooth'
});

// Scroll to a specific column
gridRef.current?.scrollToColumn({
  index: 25,
  align: 'center',
  behavior: 'smooth'
});
```

## Performance

React Window JS provides significant performance improvements for large datasets:

- **Memory Usage**: Only renders visible items, reducing memory footprint
- **Rendering Speed**: Dramatically faster initial render times
- **Scroll Performance**: Smooth scrolling even with thousands of items
- **Bundle Size**: Lightweight implementation without TypeScript overhead

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - same as the original react-window library.

## Credits

This is a JavaScript port of [react-window](https://github.com/bvaughn/react-window) by Brian Vaughn. All credit goes to the original author and contributors.

import React, { useState, useEffect, useCallback } from 'react';

const SearchPanel = ({ searchParams, onSearchChange }) => {
  const [localQuery, setLocalQuery] = useState(searchParams.query || '');
  const [localCategory, setLocalCategory] = useState(searchParams.category || '');
  const [localPriority, setLocalPriority] = useState(searchParams.priority || '');
  
  // 同步外部searchParams变化到本地状态
  useEffect(() => {
    setLocalQuery(searchParams.query || '');
    setLocalCategory(searchParams.category || '');
    setLocalPriority(searchParams.priority || '');
  }, [searchParams.query, searchParams.category, searchParams.priority]);
  
  // 处理查询变化 - 使用useCallback避免无限循环
  const handleQueryChange = useCallback((query) => {
    setLocalQuery(query);
    onSearchChange({ query });
  }, [onSearchChange]);
  
  // 处理分类变化 - 使用useCallback避免无限循环
  const handleCategoryChange = useCallback((category) => {
    setLocalCategory(category);
    onSearchChange({ category });
  }, [onSearchChange]);
  
  // 处理优先级变化 - 使用useCallback避免无限循环
  const handlePriorityChange = useCallback((priority) => {
    setLocalPriority(priority);
    onSearchChange({ priority });
  }, [onSearchChange]);
  
  // 清除所有搜索条件 - 使用useCallback避免无限循环
  const clearFilters = useCallback(() => {
    setLocalQuery('');
    setLocalCategory('');
    setLocalPriority('');
    onSearchChange({ query: '', category: '', priority: '' });
  }, [onSearchChange]);
  
  return (
    <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd' }}>
      <h3>Search & Filter</h3>
      
      {/* 文本搜索 */}
      <div style={{ marginBottom: '15px' }}>
        <label>
          Search:
          <input
            type="text"
            value={localQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search items..."
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </label>
      </div>
      
      {/* 分类过滤 */}
      <div style={{ marginBottom: '15px' }}>
        <label>
          Category:
          <select
            value={localCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="">All Categories</option>
            <option value="Category 0">Category 0</option>
            <option value="Category 1">Category 1</option>
            <option value="Category 2">Category 2</option>
            <option value="Category 3">Category 3</option>
            <option value="Category 4">Category 4</option>
          </select>
        </label>
      </div>
      
      {/* 优先级过滤 */}
      <div style={{ marginBottom: '15px' }}>
        <label>
          Priority:
          <select
            value={localPriority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="">All Priorities</option>
            <option value="0">Low (0)</option>
            <option value="1">Medium (1)</option>
            <option value="2">High (2)</option>
          </select>
        </label>
      </div>
      
      {/* 操作按钮 */}
      <div>
        <button onClick={clearFilters} style={{ marginRight: '10px' }}>
          Clear Filters
        </button>
        <span style={{ fontSize: '12px', color: '#666' }}>
          Current filters: {searchParams.query || 'none'} | {searchParams.category || 'all'} | {searchParams.priority || 'all'}
        </span>
      </div>
    </div>
  );
};

export default SearchPanel;

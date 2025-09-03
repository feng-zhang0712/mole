import React, { useState } from 'react';
import FixedHeightVirtualList from './components/FixedHeightVirtualList';
import DynamicHeightVirtualList from './components/DynamicHeightVirtualList';
import IntersectionObserverVirtualList from './components/IntersectionObserverVirtualList';
import WorkerBasedVirtualList from './components/WorkerBasedVirtualList';
import ReducerBasedVirtualList from './components/ReducerBasedVirtualList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('fixed');

  const tabs = [
    { id: 'fixed', name: '固定高度', component: FixedHeightVirtualList },
    { id: 'dynamic', name: '动态高度', component: DynamicHeightVirtualList },
    { id: 'intersection', name: 'Intersection Observer', component: IntersectionObserverVirtualList },
    { id: 'worker', name: 'Web Worker', component: WorkerBasedVirtualList },
    { id: 'reducer', name: 'useReducer', component: ReducerBasedVirtualList }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="App">
      <header className="App-header">
        <h1>虚拟列表性能对比</h1>
        <p>展示不同虚拟列表实现方式的性能和功能</p>
      </header>

      <div className="tab-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <main className="main-content">
        {ActiveComponent && (
          <ActiveComponent
            itemHeight={60}
            visibleCount={10}
            bufferSize={5}
          />
        )}
      </main>
    </div>
  );
}

export default App;

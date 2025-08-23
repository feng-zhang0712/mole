**命令模式**：撤销/重做、操作封装、历史记录

### 3.3 命令模式（Command Pattern）

**定义**：将一个请求封装为一个对象，从而可以用不同的请求对客户进行参数化。

**React中的应用**：

#### 3.3.1 撤销/重做功能

```jsx
import React, { useState, useReducer } from 'react';

// 命令接口
class Command {
  execute() {}
  undo() {}
}

// 具体命令
class AddItemCommand extends Command {
  constructor(list, item) {
    super();
    this.list = list;
    this.item = item;
  }

  execute() {
    this.list.push(this.item);
  }

  undo() {
    const index = this.list.indexOf(this.item);
    if (index > -1) {
      this.list.splice(index, 1);
    }
  }
}

// 命令管理器
class CommandManager {
  constructor() {
    this.commands = [];
    this.currentIndex = -1;
  }

  execute(command) {
    command.execute();
    this.commands.push(command);
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex >= 0) {
      this.commands[this.currentIndex].undo();
      this.currentIndex--;
    }
  }

  redo() {
    if (this.currentIndex < this.commands.length - 1) {
      this.currentIndex++;
      this.commands[this.currentIndex].execute();
    }
  }
}

// React组件中使用命令模式
const TodoList = () => {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const commandManager = useRef(new CommandManager());

  const addItem = () => {
    if (inputValue.trim()) {
      const newItem = { id: Date.now(), text: inputValue };
      const command = new AddItemCommand(items, newItem);
      commandManager.current.execute(command);
      setItems([...items]);
      setInputValue('');
    }
  };

  const undo = () => {
    commandManager.current.undo();
    setItems([...items]);
  };

  const redo = () => {
    commandManager.current.redo();
    setItems([...items]);
  };

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add new item"
      />
      <button onClick={addItem}>Add</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
};
```

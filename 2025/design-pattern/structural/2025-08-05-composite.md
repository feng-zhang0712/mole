# 组合模式

## 一、介绍

组合模式（Composite Pattern）是一种**结构型**设计模式，它将对象组合成树形结构以表示"部分-整体"的层次结构。组合模式使得用户对单个对象和组合对象的使用具有一致性。

组合模式的核心思想是，通过将对象组织成**树形结构**，使得客户端可以统一地处理单个对象和对象组合，而无需关心它们之间的差异。这样可以简化客户端代码，同时提供灵活的对象结构。

通过组合模式，可以实现树形结构的统一处理、递归操作和复杂对象的简化管理等功能。不过，使用组合模式，会增加系统的复杂性，造成类型检查困难，以及违反单一职责原则等。

组合模式中有三个参与者。

- **组件**（Component）：为组合中的对象声明接口，在适当的情况下，实现所有类共有接口的默认行为。声明一个接口用于访问和管理 Component 的子组件。
- **叶子**（Leaf）：在组合中表示叶子节点对象，叶子节点没有子节点。在组合中定义对象的行为。
- **组合**（Composite）：定义有子部件的那些部件的行为。存储子部件。在 Component 接口中实现与子部件有关的操作。

## 二、代码实现

```typescript
abstract class Component {
  protected parent: Component | null = null;

  public setParent(parent: Component | null) {
    this.parent = parent;
  }

  public getParent(): Component | null {
    return this.parent;
  }

  public add(component: Component): void {}

  public remove(component: Component): void {}

  public isComposite(): boolean {
    return false;
  }

  public abstract operation(): string;
}

class Leaf extends Component {
  public operation(): string {
    return "Leaf";
  }
}

class Composite extends Component {
  protected children: Component[] = [];

  public add(component: Component): void {
    this.children.push(component);
    component.setParent(this);
  }

  public remove(component: Component): void {
    const componentIndex = this.children.indexOf(component);
    this.children.splice(componentIndex, 1);
    component.setParent(null);
  }

  public isComposite(): boolean {
    return true;
  }

  public operation(): string {
    const results: string[] = [];
    for (const child of this.children) {
      results.push(child.operation());
    }

    return `Branch(${results.join("+")})`;
  }
}
```

下面是一个示例代码。

```typescript
function clientCode(component: Component) {
  console.log(`RESULT: ${component.operation()}`);
}

function clientCode2(component1: Component, component2: Component) {
  if (component1.isComposite()) {
    component1.add(component2);
  }
  console.log(`RESULT: ${component1.operation()}`);
}

const tree = new Composite();
const branch1 = new Composite();
branch1.add(new Leaf());
branch1.add(new Leaf());
const branch2 = new Composite();
branch2.add(new Leaf());
tree.add(branch1);
tree.add(branch2);

console.log("Client: Now I've got a composite tree:");
clientCode(tree);
console.log("");

console.log("Client: I don't need to check the components classes even when managing the tree:");
clientCode2(tree, new Leaf());
```

## 三、React 中的组合模式应用

### 3.1 React 组件树 - 组件组合

React 的组件树本身就是组合模式的典型应用，组件可以包含子组件，形成树形结构。

```jsx
interface ComponentProps {
  children?: React.ReactNode;
}

const Layout: React.FC<ComponentProps> = ({ children }) => {
  return <div className="layout">{children}</div>;
};

const Header: React.FC<ComponentProps> = ({ children }) => {
  return <header className="header">{children}</header>;
};

const Main: React.FC<ComponentProps> = ({ children }) => {
  return <main className="main">{children}</main>;
};

const Sidebar: React.FC<ComponentProps> = ({ children }) => {
  return <aside className="sidebar">{children}</aside>;
};
```

下面是示例代码。

```jsx
const App: React.FC = () => {
  return (
    <Layout>
      <Header>
        <h1>My App</h1>
        <nav>Navigation</nav>
      </Header>
      <Main>
        <Sidebar>
          <ul>
            <li>Menu Item 1</li>
            <li>Menu Item 2</li>
          </ul>
        </Sidebar>
        <div className="content">
          <h2>Main Content</h2>
          <p>This is the main content area.</p>
        </div>
      </Main>
    </Layout>
  );
};
```

### 3.2 表单组件组合 - 表单元素组合

表单组件可以通过组合模式构建复杂的表单结构。

```jsx
interface FormComponentProps {
  children?: React.ReactNode;
  onSubmit?: (data: any) => void;
}

const Input: React.FC<{ name: string; placeholder?: string }> = ({ name, placeholder }) => {
  return <input name={name} placeholder={placeholder} />;
};

const Button: React.FC<{ type: 'submit' | 'button'; children: React.ReactNode }> = ({ type, children }) => {
  return <button type={type}>{children}</button>;
};

const FormGroup: React.FC<ComponentProps> = ({ children }) => {
  return <div className="form-group">{children}</div>;
};

const Form: React.FC<FormComponentProps> = ({ children, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSubmit?.(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      {children}
    </form>
  );
};
```

下面是示例代码。

```jsx
const ContactForm: React.FC = () => {
  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <label>Name:</label>
        <Input name="name" placeholder="Enter your name" />
      </FormGroup>
      <FormGroup>
        <label>Email:</label>
        <Input name="email" placeholder="Enter your email" />
      </FormGroup>
      <FormGroup>
        <label>Message:</label>
        <textarea name="message" placeholder="Enter your message" />
      </FormGroup>
      <FormGroup>
        <Button type="submit">Submit</Button>
        <Button type="button">Cancel</Button>
      </FormGroup>
    </Form>
  );
};
```

### 3.3 菜单组件组合 - 菜单项组合

菜单组件可以通过组合模式构建多级菜单结构。

```jsx
interface MenuComponentProps {
  children?: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuComponentProps> = ({ label, onClick }) => {
  return (
    <li className="menu-item" onClick={onClick}>
      {label}
    </li>
  );
};

const SubMenu: React.FC<MenuComponentProps> = ({ label, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="submenu">
      <div className="submenu-header" onClick={() => setIsOpen(!isOpen)}>
        {label}
        <span className="arrow">{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && <ul className="submenu-items">{children}</ul>}
    </li>
  );
};

const Menu: React.FC<ComponentProps> = ({ children }) => {
  return <ul className="menu">{children}</ul>;
};
```

下面是示例代码。

```jsx
const NavigationMenu: React.FC = () => {
  return (
    <Menu>
      <MenuItem label="Home" onClick={() => console.log('Navigate to Home')} />
      <SubMenu label="Products">
        <MenuItem label="Electronics" onClick={() => console.log('Navigate to Electronics')} />
        <MenuItem label="Clothing" onClick={() => console.log('Navigate to Clothing')} />
        <SubMenu label="Books">
          <MenuItem label="Fiction" onClick={() => console.log('Navigate to Fiction')} />
          <MenuItem label="Non-Fiction" onClick={() => console.log('Navigate to Non-Fiction')} />
        </SubMenu>
      </SubMenu>
      <MenuItem label="About" onClick={() => console.log('Navigate to About')} />
      <MenuItem label="Contact" onClick={() => console.log('Navigate to Contact')} />
    </Menu>
  );
};
```

### 3.4 数据展示组件组合 - 数据元素组合

数据展示组件可以通过组合模式构建复杂的数据展示结构。

```jsx
interface DataComponentProps {
  children?: React.ReactNode;
  data?: any;
}

const DataField: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
  return (
    <div className="data-field">
      <span className="label">{label}:</span>
      <span className="value">{value}</span>
    </div>
  );
};

const DataListItem: React.FC<{ item: any }> = ({ item }) => {
  return (
    <li className="data-list-item">
      {Object.entries(item).map(([key, value]) => (
        <DataField key={key} label={key} value={value as string} />
      ))}
    </li>
  );
};

const DataList: React.FC<DataComponentProps> = ({ data }) => {
  return (
    <ul className="data-list">
      {data?.map((item: any, index: number) => (
        <DataListItem key={index} item={item} />
      ))}
    </ul>
  );
};

const DataTable: React.FC<DataComponentProps> = ({ children }) => {
  return <table className="data-table">{children}</table>;
};

const TableRow: React.FC<DataComponentProps> = ({ children }) => {
  return <tr className="table-row">{children}</tr>;
};

const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <td className="table-cell">{children}</td>;
};
```

下面是示例代码。

```jsx
const UserDataDisplay: React.FC = () => {
  const userData = [
    { name: 'John', age: 30, email: 'john@example.com' },
    { name: 'Jane', age: 25, email: 'jane@example.com' },
  ];

  return (
    <Container>
      <DataTable>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Age</TableCell>
          <TableCell>Email</TableCell>
        </TableRow>
        {userData.map((user, index) => (
          <TableRow key={index}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.age}</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </Container>
  );
};
```

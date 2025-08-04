# 组合模式

## 一、介绍

组合模式（Composite Pattern）是一种**结构型**设计模式，它将对象组合成树形结构以表示"部分-整体"的层次结构。组合模式使得用户对单个对象和组合对象的使用具有一致性。

组合模式的核心思想是，通过将对象组织成**树形结构**，使得客户端可以统一地处理单个对象和对象组合，而无需关心它们之间的差异。这样可以简化客户端代码，同时提供灵活的对象结构。

通过组合模式，可以实现树形结构的统一处理、递归操作和复杂对象的简化管理等功能。不过，使用组合模式，会增加系统的复杂性，造成类型检查困难，以及违反单一职责原则等。

组合模式中有三个参与者。

- **组件**（Component）：为组合中的对象声明接口，在适当的情况下，实现所有类共有接口的默认行为。声明一个接口用于访问和管理 Component 的子组件。
- **叶子**（Leaf）：在组合中表示叶子节点对象，叶子节点没有子节点。在组合中定义对象的行为。
- **组合**（Composite）：定义有子部件的那些部件的行为。存储子部件。在 Component 接口中实现与子部件有关的操作。

## 二、伪代码实现

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

```typescript
// 抽象组件接口
interface ComponentProps {
  children?: React.ReactNode;
}

// 叶子组件
const LeafComponent: React.FC<ComponentProps> = ({ children }) => {
  return <div className="leaf">{children}</div>;
};

// 组合组件
const CompositeComponent: React.FC<ComponentProps> = ({ children }) => {
  return <div className="composite">{children}</div>;
};

// 使用组合模式构建组件树
const App: React.FC = () => {
  return (
    <CompositeComponent>
      <LeafComponent>Leaf 1</LeafComponent>
      <CompositeComponent>
        <LeafComponent>Leaf 2</LeafComponent>
        <LeafComponent>Leaf 3</LeafComponent>
      </CompositeComponent>
      <LeafComponent>Leaf 4</LeafComponent>
    </CompositeComponent>
  );
};
```

下面是示例代码。

```typescript
// 更复杂的组件组合示例
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

```typescript
// 抽象表单组件
interface FormComponentProps {
  children?: React.ReactNode;
  onSubmit?: (data: any) => void;
}

// 叶子组件 - 输入框
const Input: React.FC<{ name: string; placeholder?: string }> = ({ name, placeholder }) => {
  return <input name={name} placeholder={placeholder} />;
};

// 叶子组件 - 按钮
const Button: React.FC<{ type: 'submit' | 'button'; children: React.ReactNode }> = ({ type, children }) => {
  return <button type={type}>{children}</button>;
};

// 组合组件 - 表单组
const FormGroup: React.FC<ComponentProps> = ({ children }) => {
  return <div className="form-group">{children}</div>;
};

// 组合组件 - 表单
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

```typescript
// 使用组合模式构建表单
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

```typescript
// 抽象菜单组件
interface MenuComponentProps {
  children?: React.ReactNode;
  label: string;
  onClick?: () => void;
}

// 叶子组件 - 菜单项
const MenuItem: React.FC<MenuComponentProps> = ({ label, onClick }) => {
  return (
    <li className="menu-item" onClick={onClick}>
      {label}
    </li>
  );
};

// 组合组件 - 子菜单
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

// 组合组件 - 主菜单
const Menu: React.FC<ComponentProps> = ({ children }) => {
  return <ul className="menu">{children}</ul>;
};
```

下面是示例代码。

```typescript
// 使用组合模式构建多级菜单
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

### 3.4 卡片组件组合 - 卡片内容组合

卡片组件可以通过组合模式构建复杂的卡片布局。

```typescript
// 抽象卡片组件
interface CardComponentProps {
  children?: React.ReactNode;
  className?: string;
}

// 叶子组件 - 卡片标题
const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h3 className="card-title">{children}</h3>;
};

// 叶子组件 - 卡片内容
const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="card-content">{children}</div>;
};

// 叶子组件 - 卡片操作
const CardActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="card-actions">{children}</div>;
};

// 组合组件 - 卡片
const Card: React.FC<CardComponentProps> = ({ children, className }) => {
  return <div className={`card ${className || ''}`}>{children}</div>;
};
```

下面是示例代码。

```typescript
// 使用组合模式构建卡片
const ProductCard: React.FC = () => {
  return (
    <Card className="product-card">
      <CardTitle>Product Name</CardTitle>
      <CardContent>
        <p>This is a description of the product.</p>
        <p>Price: $99.99</p>
      </CardContent>
      <CardActions>
        <button>Add to Cart</button>
        <button>View Details</button>
      </CardActions>
    </Card>
  );
};

const UserCard: React.FC = () => {
  return (
    <Card className="user-card">
      <CardTitle>John Doe</CardTitle>
      <CardContent>
        <p>Email: john@example.com</p>
        <p>Role: Developer</p>
      </CardContent>
      <CardActions>
        <button>Edit</button>
        <button>Delete</button>
      </CardActions>
    </Card>
  );
};
```

### 3.5 布局组件组合 - 布局元素组合

布局组件可以通过组合模式构建复杂的页面布局。

```typescript
// 抽象布局组件
interface LayoutComponentProps {
  children?: React.ReactNode;
  className?: string;
}

// 叶子组件 - 文本
const Text: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <span className="text">{children}</span>;
};

// 叶子组件 - 图片
const Image: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return <img src={src} alt={alt} className="image" />;
};

// 组合组件 - 容器
const Container: React.FC<LayoutComponentProps> = ({ children, className }) => {
  return <div className={`container ${className || ''}`}>{children}</div>;
};

// 组合组件 - 行
const Row: React.FC<LayoutComponentProps> = ({ children, className }) => {
  return <div className={`row ${className || ''}`}>{children}</div>;
};

// 组合组件 - 列
const Column: React.FC<LayoutComponentProps> = ({ children, className }) => {
  return <div className={`column ${className || ''}`}>{children}</div>;
};
```

下面是示例代码。

```typescript
// 使用组合模式构建布局
const PageLayout: React.FC = () => {
  return (
    <Container className="page">
      <Row className="header">
        <Column>
          <Text>Logo</Text>
        </Column>
        <Column>
          <Text>Navigation</Text>
        </Column>
      </Row>
      <Row className="main">
        <Column className="sidebar">
          <Text>Sidebar Content</Text>
        </Column>
        <Column className="content">
          <Text>Main Content</Text>
          <Image src="/image.jpg" alt="Content Image" />
        </Column>
      </Row>
      <Row className="footer">
        <Column>
          <Text>Footer Content</Text>
        </Column>
      </Row>
    </Container>
  );
};
```

### 3.6 数据展示组件组合 - 数据元素组合

数据展示组件可以通过组合模式构建复杂的数据展示结构。

```typescript
// 抽象数据组件
interface DataComponentProps {
  children?: React.ReactNode;
  data?: any;
}

// 叶子组件 - 数据字段
const DataField: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
  return (
    <div className="data-field">
      <span className="label">{label}:</span>
      <span className="value">{value}</span>
    </div>
  );
};

// 叶子组件 - 数据列表项
const DataListItem: React.FC<{ item: any }> = ({ item }) => {
  return (
    <li className="data-list-item">
      {Object.entries(item).map(([key, value]) => (
        <DataField key={key} label={key} value={value as string} />
      ))}
    </li>
  );
};

// 组合组件 - 数据列表
const DataList: React.FC<DataComponentProps> = ({ data }) => {
  return (
    <ul className="data-list">
      {data?.map((item: any, index: number) => (
        <DataListItem key={index} item={item} />
      ))}
    </ul>
  );
};

// 组合组件 - 数据表格
const DataTable: React.FC<DataComponentProps> = ({ children }) => {
  return <table className="data-table">{children}</table>;
};

// 组合组件 - 表格行
const TableRow: React.FC<DataComponentProps> = ({ children }) => {
  return <tr className="table-row">{children}</tr>;
};

// 组合组件 - 表格单元格
const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <td className="table-cell">{children}</td>;
};
```

下面是示例代码。

```typescript
// 使用组合模式构建数据展示
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

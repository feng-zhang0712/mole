**外观模式**：API服务封装、复杂系统简化

### 2.5 外观模式（Facade Pattern）

**定义**：为子系统中的一组接口提供一个一致的界面。

**React中的应用**：

#### 2.5.1 API服务外观

```jsx
// API服务外观
class APIService {
  constructor() {
    this.baseURL = 'https://api.example.com';
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// 用户服务外观
class UserService {
  constructor(apiService) {
    this.api = apiService;
  }

  async getUsers() {
    return this.api.get('/users');
  }

  async createUser(userData) {
    return this.api.post('/users', userData);
  }
}

// 在React组件中使用
const UserList = () => {
  const [users, setUsers] = useState([]);
  const apiService = new APIService();
  const userService = new UserService(apiService);

  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
};
```


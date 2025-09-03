const TOTAL_COUNT = 50_000;

const generateUsers = (start, count) => {
  const users = [];

  for (let i = start; i < start + count; i++) {
    users.push({
      id: i + 1,
      name: `用户${i + 1}`,
      email: `user${i + 1}@example.com`,
      department: ['技术部', '产品部', '设计部', '运营部'][i % 4],
      joinDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1).toISOString().split('T')[0]
    });
  }
  
  return users;
};

// 模拟网络延迟
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const apiService = {
  async getTotalCount() {
    await delay(100 + Math.random() * 200);
    return TOTAL_COUNT;
  },

  // 获取分页数据
  async getData(start, count) {
    await delay(200 + Math.random() * 300);
    
    const data = generateUsers(start, count);

    return {
      totalCount: TOTAL_COUNT,
      data,
      count: data.length,
      start
    };
  },

  async searchData(query, start, count) {
    await delay(300 + Math.random() * 400);
    
    const allData = generateUsers(0, 100);

    const filteredData = allData.filter(({ name, email }) => {
      const searchText = query.toLowerCase();
      return name.toLowerCase().includes(searchText) || email.toLowerCase().includes(searchText);
    });

    return {
      totalCount: filteredData.length,
      data: filteredData.slice(start, start + count),
      count: Math.min(count, filteredData.length - start),
      start,
    };
  }
};

export default apiService;

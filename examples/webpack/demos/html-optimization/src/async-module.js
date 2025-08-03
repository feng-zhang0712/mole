// 异步模块示例
// 这个模块会被单独打包成一个chunk

const asyncData = {
  message: '这是从异步模块加载的数据',
  timestamp: new Date().toISOString(),
  features: [
    '代码分割',
    '按需加载',
    '性能优化',
    '缓存策略'
  ]
};

// 模拟一些计算密集型操作
function performHeavyCalculation() {
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.random();
  }
  return result;
}

// 模拟API调用
async function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: '异步数据',
        value: performHeavyCalculation()
      });
    }, 1000);
  });
}

// 导出默认数据
export default asyncData;

// 导出其他功能
export { fetchData, performHeavyCalculation };

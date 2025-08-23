// 下面代码的运行结果是什么？

const asyncFunc = async () => {
  console.log('asyncFunc start');

  setTimeout(() => {
    console.log('asyncFunc timer')
  }, 2000)

  await new Promise(_ => {
    console.log('asyncFunc promise')
  })

  console.log('asyncFunc end')
  return 'asyncFunc success'
}

console.log('start');
asyncFunc().then(res => console.log(res));
console.log('end');

Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .catch(4)
  .then(res => console.log(res))

setTimeout(() => {
  console.log('timer')
}, 1000);

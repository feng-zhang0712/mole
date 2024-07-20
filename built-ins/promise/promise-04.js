// 下面代码的输出是什么？

async function asyncFunc1() {
  console.log('asyncFunc1 start');
  return 'asyncFunc1';
}

async function asyncFunc2() {
  console.log('asyncFunc2 start');
  return Promise.resolve('asyncFunc2');
}

async function asyncFunc() {
  console.log('asyncFunc start');
  const asyncFunc1Res = await asyncFunc1();
  console.log(asyncFunc1Res);
  const asyncFunc2Res = await asyncFunc2();
  console.log(asyncFunc2Res);
  console.log(asyncFunc1Res, asyncFunc2Res);
}

asyncFunc();

const promise = new Promise(resolve => {
  console.log('Promise start');
  resolve('Promise');
});

promise.then(res => console.log(res));

console.log('end');

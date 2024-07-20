// 下面代码的输出是什么？

async function async1 () {
  try {
    await Promise.reject('error!!!')
  } catch(e) {
    console.log(e)
  }
  console.log('async1');
  return Promise.resolve('async1 success')
}

async1().then(res => console.log(res))
console.log('script start')

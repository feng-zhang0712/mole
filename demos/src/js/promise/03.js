function resolveAfter2Seconds() {
  console.log("开始较慢兑现的 promise");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("slow");
      console.log("较慢兑现的 promise 完成了");
    }, 2000);
  });
}

function resolveAfter1Second() {
  console.log("开始较快兑现的 promise");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("fast");
      console.log("较快兑现的 promise 完成了");
    }, 1000);
  });
}

async function sequentialStart() {
  console.log("== sequentialStart 开始 ==");

  // 1. 启动一个计时器，并在计时器完成后打印结果
  const slow = resolveAfter2Seconds();
  console.log(await slow);

  // 2. 等待前一个计时器完成后，启动下一个计时器
  const fast = resolveAfter1Second();
  console.log(await fast);

  console.log("== sequentialStart 结束 ==");
}

async function sequentialWait() {
  console.log("== sequentialWait 开始 ==");

  // 1. 启动两个计时器，互不等待
  const slow = resolveAfter2Seconds();
  const fast = resolveAfter1Second();

  // 2. 等待较慢的计时器完成后，打印结果
  console.log(await slow);
  // 3. 等待较快的计时器完成后，打印结果
  console.log(await fast);

  console.log("== sequentialWait 结束 ==");
}

async function concurrent1() {
  console.log("== concurrent1 开始 ==");

  // 1. 并发启动两个计时器，并等待它们完成
  const results = await Promise.all([
    resolveAfter2Seconds(),
    resolveAfter1Second(),
  ]);
  // 2. 同时打印两个计时器的结果
  console.log(results[0]);
  console.log(results[1]);

  console.log("== concurrent1 完成 ==");
}

async function concurrent2() {
  console.log("== concurrent2 开始 ==");

  // 1. 并发启动两个计时器，并在其中任意一个完成后立即打印对应结果
  await Promise.all([
    (async () => console.log(await resolveAfter2Seconds()))(),
    (async () => console.log(await resolveAfter1Second()))(),
  ]);
  console.log("== concurrent2 结束 ==");
}

sequentialStart(); // 2 秒后，打印“slow”，然后再过 1 秒，打印“fast”

// 等待上面的代码执行完毕
setTimeout(sequentialWait, 4000); // 2 秒后，打印“slow”，然后打印“fast”

// 再次等待
setTimeout(concurrent1, 7000); // 跟 sequentialWait 一样

// 再次等待
setTimeout(concurrent2, 10000); 


// reference: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function
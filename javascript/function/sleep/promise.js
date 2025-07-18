function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(resolve, interval);
  });
}

// - Example

async function saySomething() {
  await sleep(1000);
  console.log('Sleep using promise.');
}

saySomething();

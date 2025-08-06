import 'core-js/actual/promise';

function runTask() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('Task done!');
    }, 1000);
  });
}

runTask().then((result) => {
  console.log(result);
})

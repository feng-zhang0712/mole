function runAsync (x) {
  return new Promise(r => setTimeout(() => r(x, console.log(x)), 1000));
  p
}
function runReject (x) {
  return new Promise((res, rej) => setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x));
}

Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then(res => console.log(res))
  .catch(err => console.log(err))
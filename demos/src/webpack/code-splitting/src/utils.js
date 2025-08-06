function sum(numbers) {
  return numbers.reduce(
    (acc, cur) => acc + cur,
    0,
  );
}

module.exports = {
  sum,
};
import(/* webpackChunkName: "utils" */'./utils.js').then(m => {
  console.log(m.default.sum([1, 2, 3]));
});

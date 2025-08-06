import(
  /* webpackPreload: true */
  /* webpackChunkName: "utils" */
  './utils').then(module => {
  console.log(module.default.sum([1, 2, 3]));
});

setTimeout(() => {
  import(
    /* webpackPrefetch: true */
    /* webpackChunkName: "lodash" */
    'lodash').then(module => {
    console.log(module.default.random(1, 100));
  });
}, 5000);
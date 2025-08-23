export function sideEffectBusiness() {
  window.foo = 'bar';
  console.log('Side effect');
  document.title = 'New Title';
  fetch('/api/data');
  setTimeout(() => {}, 1000);
}


/*#__PURE__*/ console.log('Hello');
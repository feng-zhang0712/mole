import { useEffect, useState, useCallback } from 'react';

// export default function useAsyncEffect(effect, dependencies) {
//   useEffect(() => {
//     let cleanup = () => {};

//     (async () => {
//       try {
//         cleanup = await effect();
//       } catch (error) {
//         console.log('useAsyncEffect error:', error);
//       }
//     })()

//     return () => {
//       if (typeof cleanup === 'function') {
//         cleanup();
//       }
//     };
//   }, dependencies);
// }


function Person(name) {
  this.name = name;
  this.age = 18;
  this.sayName = function() {
      console.log(this.name);
  }
}
// 第二步 创建实例
var person = new Person('person')

console.log(person.__proto__ === Person.prototype); // true

function useUpdate() {
  const [, setState] = useState({});

  return useCallback(() => setState({}), []);
}

function useTimeout() {
  
}
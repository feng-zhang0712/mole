function Mixins(...mixins) {
  const Mix = class {
    constructor() {
      for (const mixin of mixins) {
        copyProperties(Mix, new mixin());
      }
    }
  }

  for (const mixin of mixins) {
    copyProperties(Mix, mixin);
    copyProperties(Mix.prototype, mixin.prototype);
  }
       

  return Mix;
}

function copyProperties(target, mixin) {
  for (const key of Reflect.ownKeys(mixin)) {
    const descriptor = Object.getOwnPropertyDescriptor(mixin, key);
    Object.defineProperty(target, key, descriptor);
  }
}

(function() {
  console.log(123);
})()

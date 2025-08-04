// 支持 Tree Shaking 的导入方式
import { add } from './utils';

console.log('add(5, 3) =', add(5, 3));

// 不支持 Tree Shaking 的导入方式
// import * as utils from './utils.js';

// 动态导入不支持 Tree Shaking。对于动态导入的模块，webpack 无法在编译时确定哪些导出会被使用，所以会保留模块中的所有导出，即使模块中有死代码，这些代码也会被保留。
setTimeout(() => {
  import('./utils.js').then(module => {
    console.log('Dynamic import - subtract(15, 7) =', module.subtract(15, 7));
  });
}, 1000); 

// 注意：multiply 和 divide 函数没有被导入，应该被 Tree Shaking 移除
// 但是有副作用的代码（console.log 和 window.baz）的处理取决于配置

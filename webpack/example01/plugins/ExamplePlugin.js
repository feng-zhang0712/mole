class ExamplePlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('ExamplePlugin', (compilation) => {
      console.log('tap');
      debugger
    })

    compiler.hooks.emit.tapAsync('ExamplePlugin', (compilation, callback) => {
      setTimeout(() => {
        console.log('tapAsync');
        callback();
      }, 2000);
    })

    compiler.hooks.emit.tapPromise('ExamplePlugin', (compilation) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('tapPromise');
          resolve();
        }, 1000);
      });
    });
  }
}

module.exports = ExamplePlugin;

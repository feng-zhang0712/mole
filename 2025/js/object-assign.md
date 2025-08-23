# `Object.assign()`

```javascript
if (!('assign' in Object)) {
  Object.prototype.assign = function(target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object.');
    }

    const to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];
      if (nextSource !== undefined && nextSource !== null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
        if (Object.getOwnPropertySymbols) {
          var syms = Object.getOwnPropertySymbols(nextSource);
          for (var j = 0; j < syms.length; j++) {
            var sym = syms[j];
            if (Object.prototype.propertyIsEnumerable.call(nextSource, sym)) {
              to[sym] = nextSource[sym];
            }
          }
        }
      }
    }
    
    return to;
  }
}
```

# Quick FAQ

## CDN 与跨域

CDN 资源同样受到同源策略的限制，只是我们通常感觉不到。

- CDN 静态资源一般通过 `<link>`、`<script>` 和 `<img>` 等标签加载，这些标签执行的简单请求，本身就能够跨域。
- CDN 请求时，如果配置了代理服务器，比如 Nginx，也可以实现跨域。
- CDN 服务器可以通过配置下面的字段，默认允许任何域名执行跨域请求。

```http
Access-Control-Allow-Origin: *
```

除了上面列出的三种标签，其他标签比如 `<video>`、`<audio>`、`<source>`、`<iframe>` 和 `<object>` 等也都可以跨域请求，并且，通过脚本动态创建的这些资源，也都可以跨域。

## `flex: 1`

`flex: 1` 是 `flex: 1 1 0%` 的简写形式，该属性让元素平均分配剩余空间，它包含三个子属性。

- `flex-grow: 1` 当容器有剩余空间时，该元素会按比例放大。
- `flex-shrink: 1;` 当容器空间不足时，该元素会按比例缩小。
- `flex-basis: 0%` 元素的基础尺寸为 0%，元素的实际尺寸完全由内容决定。

## 判断元素包含关系

- 使用 `contains()` 方法，`const isChild = parent.contains(child);`。
- 使用 `closest()` 方法，`const isChild = child.closest('#parent') !== null;`。
- 使用 `parentElement`、`parentNode` 或者 `offsetParent`属性遍历。

    ```javascript
    function isChildOf(child, parent) {
      let current = child.parentElement;
      while (current) {
        if (current === parent) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    }
    ```

- 使用 `querySelector()` 方法，`const isChildOf = (child, parentSelector) => child.matches(parentSelector + ' *');`
- 使用 `querySelector()` 方法 `const isChildOf = (child, parent) = parent.querySelector('#' + child.id) === child;`
- 利用事件冒泡检测，子元素执行 `dispatchEvent`，设置父元素的监听。

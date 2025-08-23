# 休眠的几种实现方式

```javascript
function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(resolve, interval);
  });
}
```

```javascript
await sleep(1000);
```

## 参考

- [async 函数](https://es6.ruanyifeng.com/#docs/async)，阮一峰

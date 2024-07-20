// 下面代码的运行结果是什么？

var b = 10;
(function b() {
    b = 20;
    console.log(b);
})();

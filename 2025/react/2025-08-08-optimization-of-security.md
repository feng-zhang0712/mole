# React 项目优化 - 安全

## 概述

前端项目安全主要包括 XSS（跨站脚本攻击）、CSRF（跨站请求伪造）等。

## XSS

### XSS 介绍

XSS（Cross-site scripting，跨站脚本攻击）指攻击者通过向站点注入恶意脚本，使其在站点中执行，从而执行恶意操作的行为。

跨站脚本攻击跟浏览器的[同源策略][same-origin_policy]有关，所谓同源策略，指的是两个站点的协议、域名和端口号相同。只要三者中任意一个不同，就违背同源策略，也就是我们常说的“跨域”。比如，对于 `http://store.company.com/dir/page.html`，分析下面这几种情况。

- `http://store.company.com/dir2/other.html` 同源，只有 URL 路径不同。
- `http://store.company.com/dir/inner/another.html` 同源，只有 URL 路径不同。
- `https://store.company.com/page.html` 非同源，协议不同。
- `http://store.company.com:81/dir/page.html` 非同源，端口不同，示例站点端口号为 `80`，此端口号为 `81`。
- `http://news.company.com/dir/page.html` 非同源，域名不同。

同源策略的提出，主要是为了安全性的考虑，比如，它能够防止恶意站点从其他站点或者服务器窃取数据。具体来说，同源策略有下面这些限制。

- 无法接触非同源网页的 DOM。
- 无法读取非同源网页的 Cookie、LocalStorage 和 IndexedDB。
- 无法向非同源地址发送 AJAX 请求（可以发送，但浏览器会拒绝接受响应）。

XSS 攻击的成功实施必须满足两个条件。

1. 恶意代码被注入到站点。
2. 恶意代码没有被执行消毒操作，使其被当作脚本代码执行。

![XSS 攻击发生时，攻击者能够访问其他站点的 DOM、Cookie 和 Storage 数据](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS/xss.svg)

XSS 攻击通常分为三种类型：存储型 XSS (Stored XSS)、反射型 XSS (Reflected XSS)和基于 DOM 的 XSS (DOM-based XSS)。

### 客户端 XSS 攻击示例

在页面渲染过程中，采用客户端渲染（Client-side rendering，CSR）的站点（比如，使用 React 这样的框架），直接或者间接地通过 `document.createElement()` 之类的 web API 操作页面，XSS 攻击正是发生在这个过程中。

下面的示例中的代码，是 `https://my-bank.example.com/welcome` 站点中的一部分，用户登录之后，站点能访问到用户的登录信息并执行转账操作。用户登录之后，该站点尝试从 URL 查询参数中获取用户的信息，向用户展示一段欢迎信息。

```html
<h1 id="welcome"></h1>

<script>
  const params = new URLSearchParams(window.location.search);
   const user = params.get("user");
   const welcome = document.querySelector("#welcome");
   welcome.innerHTML = `Welcome back, ${user}!`;
</script>
```

攻击者向用户发送了一个这样的链接。

```html
<a
  href="https://my-bank.example.com/welcome?user=<img src=x onerror=alert('hello!')>">
  Get a free kitten!</a
>
```

用户点击这个链接之后，页面被加载，站点从 URL 中提取 `user` 信息，然而，该字段指向的是一段 HTML 代码 `<img src=x onerror=alert('hello!')>`，这行代码被 `innerHTML` 执行后，`<img>` 标签被创建，`<img>` 的 `src` 属性指向一个错误的地址，于是触发了 `onerror` 函数。最终造成的后果就是，`onerror` 中的恶意脚本被执行。

### 服务端 XSS 攻击示例

对于采用服务端渲染的（Server-side rendering，SSR）站点，服务器将数据注入到模板文件中，在这个过程中，也可能发生 XSS 攻击。下面这个服务器搜索的例子就演示了这种情况。

```html
<h1>Search</h1>

<form action="/results">
  <label for="mySearch">Search for an item:</label>
  <input id="mySearch" type="search" name="search" />
  <input type="submit" />
</form>
```

用户输入搜索内容并点击提交按钮，浏览器向 `results` 接口发出一个 GET 请求。

```http
https://example.org/results?search=bananas
```

服务器收到请求之后，查询数据库，将结果返回给用户。

```javascript
app.get("/results", (req, res) => {
  const searchQuery = req.query.search;
  const results = getResults(searchQuery);
  res.send(`
   <h1>You searched for ${searchQuery}</h1>
   <p>Here are the results: ${results}</p>`);
});
```

然而，攻击者可能发送一个这样的请求。

```html
<a href="http://example.org/results?search=<img src=x onerror=alert('hello')">
  Get a free kitten!</a
>
```

用户点击这个链接之后，服务器提取出来的搜索关键词是 `<img src=x onerror=alert('hello')`，这段代码被嵌入到返回的结果中，浏览器解析结果时，`onerror` 函数中的恶意脚本就会被执行。

### XSS 防护

#### 输入验证、过滤与消毒

对于输入的内容，通过白名单或者黑名单机制进行验证和过滤。

```javascript
function validateInput(input) {
  const allowedTags = ['p', 'br', 'strong', 'em'];
  const allowedAttributes = ['class', 'id'];
  // 实现白名单过滤逻辑
}

function sanitizeInput(input) {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
```

消毒（Sanitization）指的是移除 HTML 字符串中不安全的代码的过程。在对输入消毒时，需要考虑到各种情况，因此，推荐使用 [DOMPurify] 这样的库来执行这一过程。

```html
<div>
  <img src="x" onerror="alert('hello!')" />
  <script>
    alert("hello!");
  </script>
</div>
```

上面这段代码，消毒后会变成下面的代码。

```html
<div>
  <img src="x" />
</div>
```

下面是一个在 React 中使用 DOMPurify 的例子。

```jsx
import DOMPurify from 'dompurify';

function SafeHtmlRenderer({ htmlContent }) {
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'class'],
    ALLOW_DATA_ATTR: false
  });
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
```

#### 输出编码

输出编码（Output encoding）指的是对输入的内容在输出到页面之前，对可能有潜在危险的内容进行转码的过程，使其最终被作为字符串而不是 HTML 或者脚本被执行。

输出编码包括了对输入的 HTML、URL 以及脚本等内容进行编码。

HTML 编码主要是对下面这些字符进行处理。

- 将 `<` 转为 `&lt;`。
- 将 `>` 转为 `&gt;`。
- 将 `'` 转为 `&#x27;`。
- 将 `"` 转为 `&quot;`。
- 将 `&` 转为 `&amp;`。

下面是一个封装的、对各种字符编码的工具方法。

```javascript
/**
 * XSS 防护输出编码器
 * 支持多种上下文环境的自动编码
 */
class XSSEncoder {
  constructor() {
    // 危险字符映射表
    this.dangerousChars = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    // JavaScript 危险字符
    this.jsDangerousChars = {
      '\\': '\\\\',
      "'": "\\'",
      '"': '\\"',
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
      '\b': '\\b',
      '\f': '\\f',
      '/': '\\/',
      '<': '\\u003c',
      '>': '\\u003e'
    };

    // URL 危险字符
    this.urlDangerousChars = {
      ' ': '%20',
      '!': '%21',
      '"': '%22',
      '#': '%23',
      '$': '%24',
      '%': '%25',
      '&': '%26',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '*': '%2A',
      '+': '%2B',
      ',': '%2C',
      '/': '%2F',
      ':': '%3A',
      ';': '%3B',
      '<': '%3C',
      '=': '%3D',
      '>': '%3E',
      '?': '%3F',
      '@': '%40',
      '[': '%5B',
      '\\': '%5C',
      ']': '%5D',
      '^': '%5E',
      '`': '%60',
      '{': '%7B',
      '|': '%7C',
      '}': '%7D',
      '~': '%7E'
    };
  }

  /**
   * HTML 实体编码
   * @param {string} input - 输入字符串
   * @param {boolean} strict - 是否严格模式（编码更多字符）
   * @returns {string} 编码后的字符串
   */
  htmlEncode(input, strict = false) {
    if (typeof input !== 'string') {
      input = String(input);
    }

    let result = input;
    
    // 基础危险字符编码
    for (const [char, encoded] of Object.entries(this.dangerousChars)) {
      result = result.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), encoded);
    }

    // 严格模式：编码更多潜在危险字符
    if (strict) {
      const strictChars = {
        '(': '&#40;',
        ')': '&#41;',
        '[': '&#91;',
        ']': '&#93;',
        '{': '&#123;',
        '}': '&#125;',
        ';': '&#59;',
        ':': '&#58;',
        '!': '&#33;',
        '@': '&#64;',
        '#': '&#35;',
        '$': '&#36;',
        '%': '&#37;',
        '^': '&#94;',
        '*': '&#42;',
        '+': '&#43;',
        '=': '&#61;',
        '|': '&#124;',
        '\\': '&#92;',
        '`': '&#96;',
        '~': '&#126;'
      };

      for (const [char, encoded] of Object.entries(strictChars)) {
        result = result.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), encoded);
      }
    }

    return result;
  }

  /**
   * JavaScript 字符串编码
   * @param {string} input - 输入字符串
   * @param {boolean} inAttribute - 是否在属性中使用
   * @returns {string} 编码后的字符串
   */
  jsEncode(input, inAttribute = false) {
    if (typeof input !== 'string') {
      input = String(input);
    }

    let result = input;

    // 基础 JavaScript 危险字符编码
    for (const [char, encoded] of Object.entries(this.jsDangerousChars)) {
      result = result.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), encoded);
    }

    // 在属性中使用时的额外编码
    if (inAttribute) {
      result = result.replace(/"/g, '\\"');
    }

    return result;
  }

  /**
   * URL 编码
   * @param {string} input - 输入字符串
   * @param {boolean} strict - 是否严格模式
   * @returns {string} 编码后的字符串
   */
  urlEncode(input, strict = false) {
    if (typeof input !== 'string') {
      input = String(input);
    }

    if (strict) {
      // 使用 encodeURIComponent 进行严格编码
      return encodeURIComponent(input);
    }

    // 自定义编码，只编码危险字符
    let result = input;
    for (const [char, encoded] of Object.entries(this.urlDangerousChars)) {
      result = result.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), encoded);
    }

    return result;
  }

  /**
   * CSS 编码
   * @param {string} input - 输入字符串
   * @returns {string} 编码后的字符串
   */
  cssEncode(input) {
    if (typeof input !== 'string') {
      input = String(input);
    }

    return input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\A')
      .replace(/\r/g, '\\D')
      .replace(/\(/g, '\\28')
      .replace(/\)/g, '\\29')
      .replace(/</g, '\\3C')
      .replace(/>/g, '\\3E');
  }

  /**
   * 属性值编码
   * @param {string} input - 输入字符串
   * @param {string} quote - 引号类型 (' 或 ")
   * @returns {string} 编码后的字符串
   */
  attributeEncode(input, quote = '"') {
    if (typeof input !== 'string') {
      input = String(input);
    }

    let result = input;

    // HTML 实体编码
    result = this.htmlEncode(result);

    // 根据引号类型进行额外编码
    if (quote === '"') {
      result = result.replace(/"/g, '&quot;');
    } else if (quote === "'") {
      result = result.replace(/'/g, '&#x27;');
    }

    return result;
  }

  /**
   * 智能上下文编码
   * 根据上下文自动选择合适的编码方式
   * @param {string} input - 输入字符串
   * @param {string} context - 上下文类型 ('html', 'js', 'url', 'css', 'attribute')
   * @param {Object} options - 编码选项
   * @returns {string} 编码后的字符串
   */
  smartEncode(input, context = 'html', options = {}) {
    switch (context.toLowerCase()) {
      case 'html':
        return this.htmlEncode(input, options.strict);
      
      case 'js':
      case 'javascript':
        return this.jsEncode(input, options.inAttribute);
      
      case 'url':
        return this.urlEncode(input, options.strict);
      
      case 'css':
        return this.cssEncode(input);
      
      case 'attribute':
        return this.attributeEncode(input, options.quote);
      
      default:
        // 默认使用 HTML 编码
        return this.htmlEncode(input, options.strict);
    }
  }

  /**
   * 批量编码
   * @param {Object} data - 要编码的数据对象
   * @param {Object} encodingRules - 编码规则映射
   * @returns {Object} 编码后的数据对象
   */
  batchEncode(data, encodingRules = {}) {
    const result = {};

    for (const [key, value] of Object.entries(data)) {
      const rule = encodingRules[key] || { context: 'html', options: {} };
      
      if (typeof value === 'string') {
        result[key] = this.smartEncode(value, rule.context, rule.options);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => 
          typeof item === 'string' 
            ? this.smartEncode(item, rule.context, rule.options)
            : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.batchEncode(value, rule.nestedRules || {});
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}

// 创建全局实例
const xssEncoder = new XSSEncoder();

// 便捷方法
const htmlEncode = (input, strict = false) => xssEncoder.htmlEncode(input, strict);
const jsEncode = (input, inAttribute = false) => xssEncoder.jsEncode(input, inAttribute);
const urlEncode = (input, strict = false) => xssEncoder.urlEncode(input, strict);
const cssEncode = (input) => xssEncoder.cssEncode(input);
const attributeEncode = (input, quote = '"') => xssEncoder.attributeEncode(input, quote);
const smartEncode = (input, context = 'html', options = {}) => xssEncoder.smartEncode(input, context, options);
const batchEncode = (data, encodingRules = {}) => xssEncoder.batchEncode(data, encodingRules);

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    XSSEncoder,
    xssEncoder,
    htmlEncode,
    jsEncode,
    urlEncode,
    cssEncode,
    attributeEncode,
    smartEncode,
    batchEncode
  };
}
```

按照输入代码被嵌入的位置，可以从下面三个方面考虑防护措施。

- HTML 上下文。用户输入的内容被嵌入到 HTML 元素标签内部（除 `<style>` 和 `<script>`），这些代码被当作 HTML 解析，编码工具大多能够处理这种情况。
- HTML 属性上下文。用户输入的内容被当作 HTML 属性解析，此时，恶意代码就可以通过 `onblur` 或者 `src` 之类的属性执行。

  比如，下面这行代码就是不安全的。

  ```html
  <div class={{ my_class }}>...</div>
  ```

  攻击者可以输入 `onmouseover=alert(1)` 之类的内容。要防止恶意脚本的执行，可以将其使用引号包裹起来，就像下面这样。

  ```html
  <div class="{{ my_class }}">...</div>
  ```

- JavaScript 和 CSS 上下文。讲内容嵌入到 `<style>` 和 `<script>` 是一种危险的行为，应该避免这种情况的发生。

#### 内容安全策略的处理

```html
<meta http-equiv="Content-Security-Policy" 
  content="
    default-src 'self'; 
    script-src 'self' 'unsafe-inline'; 
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
  "
>
```

#### 启用 HTTP 安全头

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

#### 安全的 Cookie 处理

考虑启用下面三个 Cookie 中的属性。

- `httpOnly: true`
- `secure: true`
- `sameSite: 'strict'`

### React 中的 XSS 防护措施

#### JSX 会自动对输入转义

React 的框架会自动对嵌入到 JSX 语法中的内容进行处理。

```jsx
import React from "react";

export function App(props) {
  return <div>Hello, {props.name}!</div>;
}
```

比如，用户通过 `props.name` 输入了这样一行代码 `<img src=x onerror=alert('XSS!')>`，这行代码最终会被转为下面的输出。

```test
Hello, <img src=x onerror=alert('XSS!')>!
```

#### 尽量避免使用 `dangerouslySetInnerHTML`

#### 使用工具方法

下面的工具方法，是基于 `XSSEncoder` 工具方法的封装。

```javascript
import { useMemo } from 'react';
import { xssEncoder } from './xssEncoder';

/**
 * XSS 防护 Hook
 * @param {string} input - 输入内容
 * @param {string} context - 编码上下文
 * @param {Object} options - 编码选项
 * @returns {string} 编码后的内容
 */
export const useXSSProtection = (input, context = 'html', options = {}) => {
  return useMemo(() => {
    if (!input) return '';
    return xssEncoder.smartEncode(input, context, options);
  }, [input, context, options]);
};

/**
 * 批量 XSS 防护 Hook
 * @param {Object} data - 数据对象
 * @param {Object} encodingRules - 编码规则
 * @returns {Object} 编码后的数据
 */
export const useBatchXSSProtection = (data, encodingRules = {}) => {
  return useMemo(() => {
    if (!data) return {};
    return xssEncoder.batchEncode(data, encodingRules);
  }, [data, encodingRules]);
};
```

[same-origin_policy]: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
[DOMPurify]: https://github.com/cure53/DOMPurify

## CSRF

## 参考

- [Cross-site scripting (XSS)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS), MDN
- [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), MDN
- [同源限制](https://wangdoc.com/javascript/bom/same-origin), 阮一峰

# HTTP 的发展

## HTTP/0.9

HTTP/0.9 是 HTTP 的第一个版本，最初的 HTTP 协议并没有版本号的概念，只是为了区别于后来版本的 HTTP 协议，才被命名为 0.9，以区分后来的版本。这个版本的协议非常简单。

- 只支持 GET 请求；
- 不包含 HTTP 头字段；
- 只能传输 HTML 文件。

这个版本的请求由单行指令构成，以唯一可用方法 GET 开头，其后跟目标资源的路径。

```http
GET /mypage.html
```

服务器返回的响应数据，也只能是 HTML 文档，没有其他格式。

```html
<html>
  这是一个非常简单的 HTML 页面
</html>
```

## HTTP/1.0

相比于上个版本，HTTP/1.0 更具有扩展性。

- 增加了 HEAD、POST 请求方法；
- 引入了 HTTP 头的概念；
- 请求头中，增加了协议版本号；
- 响应头中，增加了响应状态码，标记可能的错误原因；
- 可以传输除了 HTML 之外的其他格式，如图片、音频等。

按照 HTTP/1.0 的构想，一个典型的请求-响应数据，看起来就像下面这样。

```http
GET /mypage.html HTTP/1.0
User-Agent: NCSA_Mosaic/2.0 (Windows 3.1)

200 OK
Date: Tue, 15 Nov 1994 08:12:31 GMT
Server: CERN/3.0 libwww/2.17
Content-Type: text/html
<HTML>
一个包含图片的页面
  <IMG SRC="/myimage.gif">
</HTML>
```

HTTP/1.0 并非事实上的标准，而是一个草案。

## HTTP/1.1

HTTP/1.1 在 HTTP/1.0 版本的基础上，做了很多修订。而且，HTTP/1.1 是事实上的标准。

- 增加了 PUT、DELETE 等新的方法；
- 引入内容协商机制，增加了缓存管理和控制；
- 明确了连接管理，允许持久连接，节省了多次打开 TCP 连接加载网页文档资源的时间；
- 允许响应数据分块（chunked），利于传输大文件；
- 强制要求 Host 头，让互联网主机托管成为可能。

一个典型的请求流程，所有请求都通过一个连接实现，看起来就像这样：

```http
GET /zh-CN/docs/Glossary/CORS-safelisted_request_header HTTP/1.1
Host: developer.mozilla.org
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9
Accept-Encoding: gzip, deflate, br
Referer: https://developer.mozilla.org/zh-CN/docs/Glossary/CORS-safelisted_request_header

200 OK
Connection: Keep-Alive
Content-Encoding: gzip
Content-Type: text/html; charset=utf-8
Date: Wed, 20 Jul 2016 10:55:30 GMT
Etag: "547fa7e369ef56031dd3bff2ace9fc0832eb251a"
Keep-Alive: timeout=5, max=1000
Last-Modified: Tue, 19 Jul 2016 00:59:33 GMT
Server: Apache
Transfer-Encoding: chunked
Vary: Cookie, Accept-Encoding

(content)
```

## HTTP/2

- 二进制协议，不再是纯文本；
- 支持多路复用。并行的请求能在同一个链接中处理，移除了 HTTP/1.x 中顺序和阻塞的约束。
- 压缩了标头。因为标头在一系列请求中常常是相似的，其移除了重复和传输重复数据的成本。
- 允许服务器主动向客户端推送数据，通过一个叫服务器推送的机制来提前请求。
- 增强了安全性，「事实上」要求加密通信。

## HTTP/3

HTTP/3 在输层部分使用 QUIC 而不是 TCP。

QUIC 旨在为 HTTP 连接设计更低的延迟。类似于 HTTP/2，它是一个多路复用协议，但是 HTTP/2 通过单个 TCP 连接运行，所以在 TCP 层处理的数据包丢失检测和重传可以阻止所有流。QUIC 通过 UDP 运行多个流，并为每个流独立实现数据包丢失检测和重传，因此如果发生错误，只有该数据包中包含数据的流才会被阻止。

## 参考

- [HTTP 的发展](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/Evolution_of_HTTP)
- [HTTP 的前世今生](https://zq99299.github.io/note-book2/http-protocol/02/01.html)

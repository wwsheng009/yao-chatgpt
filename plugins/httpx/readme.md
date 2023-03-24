# http client with proxy

```sh
export HTTP_RROXY=http://127.0.0.1:10809
export HTTPS_RROXY=http://127.0.0.1:10809
```

构建

**注意**

由于插件使用`yao`的`gou`库，你编辑`go.mod`文件来匹配你的需求。

```sh
go build -o ../httpx.so .
chmod +x ../httpx.so
```

测试

```sh
yao run plugins.httpx.post "https://api.openai.com/v1/chat/completions"

```

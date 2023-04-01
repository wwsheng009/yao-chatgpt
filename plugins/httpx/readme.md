# http client with proxy

支持代理的 http.post 库。

假设你知道怎么使用代理

## 构建

```sh
go build -o ../httpx.so .
chmod +x ../httpx.so

# 或是
make release
```

## 测试

设置环境变量

```sh
export HTTP_RROXY=http://127.0.0.1:10809
export HTTPS_RROXY=http://127.0.0.1:10809
export ALL_RROXY=http://127.0.0.1:10809
```

或是修改文件`.env`

```sh
HTTP_RROXY="http://127.0.0.1:10809"
HTTPS_PROXY="http://127.0.0.1:10809"
ALL_RROXY=http://127.0.0.1:10809
```

```sh
cd ../../
yao run plugins.httpx.post "https://api.openai.com/v1/chat/completions"

```

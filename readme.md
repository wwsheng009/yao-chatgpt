# 项目名称

使用 YAO engine 编写一个调用 openai chat gpt 接口的小应用

## 简介

本项目基于 yao engine 开发的一个 ai 聊天接口应用。它的主要功能是接收用户的提问，并调用 openai chat gpt 的提供的 api 接口。可以为用户提供一个简单的聊天应用。

## 功能

- 演示调用 chat gpt api 接口
- 提供外部用户调用的 post/get 接口
- 提供后台系统配置，日志查看功能

## 安装

本项目依赖于 yao 引擎的开发版本 0.10.3，请先下载 yao 应用，下载地址：
https://github.com/YaoApp/yao/actions/workflows/release-linux.yml

这里提供本项目的安装步骤，例如：

```sh
https://github.com/wwsheng009/yao-chatgpt.git
cd yao-chatgpt
yao migrate
yao start
```

## 使用说明

前端
http://127.0.0.1:5199

管理端
http://127.0.0.1:5199/admin/login/admin

默认用户名:
xiang@iqka.com
密码:
A123456p+

## 贡献者

## 许可证

本项目使用 Apache License 2.0 许可证，详情请参阅 [LICENSE.txt](LICENSE.txt)

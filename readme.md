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

登录管理系统端后，需要在设置菜单界面输入您的 open ai 的调用 api key。

## 如何获取 openai api key.

可以在 OpenAI 官网上申请，也可以在 GitHub 上搜索，会有一些免费的 API Key 可以使用。

## 读取所有的 openai 的模型列表到本地

非必要，
```
yao run scripts.ai.model.UpdateModel

```

## 重置管理员

删除重置系统用户

```sh
yao run scripts.utils.user.ResetAdmin 18012341234 xxx@qq.com Abcd1234+
```

## 更新 api token

```sh
yao run models.ai.setting.Update 1 '::{"api_token":"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"}'
```

## 测试 api 接口

```sh
yao run scripts.ai.chatgpt.Call '::{"prompt":"你好"}'
yao run models.ai.conversation.get '::{}'
yao run models.ai.message.get '::{}'
```

## 贡献者

## 许可证

本项目使用 Apache License 2.0 许可证，详情请参阅 [LICENSE.txt](LICENSE.txt)

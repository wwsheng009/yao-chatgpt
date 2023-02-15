---
created: 2023-02-15T20:10:20 (UTC +08:00)
tags: []
source: https://towardsdatascience.com/gpt-3-parameters-and-prompt-design-1a595dc5b405
author: Anthony Cavin
---

# GPT-3 参数和提示设计|作者：安东尼·卡文·|迈向数据科学

> ## Excerpt
>
> GPT-3 is a computer system that is designed to generate natural language. It does this by taking in a piece of text and then predicting the next word or phrase that should come after it. In order to…

---

## 想法生成器、指令和 TL;DR 摘要

![](https://miro.medium.com/max/1050/0*wEL1QZqopLJ9IQbu)

摄影：[Roman Kraft](https://unsplash.com/@iamromankraft?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=medium&utm_medium=referral)

GPT-3 是一种旨在生成自然语言的计算机系统。它通过获取一段文本，然后预测它后面的下一个单词或短语来做到这一点。

为了实现这一目标，GPT-3 使用了一种深度学习算法，该算法已经在大量文本语料库上进行了训练。这允许它捕获单词如何在句子中一起使用的统计模式。

GPT-3 可用于涉及自然语言生成的各种任务，例如机器翻译、问答和文本摘要。GPT-3 甚至可用于从头开始生成新文本，例如故事或文章。

在这篇博文中，我们将看看使用该模型时可以设置的参数，并通过 OpenAI 提出的几个[示例](https://beta.openai.com/examples)。

## 参数是什么？

OpenAI GPT-3 是一种机器学习模型，可用于通过 API 生成预测文本。OpenAI 有不同的模型可供我们使用，功能最强大的模型称为“text-davinci-002”。

要使用该模型，我们可以按如下方式发送 API 请求。

```
curl https://api.openai.com/v1/completions \ -H “Content-Type: application/json” \ -H “Authorization: Bearer $OPENAI_API_KEY” \ -d ‘{ “model”: “text-davinci-002”, “prompt”: “What are 5 key points I should know when studying Ancient Rome?”, “temperature”: 0.3, “max_tokens”: 150, “top_p”: 1, “frequency_penalty”: 0, “presence_penalty”: 0}'
```

**engine**引擎参数指定用于生成预测的 AI 模型。在本文中，我们将使用功能最强大的一个：“text-davinci-002”。

**max tokens**“max tokens”参数指定模型可以生成的最大令牌。令牌可以看作是一个词。

> 根据经验，1 个令牌大约是 4 个字符。

**temperature 温度**在映射到概率之前，模型输出非规范化值 （logits）。对数通常与 softmax 等函数一起使用，以将它们转换为概率。

但是，在应用 softmax 函数之前，我们可以使用受热力学启发的技巧，并使用温度参数缩放对数，即 softmax（logits/temperature）。

接近 1 的温度参数意味着对数无需修改即可通过 softmax 函数。如果温度接近零，与其他 token 相比，最高可能的 token 将变得非常有可能，即模型变得更加确定，并且总是在给定的单词序列之后输出同一组 token。

> 当温度介于 0 和 1 之间时，我们可以控制模型预测的随机性和创造性。

**top p**top p 参数指定推理期间的采样阈值。Top p 采样（有时称为细胞核采样）是一种用于对模型的可能结果进行采样的技术。

为了更好地理解这个概念，让我们假设模型必须预测句子“我想吃”之后的下一个令牌。为简单起见，我们假设令牌是一个单词，并且模型输出以下概率：

- 胡萝卜（2%的可能性），
- 黄瓜（1.5%的可能性），
- 茄子（1%的可能性），
- 菠菜（0.5%的可能性），
- 西兰花（0.3%的可能性），
- ...

这组词形成概率分布“P（词|”我想吃“）”，累积分布函数 （CDF） 如下所示：

- 2%加胡萝卜，
- 3.5%与胡萝卜和黄瓜，
- 4.5% 胡萝卜、黄瓜和茄子
- ...

如果我们将 top p 参数设置为 3.5%，则模型将根据胡萝卜和黄瓜的可能性在胡萝卜和黄瓜之间进行采样和随机选择。top p 为 4.5% 时，该模型将在胡萝卜、黄瓜和茄子之间随机选择一个单词。

与 temperature 一样，top p 参数控制模型的随机性和原创性。

> top p 和 temperature 参数都控制模型的随机性。OpenAI 文档建议使用一个参数或另一个参数，并将未使用的参数设置为中性大小写，即 1.0。

**Frequency penalty 频率惩罚**频率惩罚参数控制模型重复预测的倾向。频率惩罚降低了已经生成的单词的概率。惩罚取决于一个单词在预测中已经出现的次数。

**Presence penalty 存在惩罚**存在惩罚参数鼓励模型做出新颖的预测。如果某个单词已经出现在预测文本中，则存在惩罚会降低该单词的概率。与频率惩罚不同，存在惩罚不依赖于单词在过去预测中出现的频率。

## **语法更正**

```
Engine: text-davinci-002
Max tokens: 60
Temperature: 0
Top p: 1.0
Frequency penalty: 0.0
Presence penalty: 0.0
```

对于在语法方面苦苦挣扎的作家和学生来说，技术一直是一个福音。过去，我们有拼写检查器和语法检查器来帮助我们发现错误。但是现在，即使是 GPT-3 也可以完成工作并捕获错误。

这对那些非英语母语或语法有困难的人特别有用。

**提示**

```
Correct this to standard English: I’m looking forward to see you
```

**响应**

```
I’m looking forward to seeing you.
```

因此，如果您正在寻找一种提高写作水平的方法，请尝试使用 GPT-3 驱动的语法更正。您可能会惊讶于它能提供多少帮助。

## **创意生成器**

```
Engine: text-davinci-002
Max tokens: 150
Temperature: 0.6
Top p: 1.0
Frequency penalty: 1
Presence penalty: 1
```

如果您正在努力提出新的想法，您可能还需要考虑使用 GPT-3。

例如，你可以告诉人工智能想出一种环保新产品的想法。然后，人工智能将生成一个潜在想法列表供您选择。

**提示**

```
come up with ideas for a new product that is environmentally friendly:
```

**响应**

```
1. A reusable water bottle that can be refilled from the tap. 2. A reusable shopping bag made from recycled materials. 3. A solar-powered cell phone charger. 4. An LED light bulb that lasts for years and consumes very little energy.
```

您还可以使用 GPT-3 查找您面临的问题的解决方案。例如，如果您正在尝试增加商店的销售额，AI 可以生成一个营销理念列表供您考虑。

**提示**

```
brainstorm solutions to increase sales at your store:
```

**响应**

```
1. Offer discounts or coupons. 2. Host a sale or clearance event. 3. Create an attractive window display. 4. Place items on end caps or near the register. 5. Train staff to upsell and cross-sell products. 6. Implement a loyalty program. 7. Send out direct mailers or emails. 8. Place ads in local publications. 9. Sponsor a community event. 10. Get involved with social media marketing
```

因此，如果您正在寻找一种解决问题的创造性方法，GPT-3 可能正是您所需要的。

## **DR 摘要**

```
Engine: text-davinci-002
Max tokens: 60
Temperature: 0.7
Top p: 1.0
Frequency penalty: 0.0
Presence penalty: 0.0
```

任何花时间上网的人都知道，那里有很多文字。有时，很难完成所有这些。

使用 TL;DR，您可以快速获取一段文本的要点，而无需通读所有文本。现在，GPT-3 可以为您完成这项工作。

只需向工具提供您想要总结的文本，它将尽最大努力为您提供简洁的概述。

**提示**

```
Technology has always been a boon for writers and students struggling with grammar. In the past, we had spell checkers and grammar checkers to help us catch mistakes. But now, even GPT-3 can do the work and catch errors.This can be especially helpful for those who are non-native English speakers or who have difficulty with grammar.Tl;dr
```

**响应**

```
If you’re struggling with your grammar, consider using an AI-powered grammar checker to help you improve your writing.
```

## 我们可以给出额外的说明吗？

这部分可能是最迷人的部分。我们可以通过向提示添加上下文来“指示”算法如何响应请求。

**提示**

```
my company produces reusable water bottles that can be refilled from the tap.brainstorm solutions to increase sales at your store:
```

**响应**

```
1. Offer a discount to customers who purchase your reusable water bottles. 2. Place your water bottles in high-traffic areas of your store so that more people will see them. 3. Educate your staff about the benefits of using reusable water bottles and encourage them to use them themselves. This will create a positive example for customers. 4. Make sure that your water bottles are easy to find and accessible in your store so that customers can easily grab one when they need it.
```

> 我们添加到提示的上下文直接反映在响应中。

此行为是预期的，因为模型根据提示中给出的令牌预测下一个令牌。

有时一个词可以改变整个反应。例如，如果我们使用“摘要”而不是“TL;DR”，我们可以得到更长的响应：

**提示**

```
Technology has always been a boon for writers and students struggling with grammar. In the past, we had spell checkers and grammar checkers to help us catch mistakes. But now, even GPT-3 can do the work and catch errors. This can be especially helpful for those who are non-native English speakers or who have difficulty with grammar. Summary:
```

**响应**

```
Technology has always been a boon for writers and students struggling with grammar. In the past, we had spell checkers and grammar checkers to help us catch mistakes. But now, even GPT-3 can do the work and catch errors.
```

## **结论**

GPT-3 计算机系统旨在通过预测它后面的下一个单词或短语来生成自然语言。这种深度学习算法已经在大量文本上进行了训练，使其能够捕获单词如何在句子中一起使用的统计模式。

GPT-3 是一个很好的工具，我们可以用来提出新的想法、纠正语法错误，甚至生成文本。为了充分利用模型，我们可以使用参数，但我们也可以设计提示，使其引导 AI 获得所需的响应。

感谢您的阅读！

---
created: 2023-02-15T20:27:15 (UTC +08:00)
tags: []
source: https://help.openai.com/en/articles/5072263-how-do-i-use-stop-sequences
author:
---

# 如何使用 Stop Sequences？ |开放人工智能帮助中心

> ## Excerpt
>
> 所有收藏

---

[所有收藏](https://help.openai.com/en/)

[OpenAI API](https://help.openai.com/en/collections/3675931-openai-api)

[快速工程](https://help.openai.com/en/collections/3675931-openai-api#prompt-engineering)

如何使用 Stop Sequences？

## 如何使用 Stop Sequences？

![亚瑟·瑞恩头像](https://static.intercomassets.com/avatars/4418977/square_128/Screenshot_2023-01-25_at_11.28.45_AM-1674674951.png)

作者：Asher Ryan  
一周前更新

## **Stop Sequences**

Stop Sequences 用于使模型在所需点停止，例如句子或列表的结尾。通常，返回键可以很好地用作单行完成的 Stop Sequences。Stop Sequences 是一个可选设置，用于告知 API 何时停止生成令牌。完成将不包含 Stop Sequences，您最多可以传递四个 Stop Sequences。如果未传递任何内容，则默认为令牌<|endoftext|>。此标记表示文本中可能的停止点。

### **聊天示例：**

在[聊天](https://beta.openai.com/playground/p/default-chat)示例中，使用了三个 Stop Sequences：新行、值“Human：”和值“AI：”。我们的目标是仅生成与当前说话人对应的单行文本。选择的三个 Stop Sequences 创建了实现该目的所需的约束：

- 完成不能转到新行。
- 完成无法更改扬声器。
- 完成将不允许演讲者连续发言两次

### **问答示例：**

在问[答](https://beta.openai.com/playground/p/default-qa)示例中，用新行分隔每个问答对的模式使我们相信返回键（新行）将很好地作为我们的 Stop Sequences。您可以在下面看到，在 **A:** 之后的完成将在一行后停止，因为返回键用作 Stop Sequences。

![](https://openai.intercom-attachments-7.com/i/o/330834756/65a8a1772e7c8d7b3716bcce/P5YtnyetBetZprUCREzxqg4WvjcIjxmcyM68n9fYItagMMnSTRE2BE-6cAMcDmsKa04USSe6pDAM0Crcrgw6wcPCDxqt-AC2N3j1HjmKuYMBK6TBf-Pj6IB5o-T0FVtCtfF0m2O9)

### **列表示例：**

还可以使用“Stop Sequences”生成包含特定数量项的列表。例如，通过使用“11.”作为 Stop Sequences，可以生成包含 10 个项目的列表，因为当达到“11.”时完成将停止。这可以从[科幻提示](https://beta.openai.com/playground/p/default-sci-fi-book-list)中看出。

这回答了你的问题吗？

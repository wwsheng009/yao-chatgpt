/**
 * 处理GET请求，注意get请求无法处理包含特殊字符的请求
 *
 * /api/ai/ask?q=xxx.xx.xx
 * @param {*} message
 * @returns
 */
function Callq(message) {
  return Call({ prompt: message });
}

/**
 * 请求消息
 * yao run scripts.ai.chatgpt.Call '::{"prompt":"你好"}'
 * yao run scripts.ai.chatgpt.Call '::{"prompt":"可以帮我找一下python学习资源吗","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 * yao run scripts.ai.chatgpt.Call '::{"prompt":"廖雪峰的Python教程","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 *
 *yao run scripts.chat.conversation.FindConversationById "938d58a4-b976-46b8-a342-7644a2566476"
 * @param {object} message 请求消息
 * @returns
 */
function Call(message) {
  const setting = GetSetting();
  if (!setting || !setting.api_token) {
    return "请在管理界面维护AI连接设置值";
  }
  if (!message || !message.prompt || !message.prompt.length) {
    return "请填写您的问题";
  }
  const ask = message.prompt;
  if (ask.length < 2) {
    return "请填写详细的问题";
  }

  setting.user_nickname = setting.user_nickname || "用户";
  setting.ai_nickname = setting.ai_nickname || "AI智能助理";

  if (
    setting.model.startsWith("gpt-3.5") ||
    setting.model.startsWith("gpt-4")
  ) {
    return Process("scripts.ai.chatgpt_chat.Call", message, setting);
  } else {
    return Process("scripts.ai.chatgpt_complete.Call", message, setting);
  }
}
function GetSetting() {
  let [setting] = Process("models.ai.setting.Get", {
    wheres: [
      {
        Column: "default",
        Value: true,
      },
      {
        Column: "deleted_at",
        Value: null,
      },
    ],
  });
  // console.log("setting", setting);
  if (setting?.api_token) {
    if (setting.api_token == "sk-") {
      setting.api_token = "";
    }
    if (!setting.api_token) {
      const access_key = Process("yao.env.get", "OPENAI_KEY");
      if (access_key) {
        setting.api_token = access_key;
      }
    }
  }
  return setting;
}

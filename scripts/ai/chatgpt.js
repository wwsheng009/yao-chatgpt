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

  if (setting.model.startsWith("gpt-3.5-turbo")) {
    return Process("scripts.ai.chatgpt_chat.Call", message, setting);
  } else {
    return Process("scripts.ai.chatgpt_complete.Call", message, setting);
  }
}
function GetSetting() {
  const setting = Process("models.ai.setting.Get", {
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
  return setting[0];
}

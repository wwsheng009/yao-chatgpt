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
 * 处理post请求，并调用chatgpt接口
 * @param {object} message 消息文本
 * @returns
 */
function Call(message) {
  const setting = GetSetting();
  if (!setting || !setting.api_token) {
    return "请在管理界面维护AI连接设置值";
  }
  if (!message || !message.prompt) {
    return "请填写您的问题";
  }
  const ask = message.prompt;
  if (ask.length < 2) {
    return "请填写详细的问题";
  }

  let conversation = message.conversation;

  conversation = checkLenAndDelete(conversation, setting.max_tokens);
  // console.log('对话内容列表:')
  // console.log(conversation)

  var chatGptName = setting.ai_nickname || "AI智能助理";
  var userName = setting.user_nickname || "用户";
  var stopword = setting.stop || "<|endoftext|>";
  var prompt =
    "提示:你叫" +
    chatGptName +
    "。" +
    stopword +
    "当前时间：" +
    CurrentTime() +
    "。" +
    stopword;

  conversation.map((line) => {
    if (line.u) {
      prompt += userName + ":" + line.u + stopword;
    } else if (line.ai) {
      prompt += chatGptName + ":" + line.ai + stopword;
    }
  });

  prompt += chatGptName + ":";

  // console.log(prompt);
  access_count = setting.access_count;

  //console.log("ask:", message)
  let reply = http.Post(
    "https://api.openai.com/v1/completions",
    {
      prompt: prompt,
      model: setting.model,
      max_tokens: setting.max_tokens,
      top_p: setting.top_p,
      stop: setting.stop,
      temperature: setting.temperature,
      presence_penalty: setting.presence_penalty,
      frequency_penalty: setting.frequency_penalty,
    },
    null,
    null,
    {
      "Content-Type": "application/json",
      // 'Authorization': `Bearer ${$ENV.AI_API_KEY}`,
      Authorization: `Bearer ` + setting.api_token,
    }
  );
  if (reply.code != 200) {
    return reply.data.error.message;
  }
  const answer = reply.data.choices[0].text;
  SaveLog(ask, answer);
  SaveLog2(setting);
  return answer;
}

/**
 * 检查会话是否超过限制，如果超过，从开始端删除内容
 * @param {Array} conversation 会话列表
 * @param {integer} limit token限制
 * @returns
 */
function checkLenAndDelete(conversation, limit) {
  let total = 0;
  let idx = 0;
  for (let index = conversation.length - 1; index >= 0; index--) {
    const element = conversation[index];
    if (element.u) {
      total += element.u?.length;
    } else if (element.ai) {
      total += element.ai?.length;
    }
    if (total > limit) {
      idx = index;
      break;
    }
  }

  while (idx > 0);
  {
    conversation.shift();
    idx--;
  }
  return conversation;
}
function CurrentTime() {
  var date = new Date();
  // utc时间整时区
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();
  newDate.setHours(hours - offset);
  return newDate.toISOString().slice(0, 19).replace("T", " ");
  // return dateObj.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}

/**
 * 更新访问统计
 * @param {object} setting
 * @returns
 */
function SaveLog2(setting) {
  return Process("models.ai.setting.Update", setting.id, {
    access_count: setting.access_count + 1,
  });
}
function SaveLog(question, answer) {
  return Process(
    "models.ai.chatlog.Insert",
    ["question", "answer"],
    [[question, answer]]
  );
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

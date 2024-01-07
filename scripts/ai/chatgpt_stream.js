let g_message = "";
let reply = null;
// function ssEvent(message, content) {
//   console.log(`message:${message},${content}`);
// }
function collect(content) {
  // console.log(`content:${content}`);
  // console.log(`content:${content}`);
  if (typeof ssEvent === "function") {
    ssEvent("messages", content);
  }
}

/**
 * 回调函数
 * @param {object} payload 数据
 * @returns
 */
function handler(payload) {
  // console.log("gpt_payload:", payload);
  const lines = payload.split("\n\n");
  for (const line of lines) {
    if (line === "") {
      continue;
    }
    if (line === "data: [DONE]") {
      return 0;
    } else if (line.startsWith("data:")) {
      const myString = line.substring(5);
      try {
        let message = JSON.parse(myString);
        if (message) {
          reply = message;
          let content = message.choices[0]?.delta?.content;
          // console.log(`content:${content}`);

          if (content) {
            g_message += content;
            collect(content);
          }
        }
      } catch (error) {
        ssEvent("errors", error.Error());
        return -1;
      }
    } else {
      console.log("unexpected", line);
    }
  }
  //异常，返回-1
  //正常返回1，默认
  //中断返回0
  return 1;
}
/**
 * yao run scripts.ai.chatpgt_stream.Call '::{"prompt":"你好"}'
 * yao run scripts.ai.chatpgt_stream.Call '::{"prompt":"可以帮我找一下python学习资源吗","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 * yao run scripts.ai.chatpgt_stream.Call '::{"prompt":"廖雪峰的Python教程","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 *
 *  yao run scripts.chat.conversation.FindConversationById "938d58a4-b976-46b8-a342-7644a2566476"
 */
function Call(message) {
  // console.log("ai script message", message);
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

  if (!setting.model.startsWith("gpt-3.5-turbo")) {
    return Process("scripts.ai.chatgpt_complete.Call", message, setting);
  } else {
    return CallGpt(message, setting);
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
  setting = setting || {};

  if (!setting.model) {
    setting.model = "gpt-3.5-turbo";
  }
  if (setting.api_token && setting.api_token == "sk-") {
    setting.api_token = "";
  }
  if (!setting.api_token) {
    const access_key = Process("yao.env.get", "OPENAI_KEY");
    if (access_key) {
      setting.api_token = access_key;
    }
  }

  return setting;
}

/**
 * 处理post请求，并调用chatgpt接口
 * @param {object} message 消息文本
 * @returns
 */
function CallGpt(message, setting) {
  const ask = message.prompt;
  //新会话
  let session_id = message.session_id;

  let conversationId = -1;
  let newMessages = [];
  if (session_id !== undefined) {
    const data = Process(
      "scripts.chat.conversation.FindConversationById",
      session_id
    );
    if (data) {
      conversationId = data.id;
      session_id = data.uuid;
      newMessages = data.messages || [];
    }
  }

  let stopword = GetStopWord(setting);
  let aiUserName = setting.ai_nickname;
  let endUserName = setting.user_nickname;

  //新对话
  let newSessionInitMessage; //= "提示:你叫" + chatGptName + "。\n";

  if (conversationId < 0) {
    const { uuid, id } = Process(
      "scripts.chat.conversation.NewConversation",
      ask
    );
    session_id = uuid;
    conversationId = id;
  }

  newMessages.push({
    ai_user: aiUserName,
    prompt: ask,
    end_user: endUserName,
  });

  // 取最后几行
  if (
    setting.max_send_lines > 0 &&
    newMessages.length > setting.max_send_lines
  ) {
    newMessages = newMessages.splice(
      -setting.max_send_lines,
      setting.max_send_lines
    );
  }

  let conversation = checkLenAndDelete(newMessages, setting.max_tokens);
  // let prompt = "";
  // if (newSessionInitMessage && newSessionInitMessage.length) {
  //   prompt = newSessionInitMessage;
  // }

  let messages = [];
  //模拟对话上下文
  conversation.map((line) => {
    if (line.prompt) {
      if (endUserName && endUserName.length) {
        messages.push({ role: "user", content: line.prompt });
      }
    }

    if (line.completion) {
      if (aiUserName && aiUserName.length) {
        messages.push({ role: "assistant", content: line.prompt });
      }
    }
  });
  // if (aiUserName && aiUserName.length) {
  //   prompt += aiUserName + ": ";
  // }

  const startDate = new Date();
  // console.log("messages", messages);
  let RequestBody = {
    // prompt: prompt,
    messages,
    model: setting.model,
    max_tokens: setting.max_tokens,
    top_p: setting.top_p,
    temperature: setting.temperature,
    presence_penalty: setting.presence_penalty,
    frequency_penalty: setting.frequency_penalty,
    stream: true,
  };
  if (stopword) {
    RequestBody.stop = stopword;
  }
  //   let url = "https://api.openai.com/v1/completions";
  let url = "https://api.openai.com/v1/chat/completions";

  // console.log(setting.model);
  // if (setting.model == "gpt-3.5-turbo-0301") {
  //   url = "https://api.openai.com/v1/chat/completions";
  // }
  // console.log("setting.api_token", setting.api_token);
  if (typeof ssEvent === "function") {
    ssEvent("session_id", session_id);
  } else {
    console.log("session_id", session_id);
  }
  let err = http.Stream("POST", url, handler, RequestBody, null, {
    Accept: "text/event-stream; charset=utf-8",
    "Content-Type": "application/json",
    Authorization: `Bearer ` + setting.api_token,
  });
  // console.log("err:,", err);
  if (err.code != 200) {
    throw new Exception(err.Message, err.code);
  }

  // console.log("stream replay", reply);
  const endDate = new Date();
  const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
  let answer = g_message;
  let new_message = {
    conversation_id: conversationId,
    ai_user: aiUserName,
    end_user: endUserName,
    prompt: ask,
    completion: answer,
    prompt_len: ask.length,
    completion_len: answer.length,
    request_total_time: seconds,
  };
  if (reply != null) {
    new_message.created = Process(
      "scripts.ai.model.convertUTCDateToLocalDate",
      reply.created
    );
    new_message.model = reply.model;
    new_message.object = reply.object;
  }

  Process("scripts.chat.conversation.NewMessageObject", new_message);
}

/**
 * 获取stop word
 * @param {Object} setting 设置
 * @returns string
 */
function GetStopWord(setting) {
  let stop_word = setting.stop;
  let stopwords = []; //=  setting.stop || "<|endoftext|>";
  if (typeof stop_word === "string" || stop_word instanceof String) {
    try {
      stop_word = JSON.parse(stop_word);
    } catch (error) {}
  }
  if (Array.isArray(stop_word)) {
    stopwords = stop_word;
  } else if (stop_word) {
    stopwords.push(stop_word);
  }
  setting.ai_nickname &&
    !stopwords.includes(setting.ai_nickname) &&
    stopwords.push(" " + setting.ai_nickname + ":");
  setting.user_nickname &&
    !stopwords.includes(setting.user_nickname) &&
    stopwords.push(" " + setting.user_nickname + ":");

  // stopwords.push("\n\n");
  let stop = JSON.stringify(stopwords);

  return stop;
}
function test_stopWord() {
  const setting2 = {
    access_count: 39,
    ai_nickname: "AI智能助理",
    api_token: "sk-",
    created_at: "2023-02-15 21:14:10",
    default: true,
    deleted_at: null,
    description: "目前最强大的模型",
    frequency_penalty: 0,
    id: 1,
    max_send_lines: 10,
    max_tokens: 1024,
    model: "text-davinci-003",
    presence_penalty: 1,
    stop: "\u003c|endoftext|\u003e",
    temperature: 0.5,
    top_p: 1,
    updated_at: "2023-02-16 23:58:47",
    user_nickname: "用户",
  };
  GetStopWord(setting2);
}
// test_stopWord();

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
    if (element.prompt) {
      total += element.prompt.length;
    }
    if (element.completion) {
      total += element.completion;
    }
    if (total > limit) {
      idx = index;
      break;
    }
  }

  while (idx > 0) {
    conversation.shift();
    idx--;
  }
  return conversation;
}

function test_checkLenAndDelete() {
  checkLenAndDelete(
    [
      {
        message: "你好",
        user: "用户",
      },
    ],
    1000
  );
}
// test_checkLenAndDelete();

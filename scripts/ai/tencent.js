let g_message = "";
let g_think = "";
let reply = null;

let g_is_first_thinking = true;
let g_start_thinking = false;//是否开始思考
// function ssEvent(message, content) {
//   console.log(`message:${message},${content}`);
// }
function collect(content) {
  // console.log(`content:${content}`);
  // console.log(`content:${content}`);
  if (typeof ssEvent === "function") {
    ssEvent("messages", content);
  } else {
    console.print(content);
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
          let reasoning_content = message.choices[0]?.delta?.reasoning_content;

          if (content) {
            g_message += content;
            collect(content);
            if (g_start_thinking) {
              collect('</think>\n')
              g_start_thinking = false
            }
          }
          if (reasoning_content) {
            if (g_is_first_thinking) {
              collect('<think>\n')
              g_start_thinking = true;
              g_is_first_thinking = false;
            }
            g_think += content;
            collect(reasoning_content);
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
 * yao run scripts.ai.tencent.Call "你好"
 * yao run scripts.ai.chatgpt_stream.Call '::{"prompt":"你好"}'
 * yao run scripts.ai.chatgpt_stream.Call '::{"prompt":"可以帮我找一下python学习资源吗","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 * yao run scripts.ai.chatgpt_stream.Call '::{"prompt":"廖雪峰的Python教程","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 *
 *  yao run scripts.chat.conversation.FindConversationById "938d58a4-b976-46b8-a342-7644a2566476"
 */
function Call(message) {
  if (typeof message == "string") {
    message = { prompt: message };
  }
  console.log("ai script message", message);
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

  return CallGpt(message, setting);

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
    setting.model = "deepseek-r1";
  }
  setting.model = "deepseek-r1";
  if (setting.api_token && setting.api_token == "sk-") {
    setting.api_token = "";
  }
  if (!setting.api_token) {
    const access_key = Process("yao.env.get", "COPILOT.TENCENT_TOKEN");
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

  // let stopword = GetStopWord(setting);
  let aiUserName = setting.ai_nickname;
  let endUserName = setting.user_nickname;

  //新对话

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
  console.log(RequestBody)
  // return
  // RequestBody = {
  //   // "max_tokens": 2048,
  //   "messages":
  //     [

  //       { "content": "必须用中文回答\n\n你好", "role": "system" },
  //       { "content": ask, "role": "user" },
  //     ],
  //   //  "msgs": [{
  //   //   "role": "user", "content": "你好", "extra":
  //   //     { "agent": "default", "cmd": "default", "related_file": {}, "context": {} }
  //   // }],
  //   // "stream": true,
  //   "model": "deepseek-r1",
  //   "n": 1,
  //   "presence_penalty": 0, "skip_special_tokens": false, "temperature": 0.1, "top_p": 1,
  //   "frequency_penalty": 0
  // };
  // setting.api_token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJteWZFenA3ODNLaV9KQ3g4Vm5jM1hfaXg2alpyYjZDZjVPTWtHWk1QSTNzIn0.eyJleHAiOjE3NzE1ODAxMTUsImlhdCI6MTc0MDA0NDExNiwiYXV0aF90aW1lIjoxNzQwMDQ0MTE1LCJqdGkiOiI1NmVjMjZlMi1jZDU2LTRkNDMtOWU0NC1lMWM0NmRkNjg1YmIiLCJpc3MiOiJodHRwczovL2NvcGlsb3QudGVuY2VudC5jb20vYXV0aC9yZWFsbXMvY29waWxvdCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIxYzUzODM4OC1hMzJlLTRhNWMtOTYyZS0yODcyZTBjY2JjODgiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJjb25zb2xlIiwic2lkIjoiNTBmMzg4MjMtNzE2Zi00YTQ2LTk2YzItNDEwODE5YWJiMGQ0IiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgb2ZmbGluZV9hY2Nlc3MgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5pY2tuYW1lIjoiVmluY2VudCIsInByZWZlcnJlZF91c2VybmFtZSI6ImQzODRlYWRhLWJmMjAtNDUwNS04MWM4LTU4OTNiZDJlMjJhYS12aW5jZW50In0.v-6nieB9Sqq948rQaP_tt0plJ_MOaLFOLC6aIEn3TcKR5snYB2CgktDJbEKbAJNB66fEHwEUOfbfgm0LZW_lOJWZUqstFGymWOdeBZ_G8OsJDcGCB5N_cxaHmWY-ZWkLztcNon4XvN7id1Pz8d3F-DIAwn-g22lp0ja8ZB30DS7L06muBXL2Rnah3E8o8_Xyq0-FkblRmJvI03inOeKlkdRRnDzXxgB0M68zQrNVK2S70czc63fqpqrXtta08hlY3unRKTtAfbKB1WVj8vJBuvVP0Gkmuo_dCqZtom6x-DnuArtLqHMOe3QtQD3_uZfESiFUwzWDnfkLCcQmws4-ew"

  // if (stopword) {
  //   RequestBody.stop = stopword;
  // }
  //   let url = "https://api.openai.com/v1/completions";
  setting.base_url = Process("yao.env.get", "COPILOT.TENCENT_HOST");
  let url = setting.base_url + "/chat/completions";

  if (typeof ssEvent === "function") {
    ssEvent("session_id", session_id);
  } else {
    console.log("session_id", session_id);
  }
  let err = http.Stream("POST", url, handler, RequestBody, null, {
    // Accept: "text/event-stream; charset=utf-8",
    "Content-Type": "application/json",
    Authorization: `Bearer ` + setting.api_token,
  });
  // console.log("err:,", err);
  if (err.code != 200) {
    console.log("err:,", err);

    throw new Exception(err.Message, err.code);
  }

  // // console.log("stream replay", reply);
  const endDate = new Date();
  const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
  let answer = g_message;
  let new_message = {
    conversation_id: conversationId,
    ai_user: aiUserName,
    end_user: endUserName,
    prompt: ask,
    model: setting.model,
    think: g_think,
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
    } catch (error) { }
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

// const { Process, http } = require("../remote/client");

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
 * yao-debug run scripts.ai.chatgpt.Call '::{"prompt":"你好"}'
 * yao-debug run scripts.ai.chatgpt.Call '::{"prompt":"可以帮我找一下python学习资源吗","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 * yao-debug run scripts.ai.chatgpt.Call '::{"prompt":"廖雪峰的Python教程","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 *
 *  yao-debug run scripts.ai.conversation.FindConversationById "938d58a4-b976-46b8-a342-7644a2566476"
 */
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
  if (!message || !message.prompt || !message.prompt.length) {
    return "请填写您的问题";
  }
  const ask = message.prompt;
  if (ask.length < 2) {
    return "请填写详细的问题";
  }
  //新会话
  let session_id = message.session_id;

  let conversationId = -1;
  let newMessages = [];
  if (session_id !== undefined) {
    const data = Process(
      "scripts.ai.conversation.FindConversationById",
      session_id
    );
    if (data) {
      conversationId = data.id;
      session_id = data.uuid;
      newMessages = data.messages || [];
    }
  }
  setting.user_nickname = setting.user_nickname || "用户";
  setting.ai_nickname = setting.ai_nickname || "AI智能助理";

  // console.log(setting);

  let stopword = GetStopWord(setting);
  // console.log("stopword:", stopword);
  let aiUserName = setting.ai_nickname;
  let endUserName = setting.user_nickname;

  //新对话
  let newSessionInitMessage; //= "提示:你叫" + chatGptName + "。\n";

  if (conversationId < 0) {
    const { uuid, id } = Process(
      "scripts.ai.conversation.NewConversation",
      ask
    );
    session_id = uuid;
    conversationId = id;
  }

  //   return;
  // Process(
  //   "scripts.ai.conversation.NewMessage",
  //   conversationId,
  //   endUserName,
  //   ask
  // );

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

  let prompt = "";
  if (newSessionInitMessage && newSessionInitMessage.length) {
    prompt = newSessionInitMessage;
  }
  conversation.map((line) => {
    if (line.prompt) {
      if (endUserName && endUserName.length) {
        prompt += endUserName + ": ";
      }

      prompt += line.prompt + "\n\n";
    }

    if (line.completion) {
      if (aiUserName && aiUserName.length) {
        prompt += aiUserName + ": ";
      }

      prompt += line.completion + "\n\n"; //+ stopword;
    }
  });
  if (aiUserName && aiUserName.length) {
    prompt += aiUserName + ": ";
  }

  const startDate = new Date();

  let RequestBody = {
    prompt: prompt,
    model: setting.model,
    max_tokens: setting.max_tokens,
    top_p: setting.top_p,
    // stop: stopword,
    temperature: setting.temperature,
    presence_penalty: setting.presence_penalty,
    frequency_penalty: setting.frequency_penalty,
  };
  if (stopword) {
    RequestBody.stop = stopword;
  }
  // console.log(setting.api_token);
  const reply = http.Post(
    "https://api.openai.com/v1/completions",
    RequestBody,
    null,
    null,
    {
      "Content-Type": "application/json",
      // 'Authorization': `Bearer ${$ENV.AI_API_KEY}`,
      Authorization: `Bearer ` + setting.api_token,
    }
  );
  const endDate = new Date();
  const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
  if (reply.code != 200) {
    return {
      message: reply.data.error.message,
      session_id,
    };
  }

  // will delete the '\n\n'
  let answer = reply.data.choices[0].text.trim();
  //删除第一个空行

  answer = answer.replace(/^\s*\n/, "");

  let new_message = {
    parent_id: conversationId,
    ai_user: aiUserName,
    end_user: endUserName,
    prompt: ask,
    completion: answer,
    prompt_len: ask.length,
    completion_len: answer.length,
    completion_tokens: reply.data.usage.completion_tokens,
    prompt_tokens: reply.data.usage.prompt_tokens,
    total_tokens: reply.data.usage.total_tokens,
    request_total_time: seconds,
    created: Process(
      "scripts.ai.model.convertUTCDateToLocalDate",
      reply.data.created
    ),
    model: reply.data.model,
    object: reply.data.object,
  };

  let newId = Process("scripts.ai.conversation.NewMessageObject", new_message);

  // console.log("newId:" + newId);
  // Process(
  //   "scripts.ai.conversation.NewMessage",
  //   conversationId,
  //   chatGptName,
  //   answer
  // );
  //   SaveLog(ask, answer);
  //   SaveLog2(setting);
  return {
    message: answer,
    session_id,
  };
}

function testTrimWord() {
  const ls =
    "\n\n1. 丽江古城夕照湖：位于云南省，是中国最著名的湖泊之一。\n2. 青海湖：位于青海省，是中国著名的湖泊之一，也是世界文化遗产。\n3. 洞庭湖：位于湖南省，是中国第一大淡水湖，也是中国最著名的湖泊之一。\n4. 天津渤海：位于天津市，是中国最大的沿海湾，也是中国最著名的湖泊之一。\n5. 小五台：位于山西省，是中国著名的湖泊之一，也是世界文化遗产之一。\n6. 合肥太湖：位于安徽省，是中国最大的内陆湖泊，也是中国最著名的湖泊之一。\n7. 洱海：位于云南省，是中国最大的湖泊，也是中国最著名的湖泊之一。";

  let answer = ls.trim();
  //删除第一个空行
  console.log("删除第一个空行:", answer);
  answer = answer.replace(/^\s*\n/, "");
  console.log();
  console.log(answer);
}
//testTrimWord();
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
  // const setting = {
  //   stop: '["endofword","endofword2"]',
  //   user_nickname: "Human",
  //   ai_nickname: "AI",
  // };
  // GetStopWord(setting);

  const setting2 = {
    access_count: 39,
    ai_nickname: "AI智能助理",
    api_token: "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",
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

function CurrentTime() {
  var date = new Date();
  // utc时间整时区

  date.setHours(date.getHours() + 8);
  // console.log(date.toISOString().slice(0, 19) + "Z08:00");
  return date.toISOString().slice(0, 19) + "Z08:00"; //北京时区
  // return newDate.toISOString().slice(0, 19).replace("T", " ");
  // return dateObj.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}
// CurrentTime();

function testTime() {
  var newDate = new Date();
  var timeoffset = -480; //newDate.getTimezoneOffset();

  var offset = timeoffset / 60;
  var hours = newDate.getHours();
  newDate.setHours(hours - offset);
  console.log(newDate.toISOString());
  console.log(newDate.toUTCString());
  console.log(newDate.toLocaleDateString());
  console.log(newDate.toISOString().slice(0, 19) + "Z08:00"); //北京时区
}
// testTime();
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

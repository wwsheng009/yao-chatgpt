// const { Process, http } = require("../remote/client");

/**
 * yao-debug run scripts.ai.chatgpt.Call '::{"prompt":"你好"}'
 * yao-debug run scripts.ai.chatgpt.Call '::{"prompt":"可以帮我找一下python学习资源吗","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 * yao-debug run scripts.ai.chatgpt.Call '::{"prompt":"廖雪峰的Python教程","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 *
 *  yao-debug run scripts.chat.conversation.FindConversationById "938d58a4-b976-46b8-a342-7644a2566476"
 */
/**
 * 处理post请求，并调用chatgpt接口
 * @param {object} message 消息文本
 * @returns
 */
function Call(message, setting) {
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
  let aiUserName = setting.ai_nickname;
  let endUserName = setting.user_nickname;

  //新对话
  let newSessionInitMessage = "提示:你叫" + aiUserName;

  if (conversationId < 0) {
    const { uuid, id } = Process(
      "scripts.chat.conversation.NewConversation",
      ask
    );
    session_id = uuid;
    conversationId = id;
  }

  newMessages.push({
    prompt: ask,
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

  let messages = [];
  if (newSessionInitMessage && newSessionInitMessage.length) {
    messages.push({ role: "system", content: newSessionInitMessage });
  }

  conversation.map((line) => {
    if (line.prompt) {
      messages.push({ role: "user", content: line.prompt });
    }
    if (line.completion) {
      messages.push({ role: "assistant", content: line.completion });
    }
  });
  let stopword = GetStopWord(setting);

  const startDate = new Date();
  let RequestBody = {
    //prompt: prompt,
    messages: messages,
    model: setting.model,
    max_tokens: setting.max_tokens,
    top_p: setting.top_p,
    temperature: setting.temperature,
    presence_penalty: setting.presence_penalty,
    frequency_penalty: setting.frequency_penalty,
  };
  if (stopword) {
    RequestBody.stop = stopword;
  }

  let url = "https://api.openai.com/v1/chat/completions";

  const reply = http.Post(url, RequestBody, null, null, {
    "Content-Type": "application/json",
    Authorization: `Bearer ` + setting.api_token,
  });
  const endDate = new Date();
  const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
  if (reply.code != 200) {
    return {
      message: reply.message,
      session_id,
    };
  }

  // will delete the '\n\n'
  let answer = reply.data.choices[0].message.content.trim();
  //删除第一个空行
  answer = answer.replace(/^\s*\n/, "");

  let new_message = {
    conversation_id: conversationId,
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

  let newId = Process(
    "scripts.chat.conversation.NewMessageObject",
    new_message
  );

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
// //testTrimWord();
// /**
//  * 获取stop word
//  * @param {Object} setting 设置
//  * @returns string
//  */
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

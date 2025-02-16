/**
 * 调用bot网页API
 * 基于浏览器会话信息调用API，仅用于测试，不建议生产环境使用
 * 因为该方式 稳定性不保证，当服务器或网页升级时可能导致调用失败
 */

let g_message = "";
let reply = null;
let g_message_id = "";
let g_conversation_id = "";
let g_reasoning_duration = -1;
// 搜索关键字
let g_search_queries = null;
let g_search_result = null;
let g_is_first_thinking = true;
let g_start_thinking = false;

let botHost = Process("yao.env.get", "BOT.HOST");

let message_id = "";
let event_id = "";
let retry_flag = "";


function collect(content) {
  g_message += content;

  if (typeof ssEvent === "function") {
    ssEvent("messages", content);
  } else {
    console.print(content);
  }
}

/**
 * 回调函数，处理payload数据
 * @param {object} payload - 数据
 * @returns {number} 状态码
 */
function handler(payload) {
  // console.log('>' + payload);
  log.Info(payload);

  const lines = payload.split("\n\n");
  for (const line of lines) {
    if (line === "" || !line) {
      continue;
    }

    if (line === "data: [DONE]") {
      return 0;
    } else if (line.startsWith("id: ")) {
      message_id = line.substring("id: ".length);
    } else if (line.startsWith("event: ")) {
      event_id = line.substring("event: ".length);
    } else if (line.startsWith("retry: ")) {
      retry_flag = line.substring("retry: ".length);
    } else if (line.startsWith("data: {")) {
      const myString = line.substring("data: ".length);
      try {
        let content = JSON.parse(myString);
        if (content) {

          if (content.type == "search_queries") {
            // 搜索关键字
            g_search_queries = content.message;
            return 1;
          } else if (content.type == "search_result") {
            // 搜索结果
            g_search_result = content.message;
            return 1;
          } else if (content.type == "reasoning_duration") {
            // 思考时间
            g_reasoning_duration = content.message
            return 1
          } else if (content.type == "reasoning_text") {
            // 思考的内容
            if (g_is_first_thinking) {
              collect('<think>\n')
              g_start_thinking = true;
              g_is_first_thinking = false;
            }
          }
          // 思考的内容
          let msg = content.message;
          if (msg) {
            collect(msg);
          }
        }
      } catch (error) {
        collect("errors:" + error.message);
        // throw new Exception(error.message, error.code);
        return -1;
      }
    } else if (line.startsWith("data: ")) {
      const content = line.substring("data: ".length);
      if (content.startsWith("MESSAGEID####")) {
        g_message_id = content.substring("MESSAGEID####".length);
        return 1
      } else if (content.startsWith("CONVERSATIONID####")) {
        g_conversation_id = content.substring("CONVERSATIONID####".length);
        return 1
      }
      if (g_start_thinking) {
        collect('</think>\n')
        g_start_thinking = false
      }

      if (content && content.length) {
        collect(content);
      } else {
        collect('\n');
      }
    } else {

      // console.log("unexpected:" + payload);
    }
  }
  //异常，返回-1
  //正常返回1，默认
  //中断返回0
  return 1;
}
/**
 * yao run scripts.ai.bot.Call '你好'
 *  yao run scripts.chat.conversation.FindConversationById "938d58a4-b976-46b8-a342-7644a2566476"
 */
function Call(prompt) {

  let message = prompt
  if (typeof prompt == "string") {
    if (!prompt || !prompt.length) {
      ssEvent("messages", "请填写您的问题");
      return "";
    }
    message = { prompt: prompt }
  }
  let setting = {}

  return CallGpt(message, setting);
}


/**
 * 处理post请求，并调用chatgpt接口
 * @param {object} message 消息文本
 * @returns
 */
function CallGpt(message, setting) {
  message = message || {};
  const ask = message.prompt;
  //新会话
  let session_id = message.session_id;

  let conversationId = -1;
  let conversation_id_str = undefined
  let newMessages = [];
  if (session_id !== undefined) {
    const data = Process(
      "scripts.chat.conversation.FindConversationById",
      session_id
    );
    if (data) {
      console.log('FindConversationById data,', data)
      conversationId = data.id;
      conversation_id_str = data.id_str;
      session_id = data.uuid;
      newMessages = data.messages || [];
      cookiestr = data.cookie
      //last message of th emssages
      if (newMessages.length > 0) {
        last_message_id = newMessages[0].message_id;
      }
    }
  }

  //新对话
  if (conversationId < 0) {
    const { uuid, id } = Process(
      "scripts.chat.conversation.NewConversation",
      ask
    );

    session_id = uuid;
    conversationId = id
  }
  console.log('conversationId', conversationId)

  const startDate = new Date();

  const RequestBody = {
    "role": "d43f3183de18d99c46bb7a4093413d0a",//deepseek-r1
    "prompt": message.prompt,
    "re_answer": 0,
    "retry": false,
    "last_id": 0,
    "compare_parent_id": "",
    "role_biz": "", "rewrite_type": "", "file": [], "annex_msg_id": "",
    "kwargs": { "think_stream": true },
    "is_so": false,//搜索
    conversation_id: conversation_id_str
  }


  let url = `${botHost}/api/assistant/chat`;

  if (typeof ssEvent === "function") {
    ssEvent("session_id", session_id);
  } else {
    console.log("session_id", session_id);
  }

  console.log("RequestBody:", RequestBody);
  //add cookie will store the conversation into user list
  let err = http.Stream("POST", url, handler, RequestBody, null, { ...createHeader() });
  if (err.code != 200) {
    console.log("err:,", err);
    throw new Exception(err.Message, err.code);
  }

  // console.log("stream replay", reply);
  const endDate = new Date();
  const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
  let answer = g_message;
  let new_message = {
    conversation_id: conversationId,
    ai_user: '',
    end_user: '',
    model: '',
    message_id: null,
    prompt: ask,
    completion: answer,
    prompt_len: ask.length,
    completion_len: answer.length,
    request_total_time: seconds,
    search_result: g_search_result,
  };
  if (reply != null) {
    new_message.created = Process(
      "scripts.ai.model.convertUTCDateToLocalDate",
      reply.created
    );
    new_message.model = reply.model;
    new_message.object = reply.object;
  }
  console.log("new_message:", new_message)
  Process("scripts.chat.conversation.NewMessageObject", new_message);
  Process('models.chat.conversation.update', conversationId, { id_str: g_conversation_id })
}


function getCookie() {
  return {
    Q: Process("yao.env.get", "BOT.Q"),
    T: Process("yao.env.get", "BOT.T")
  };
}
// 定义一个函数，用于将 cookie 对象转换为 cookie 字符串
function getCookieToString(cookie) {
  cookie = cookie || getCookie()
  // 使用 Object.entries 方法遍历 cookie 对象的键值对
  const cookiePairs = Object.entries(cookie).map(([key, value]) => {
    // 将键和值组合成 key=value 的形式
    return `${key}=${value}`;
  });
  // 使用 join 方法将所有键值对用分号和空格连接成一个字符串
  return cookiePairs.join('; ');
}

function createHeader() {
  const headers2 = Process("scripts.ai.bot_headers.getHeaders")
  return { ...headers2, "cookie": getCookieToString() }
}

function createValidFileName(text, options = {}) {
  const defaults = {
    maxLength: 255,          // 最大长度 
    separator: '_',          // 分隔符 
    keepPunctuation: false,  // 是否保留标点 
    trim: true               // 是否执行trim 
  };
  const config = { ...defaults, ...options };

  // 多行处理：获取首行并预处理 
  let processed = text.split(/\r?\n/)[0];

  // 中文友好处理流程 
  processed = processed
    // 阶段1：基础清洗 
    .replace(/[\x00-\x1F\x7F]/g, '')  // 删除控制字符 
    .replace(/[/\\:*?"<>|]/g, '')     // 过滤系统保留字符 

    // 阶段2：智能字符保留（扩展Unicode支持）es6不支持
    // .replace(new RegExp(
    //   `([^\\p{L}\\p{N}${config.keepPunctuation ? '\\p{P}' : ''}_-])`,
    //   'gu'
    // ), config.separator)

    // 阶段3：空白处理 
    .replace(/[\s\u3000]+/g, config.separator)   // 处理全/半角空格 

    // 阶段4：格式优化 
    .replace(new RegExp(`${config.separator}+`, 'g'), config.separator)
    .replace(new RegExp(`^${config.separator}+ |${config.separator}+$`, 'g'), '');

  // 添加保留名称检查 
  const reservedNames = ['CON', 'PRN', 'AUX'];
  if (reservedNames.includes(processed.toUpperCase())) {
    processed += '_file';
  }
  // 处理Unicode等价性 
  processed = processed.normalize('NFC');

  // 智能截断策略 
  const smartTruncate = (str) => {
    if (str.length <= config.maxLength) return str;
    const lastSeparator = str.lastIndexOf(config.separator, config.maxLength);
    return lastSeparator > 0
      ? str.slice(0, lastSeparator)
      : str.slice(0, config.maxLength);
  };

  return config.trim
    ? smartTruncate(processed).trim()
    : smartTruncate(processed);
}

// 输出：Multi-line_Example 
// yao run scripts.ai.bot.downloadConversation "d194dfdeed764a57a8aabecb7929436e"
function downloadConversation(conversation_id) {
  const data = getConversationById(conversation_id);

  let title = data.title;
  // update the title to valid file name
  title = createValidFileName(title)

  const messages = data.messages;

  let content = ""
  content += `# ${data.title}\n\n`

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];

    if (message.prompt) {
      content += `## 用户: \n\n${message.prompt}\n\n`
    }
    if (message.reasoning_text) {
      content += `## 思考(${message.apply_model})\n\n${message.reasoning_text}\n\n`
    }
    if (message.result) {
      content += `## 回复(${message.apply_model})\n\n${message.result}\n\n`
    }
  }
  const fname = "./bot/" + title + ".md"
  console.log(fname + " 保存成功")

  Process("fs.data.writefile", fname, content)
}



// get conversation history from server
//  yao run scripts.ai.bot.getHistory
function getHistory() {

  // cookie中的Q与T是必须的参数
  const res = http.Get(
    `${botHost}/api/assistant/conversation/history`, //不能再使用api key来访问dashboard对象，只能是在浏览器上登录后获取sess-key来访问
    {
      page_size: 100,
    },
    { ...createHeader() }
  );
  if (res.code != 200) {
    console.log(res)
    throw new Exception(res.message, res.code);
  }
  const data = res.data;
  if (data.code != null && data.code != 0) {
    console.log(res.msg)
    return
  }
  return data.data
}
// get conversation by id from server
//yao run scripts.ai.bot.getConversationById 3e673fa26acd481589c39509a7ca1bc9
//  todo 可能还需要考虑多页请求
function getConversationById(conversation_id) {
  const res = http.Get(
    `${botHost}/api/assistant/conversation/info`, //不能再使用api key来访问dashboard对象，只能是在浏览器上登录后获取sess-key来访问
    {
      conversation_id,
      page_size: 100,
    },
    { ...createHeader() }
  );
  if (res.code != 200) {
    console.log(res)
    throw new Exception(res.message, res.code);
  }

  if (res.data.code != null && res.data.code != 0) {
    console.log(res.data.msg)
  }
  return res.data.data
}

// delete session from server
//yao run scripts.ai.bot.removeConversationById '3e673fa26acd481589c39509a7ca1bc9'
function removeConversationById(conversation_id) {
  const res = http.Post(`${botHost}/api/batch/remove/conversation`,
    { cid: conversation_id },
    null,
    null,
    {
      ...createHeader(),
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    })
  if (res.code != 200) {
    console.log(res)
    throw new Exception(res.message, res.code);
  }
  return res.data
}

// download all conversation from server
//  yao run scripts.ai.bot.downloadAllConversation
function downloadAllConversation() {
  const conversations = getHistory().list
  for (let i = 0; i < conversations.length; i++) {
    const conversation = conversations[i];
    if (conversation.conversation_id == "90ac2df7ed5445aa816ef4e7d5c82e75") {
      // console.log(conversation.content),这里只返回了会话中最后的回复
      // console.log(conversation)
    }
    downloadConversation(conversation.conversation_id)
  }
}
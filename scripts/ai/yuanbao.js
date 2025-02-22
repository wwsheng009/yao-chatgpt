/**
 * 调用yuanbao网页API
 * 基于浏览器会话信息调用API，仅用于测试，不建议生产环境使用
 * 因为该方式 稳定性不保证，当服务器或网页升级时可能导致调用失败
 */

let g_message = "";
let reply = null;
let g_conversation_id = "";
let g_reasoning_duration = -1;
// 搜索关键字
let g_search_queries = null;
let g_search_result = null;
let g_is_first_thinking = true;
let g_start_thinking = false;

let aiHost = Process("yao.env.get", "YUANBAO.HOST");

let g_message_uuid = "";
let event_id = "";

let g_config = null;

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
  console.log('>' + payload);
  // log.Info(payload);
  // return 1;

  const lines = payload.split("\n\n");
  for (const line of lines) {
    if (line === "" || !line) {
      continue;
    }

    if (line === "data: [DONE]") {
      return 0;
    } else if (line.startsWith("event: ")) {
      event_id = line.substring("event: ".length);
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
          } else if (content.type == "think") {
            // 思考的内容
            if (g_is_first_thinking) {
              collect('<think>\n')
              g_start_thinking = true;
              g_is_first_thinking = false;
            }
            if (content.content) {//content.content may be null
              collect(content.content);
            }
          } else if (content.type == "text") {
            if (g_start_thinking) {
              collect('</think>\n')
              g_start_thinking = false
            }
            if (content.msg) {//content.msg may be null
              collect(content.msg);
            }
          } else if (content.type == "meta") {
            g_message_uuid = content.messageId;
          }
        }
      } catch (error) {
        collect("errors:" + error.message);
        return -1;
      }
    } else if (line.startsWith("data: ")) {
      const content = line.substring("data: ".length);

    } else {

    }
  }
  //异常，返回-1
  //正常返回1，默认
  //中断返回0
  return 1;
}
/**
 * yao run scripts.ai.yuanbao.Call '你好'
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

function getConfig() {
  if (g_config) {
    return g_config
  }
  g_config = {
    user_id: Process("yao.env.get", "YUANBAO.USER"),
    user_token: Process("yao.env.get", "YUANBAO.TOKEN"),
    agent_id: Process("yao.env.get", "YUANBAO.AGENT")
  };
  return g_config;
}

function getCookie() {
  const user = getConfig();
  return {
    // '_ga': 'GA1.2.780446765.1705569410',
    // 'pgv_pvid': '9141998332',
    // '_gcl_au': '1.1.361603410.1733307945',
    'hy_source': 'web',
    'hy_user': user.user_id,
    'hy_token': user.user_token,
    // '_qimei_uuid42': '192151534241001b1b0a8dcc4a5704f2cd1126172b',
    // '_qimei_fingerprint': '3eebf7f6a2655f2fc879afbd99a854c4',
    // '_qimei_i_3': '44ee7585c35b0488c0c1f9340f8771e7f3e8f6a5475f01d7e7db7d517394246d646564943c89e2bd89bc',
    // '_qimei_h38': 'e06d72ef1b0a8dcc4a5704f202000007019215',
    // '_qimei_i_1': '54cd4fd7955c04dcc3c2a831098422e8a3bdf7f5435e0482b0d92a582493206c616330953980e0ddd3bde6f0',
    // 'sensorsdata2015jssdkcross': '%7B%22distinct_id%22%3A%22100009575785%22%2C%22first_id%22%3A%2218d1bdbd8cd568-08f140436c82a2-4c657b58-2359296-18d1bdbd8ce15fb%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%A4%BE%E4%BA%A4%E7%BD%91%E7%AB%99%E6%B5%81%E9%87%8F%22%2C%22%24latest_utm_medium%22%3A%22cpc%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThkMWJkYmQ4Y2Q1NjgtMDhmMTQwNDM2YzgyYTItNGM2NTdiNTgtMjM1OTI5Ni0xOGQxYmRiZDhjZTE1ZmIiLCIkaWRlbnRpdHlfbG9naW5faWQiOiIxMDAwMDk1NzU3ODUifQ%3D%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%22100009575785%22%7D%2C%22%24device_id%22%3A%2218d1bdbd8cd568-08f140436c82a2-4c657b58-2359296-18d1bdbd8ce15fb%22%7D'

    // 'sensorsdata2015jssdkcross': '{"distinct_id":"100009575785","first_id":"18d1bdbd8cd568-08f140436c82a2-4c657b58-2359296-18d1bdbd8ce15fb","props":{"$latest_traffic_source_type":"社交网站流量","$latest_utm_medium":"cpc"},"identities":"eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThkMWJkYmQ4Y2Q1NjgtMDhmMTQwNDM2YzgyYTItNGM2NTdiNTgtMjM1OTI5Ni0xOGQxYmRiZDhjZTE1ZmIiLCIkaWRlbnRpdHlfbG9naW5faWQiOiIxMDAwMDk1NzU3ODUifQ==","history_login_id":{"name":"$identity_login_id","value":"100009575785"},"$device_id":"18d1bdbd8cd568-08f140436c82a2-4c657b58-2359296-18d1bdbd8ce15fb"}'
  };
}

function getCookieToString(cookie) {
  cookie = cookie || getCookie()
  // 使用 Object.entries 方法遍历 cookie 对象的键值对
  const cookiePairs = Object.entries(cookie).map(([key, value]) => {
    // 将键和值组合成 key=value 的形式
    return `${key}=${value}`;
  });
  // 使用 join 方法将所有键值对用分号和空格连接成一个字符串
  console.log(cookiePairs.join('; '))
  return cookiePairs.join('; ');
}
function createHeader() {
  const config = getConfig();
  return {
    "Content-Type": "application/json",
    'cookie': getCookieToString(),//most important
    // options
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "cache-control": "no-cache",
    "dnt": "1",
    "origin": "https://yuanbao.tencent.com",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "referer": `https://yuanbao.tencent.com/chat/${config.agent_id}`,
    "sec-ch-ua": '"Not(A:Brand";v="99", "Microsoft Edge";v="133", "Chromium";v="133"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "t-userid": config.user_id,
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "x-agentid": config.agent_id,
    // "x-commit-tag": "",
    "x-id": config.user_id,
    "x-requested-with": "XMLHttpRequest",
    "x-source": "web",
  };
}

function checkResponse(res) {
  if (res.code != 200) {
    const sType = res.headers['Content-Type'][0];
    if ((sType.indexOf("text/html") > -1 || sType.indexOf("text/plain") > -1) && res.data) {
      res.message = Process('encoding.base64.Decode', res.data);
    }
    console.log(res);
    throw new Exception(res.message, res.code);
  }
}
//yao run scripts.ai.yuanbao.createSession
function createSession() {
  const config = getConfig
  const res = http.Post(`${aiHost}/api/user/agent/conversation/create`, { "agentId": config.agetn_id }, null, null, createHeader())

  checkResponse(res);
  const cookies = res.headers['Set-Cookie'] || [];
  const sessionId = res.data?.id;
  return { sessionId, cookies };
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
  let cookiestr = null;

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
    const { sessionId, cookies } = createSession();
    cookiestr = cookies.map(cookie => cookie.split(';')[0]).join(';');

    const { id } = Process(
      "scripts.chat.conversation.NewConversation",
      ask,
      sessionId,
      { cookie: cookiestr }
    );

    session_id = sessionId;
    conversationId = id
  }
  // console.log('conversationId', conversationId)

  const startDate = new Date();

  let config = getConfig();
  const RequestBody = {
    model: "gpt_175B_0404",//deepseek-r1
    prompt: ask,
    plugin: "Adaptive",
    displayPrompt: "你好",
    displayPromptType: 1,
    options: {
      imageIntention: {
        needIntentionModel: true,
        backendUpdateFlag: 2,
        intentionStatus: true
      }
    },
    multimedia: [],
    agentId: config.agent_id,//元宝
    supportHint: 1,
    version: "v2",
    chatModelId: "deep_seek",//深度思考，deep_seek_v3非深度思考
    supportFunctions: ["supportInternetSearch"]//联网搜索
  };

  let url = `${aiHost}/api/chat/${session_id}`;

  if (typeof ssEvent === "function") {
    ssEvent("session_id", session_id);
  } else {
    console.log("session_id", session_id);
  }

  console.log("RequestBody:", RequestBody);
  //add cookie will store the conversation into user list
  let err = http.Stream("POST", url, handler, RequestBody, null, { ...createHeader() });
  checkResponse(res);

  // console.log("stream replay", reply);
  const endDate = new Date();
  const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
  let answer = g_message;
  let new_message = {
    conversation_id: conversationId,
    ai_user: '',
    end_user: '',
    model: '',
    message_uuid: g_message_uuid,
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
  // Process('models.chat.conversation.update', conversationId, { id_str: g_conversation_id })
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
// yao run scripts.ai.yuanbao.downloadConversation "1699ed73-bcaf-467c-8a9f-07263f9d8045"
function downloadConversation(conversation_id) {
  console.log(`下载会话：${conversation_id}`)
  const data = getConversationById(conversation_id);

  let title = data.title;
  title = createValidFileName(title)

  const messages = data.convs;
  if (!messages) {
    console.log("No messages found.");
    return;
  }
  console.log(data)

  let content = ""
  content += `# ${data.title}\n\n`
  if (subTitle) {
    content += `## ${data.subTitle}\n\n`
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];

    if (message.speech && message.speaker == "human") {
      content += `## 用户: \n\n${message.speech}\n\n`
    }
    if (message.speaker == "ai") {
      let submessage = message.speechesV2[0].content;
      if (!submessage) {
        continue;
      }
      for (let j = 0; j < submessage.length; j++) {
        const sub = submessage[j];
        if (sub.type == "think") {
          content += `## 思考\n\n${sub.content}\n\n`
        } else if (sub.type == "text") {
          content += `## 回复\n\n${sub.msg}\n\n`
        }
      }
    }

  }
  const fname = "./yuanbao/" + title + ".md"
  console.log(fname + " 保存成功")

  Process("fs.data.writefile", fname, content)
}



// get conversation history from server
//  yao run scripts.ai.yuanbao.getHistory
function getHistory() {
  const config = getConfig()
  const res = http.Post(
    `${aiHost}/api/user/agent/conversation/list`,
    {
      "agentId": config.agetn_id,
      "offset": 0,
      "limit": 40,
      "filterGoodQuestion": true
    },
    null,
    null,
    { ...createHeader() }
  );
  checkResponse(res);

  return res.data
}
//yao run scripts.ai.yuanbao.getConversationById 8ec9ce96-0997-4520-b804-3d82e777ee94
//  todo 可能还需要考虑多页请求
function getConversationById(conversationId) {
  const res = http.Post(
    `${aiHost}/api/user/agent/conversation/v1/detail`,
    {
      conversationId,
      limit: 100,
      offset: 0
    },
    null,
    null,
    { ...createHeader() }
  );
  checkResponse(res);

  return res.data
}

// delete session from server
//yao run scripts.ai.yuanbao.removeConversationById '9f26d81d-4bd5-4b6b-8212-6c86d2d3b8b9'
function removeConversationById(conversation_id) {
  const res = http.Post(`${aiHost}/api/user/agent/conversation/v1/clear`,
    { conversationIds: [conversation_id] },
    null,
    null,
    {
      ...createHeader(),
      "Content-Type": "application/json"
    })
  checkResponse(res);

  return res.data
}

// download all conversation from server
//  yao run scripts.ai.yuanbao.downloadAllConversation
function downloadAllConversation() {
  const conversations = getHistory().conversations
  for (let i = 0; i < conversations.length; i++) {
    const conversation = conversations[i];

    downloadConversation(conversation.id)
  }
}
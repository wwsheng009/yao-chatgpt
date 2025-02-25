/**
 * call the deepseek webpage api
 */

let g_message = "";
let reply = null;
let g_message_id = null
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

function getDeepSeekKey() {
  const access_key = Process("yao.env.get", "DEEPSEEK_KEY");
  return access_key;
}
/**
 * 回调函数
 * @param {object} payload 数据
 * @returns
 */
function handler(payload) {
  console.log('>' + payload);

  return;
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
          g_message_id = message.message_id
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
 * yao run scripts.ai.deepseek.Call '你好'
 * yao run scripts.ai.deepseek.Call '::{"prompt":"你好"}'
 * yao run scripts.ai.deepseek.Call '::{"prompt":"可以帮我找一下python学习资源吗","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 * yao run scripts.ai.deepseek.Call '::{"prompt":"廖雪峰的Python教程","session_id":"938d58a4-b976-46b8-a342-7644a2566476"}'
 *
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

function deleteSession(session_id) {

  const headers = {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    authorization: 'Bearer ' + getDeepSeekKey(),
    'Content-Type': 'application/json',
    'x-ds-pow-response': Process("yao.env.get", "DEEPSEKK_POW"),
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
  };
  const res = http.Post('https://chat.deepseek.com/api/v0/chat_session/create', { chat_session_id: session_id }, null, null, headers)

  if (res.code != 200) {
    throw new Exception(res.message, res.code);
  }
}
/**
 * yao run scripts.ai.deepseek.createSession
 * @returns 
 */
function createSession() {

  const res = http.Post('https://chat.deepseek.com/api/v0/chat_session/create', { character_id: null }, null, null, createheader())

  if (res.code != 200) {
    console.log(res)
    if (res.headers['Content-Type'][0].indexOf("text/html") > -1 && res.data) {
      msg = Process('encoding.base64.Decode', res.data);
      console.log(msg);
    }
    throw new Exception(res.message, res.code);
  }
  const cookies = res.headers['Set-Cookie'] || [];
  const biz_data = res.data?.data?.biz_data;
  const sessionId = biz_data?.id;
  return { sessionId, cookies };
}

const pow = create_pow_challenge();
// yao run scripts.ai.deepseek.create_pow_challenge
function create_pow_challenge() {


  //deepseek通过使用wsamp算法生成pow挑战，保证了api的安全性和可用性。

  const headers = {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    authorization: 'Bearer ' + getDeepSeekKey(),
    'Content-Type': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
  };
  const res = http.Post('https://chat.deepseek.com/api/v0/chat/create_pow_challenge',
    { "target_path": "/api/v0/chat/completion" },
    null, null, headers
  )

  if (res.code != 200) {
    throw new Exception(res.message, res.code);
  }

  const challenge = res.data?.data?.biz_data?.challenge
  console.log('challenge', challenge)

  // let hashValue = function (challenge) {
  //   let { algorithm: t, challenge: n, salt: r, difficulty: o, signature: i, expireAt: a } = e.data.challenge;
  //   function u(e, t, n) {
  //     if (void 0 === n) {
  //       let n = c.encode(e)
  //         , r = t(n.length, 1) >>> 0;
  //       return a().subarray(r, r + n.length).set(n),
  //         o = n.length,
  //         r
  //     }
  //     let r = e.length
  //       , i = t(r, 1) >>> 0
  //       , u = a()
  //       , f = 0;
  //     for (; f < r; f++) {
  //       let t = e.charCodeAt(f);
  //       if (t > 127)
  //         break;
  //       u[i + f] = t
  //     }
  //     if (f !== r) {
  //       0 !== f && (e = e.slice(f)),
  //         i = n(i, r, r = f + 3 * e.length, 1) >>> 0;
  //       let t = s(e, a().subarray(i + f, i + r));
  //       f += t.written,
  //         i = n(i, r, f, 1) >>> 0
  //     }
  //     return o = f,
  //       i
  //   }
  //   function l() {
  //     return (null === f || !0 === f.buffer.detached || void 0 === f.buffer.detached && f.buffer !== r.memory.buffer) && (f = new DataView(r.memory.buffer)),
  //       f
  //   }
  //   const w = (e, t, n, i, a) => {
  //     if ("DeepSeekHashV1" !== e)
  //       throw Error("Unsupported algorithm: " + e);
  //     let c = "".concat(n, "_").concat(a, "_")
  //       , s = function (e, t, n) {
  //         try {
  //           // 这里使用wasm的某种加密算法
  //           let c = r.__wbindgen_add_to_stack_pointer(-16)
  //             , s = u(e, r.__wbindgen_export_0, r.__wbindgen_export_1)
  //             , f = o
  //             , d = u(t, r.__wbindgen_export_0, r.__wbindgen_export_1)
  //             , p = o;
  //           r.wasm_solve(c, s, f, d, p, n);
  //           var i = l().getInt32(c + 0, !0)
  //             , a = l().getFloat64(c + 8, !0);
  //           return 0 === i ? void 0 : a
  //         } finally {
  //           r.__wbindgen_add_to_stack_pointer(16)
  //         }
  //       }(t, c, i);
  //     if (!s)
  //       throw Error("No solution found: " + "algorithm: ".concat(e, ", ") + "challenge: ".concat(t, ", ") + "difficulty: ".concat(i, ", ") + "prefix: ".concat(c));
  //     return s
  //   }
  //   let e = w(t, n, r, o, a);
  // }


  const bot = btoa(JSON.stringify({
    algorithm: challenge.algorithm,
    challenge: challenge.challenge,
    salt: challenge.salt,
    answer: 0,//hashValue(challenge),
    signature: challenge.signature,
    target_path: challenge.target_path
  }
  ));

  return bot
}


function createheader() {

  const headers = {
    // 'Accept': '*/*',
    // 'accept': '*/*',
    'Connection': 'keep-alive',
    'sec-ch-ua-full-version-list': `"Not(A:Brand";v="99.0.0.0", "Microsoft Edge";v="133.0.3065.82", "Chromium";v="133.0.6943.127"`,
    'sec-ch-ua-platform': `"Windows"`,
    'Authorization': 'Bearer ' + getDeepSeekKey(),
    'sec-ch-ua': `"Not(A:Brand";v="99", "Microsoft Edge";v="133", "Chromium";v="133"`,
    'sec-ch-ua-bitness': `"64"`,
    'sec-ch-ua-model': `""`,
    'sec-ch-ua-mobile': '?0',
    'X-DS-PoW-Response': pow,
    'sec-ch-ua-arch': `"x86"`,
    'sec-ch-ua-full-version': `"133.0.3065.82"`,
    'Content-Type': 'application/json',
    'content-type': 'application/json',
    'x-client-locale': 'zh_CN',
    'x-app-version': '20241129.1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
    'x-client-version': "1.0.0-always",
    'DNT': 1,
    'x-client-platform': 'web',
    'sec-ch-ua-platform-version': `"19.0.0"`,
    'Origin': 'https://chat.deepseek.com',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://chat.deepseek.com/',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Cookie': `intercom-device-id-guh50jw4=c1b3e117-e3e4-4639-82b6-f8a0d63549dc; Hm_lvt_fb5acee01d9182aabb2b61eb816d24ff=1739677239,1739768107,1740063210,1740449403; cf_clearance=MPl3.iC6D32G82QeH2EowIKdD3R5n2ehRXi_JGY4Yyg-1740461898-1.2.1.1-REOsVNqLpBR.kVCERHU0i48.6lPeeJ5dyGHWZJxWm3YyfMygcE4WiSykcalyxTtpnaxhUXcLJ8VjtztiAqgvzR7APvw2l9ey9WCzdaT3xrEUSsipLcsPf0CDi2SYOcdYKuObU.DQebUsNtvlH1o2uqBnx4hYf4QmCf7xis_S4imZczLrf85.S9tjjnOUqbNheCWbgzHOWihyJ0MVV_sCenyNZO1BZxJyWsfRyW0W6SO6OxQ.9WSS891tYKzQv3oXfWn5jFqpEaxDXL9KHVIOaPS4gn88lUYQIM4ve15HJdc; intercom-session-guh50jw4=RDhmUmpyTTZWbWxZTHYxN1prN296Y28raThCSXhBNGdNelNnQ3ZPaXRLRE1FVkI2ZzBEVlY1Q2hNWHNRTDlzRmpuTXNReVVUeVBDV0V3dHhFcnVZbnhEL1YwUVQrVzcrei8yTlNCZ0ozUk09LS1Rc2hLQlBlNzdySTMzNEQyNGpGcWFBPT0=--e4cddfc251b4ad0705fc29af1a0b4d0cbe3a25c2; HWWAFSESTIME=1740483954684; HWWAFSESID=edb0c6675b58c3a1189; ds_session_id=6251febe806d408b985cddfc93115952`
  };
  return headers


  return {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "authorization": "Bearer yOjRg3qK5WVT5Rake1E0xPd6pVxIcWBNFtyHfF6CmpA0kTl5kUflQtvSoGBSghxm",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "Content-Type": "application/json",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Microsoft Edge\";v=\"133\", \"Chromium\";v=\"133\"",
    "sec-ch-ua-arch": "\"x86\"",
    "sec-ch-ua-bitness": "\"64\"",
    "sec-ch-ua-full-version": "\"133.0.3065.82\"",
    "sec-ch-ua-full-version-list": "\"Not(A:Brand\";v=\"99.0.0.0\", \"Microsoft Edge\";v=\"133.0.3065.82\", \"Chromium\";v=\"133.0.6943.127\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": "\"\"",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-ch-ua-platform-version": "\"19.0.0\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-app-version": "20241129.1",
    "x-client-locale": "zh_CN",
    "x-client-platform": "web",
    "x-client-version": "1.0.0-always",
    "x-ds-pow-response": pow,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',

  }
}

//yao run scripts.ai.deepseek.x1
function x1() {

  console.log(btoa('{"algorithm":"DeepSeekHashV1","challenge":"ef4e025324da7eb650e5e317bc3c0f98abafd8afc684f8bf9b71267d2c23ddbe","salt":"18bc04a72f6d11014444","answer":43777,"signature":"639b43301510146b5fa89c6ab9efe9c6574601a4729fbd22637c8be6bc94763b","target_path":"/api/v0/chat/completion"}'
  ))
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
  let last_message_id = null;
  let newMessages = [];
  if (session_id !== undefined) {
    const data = Process(
      "scripts.chat.conversation.FindConversationById",
      session_id
    );
    if (data) {
      console.log('FindConversationById data,', data)
      conversationId = data.id;
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
    console.log('cookiestr', cookiestr)
    const { id } = Process(
      "scripts.chat.conversation.NewConversation",
      ask,
      sessionId,
      { cookie: cookiestr }
    );

    session_id = sessionId;
    conversationId = id;
  }


  const startDate = new Date();

  const RequestBody = {
    chat_session_id: "47dfd12e-75e2-477a-aca6-b6c1be6992fd",//session_id,//"2a72c62d-c07c-4f51-be08-263cae29d403",
    parent_message_id: last_message_id || null,
    prompt: message.prompt,
    ref_file_ids: [],
    thinking_enabled: false,
    search_enabled: false,
  }

  let url = "https://chat.deepseek.com/api/v0/chat/completion";

  if (typeof ssEvent === "function") {
    ssEvent("session_id", session_id);
  } else {
    console.log("session_id", session_id);
  }




  console.log("RequestBody:", RequestBody);
  let err = http.Stream("POST", url, handler, RequestBody, null, createheader());

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
    message_id: g_message_id,
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

// yao run scripts.ai.deepseek.downloadChatHistory 79f3aa44-31fa-472c-859a-5cd1707a081c
function downloadChatHistory(chatSessionId) {

  // 配置请求头
  const headers = {
    'Accept': '*/*',
    'Authorization': 'Bearer ' + getDeepSeekKey(),
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'X-Client-Locale': 'zh_CN',
    'X-App-Version': '20241129.1',
    'X-Client-Version': '1.0.0-always',
    'X-Client-Platform': 'web',
    'DNT': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0'
  };

  // 构建API URL
  const url = `https://chat.deepseek.com/api/v0/chat/history_messages?chat_session_id=${chatSessionId}`;

  // 发送请求
  const reply = http.Get(url, null, headers)

  // console.log(arrs.values)
  if (reply.code != 200) {
    throw new Exception(reply.data.error.message);
    // return reply.data.error.message
  }
  let data = reply.data;
  // 解析JSON响应

  // 检查API响应代码
  if (data.code !== 0) {
    throw new Error(`API error: ${data.msg}`);
  }

  // 提取聊天数据
  const chatData = data.data.biz_data;
  const messages = chatData.chat_messages;

  // 格式化聊天内容
  // const formattedChat = {
  //   session: {
  //     id: chatData.chat_session.id,
  //     title: chatData.chat_session.title,
  //     created: new Date(chatData.chat_session.inserted_at * 1000).toLocaleString(),
  //     updated: new Date(chatData.chat_session.updated_at * 1000).toLocaleString()
  //   },
  //   messages: messages.map(msg => ({
  //     id: msg.message_id,
  //     role: msg.role,
  //     content: msg.content,
  //     timestamp: new Date(msg.inserted_at * 1000).toLocaleString(),
  //     tokenUsage: msg.accumulated_token_usage
  //   }))
  // };

  // 构建Markdown内容

  // 构建Markdown内容
  let markdownContent = `# 聊天记录 - ${chatData.chat_session.title}\n\n`;
  markdownContent += `**会话ID**: ${chatData.chat_session.id}\n\n`;
  markdownContent += `**创建时间**: ${new Date(chatData.chat_session.inserted_at * 1000).toLocaleString()}\n\n`;
  markdownContent += `**最后更新**: ${new Date(chatData.chat_session.updated_at * 1000).toLocaleString()}\n\n`;
  markdownContent += `## 消息记录\n\n`;

  messages.forEach(msg => {
    const role = msg.role === 'USER' ? '用户' : '助理';
    markdownContent += `### 消息 #${msg.message_id} - ${role}\n\n`;
    // markdownContent += `**时间**: ${new Date(msg.inserted_at * 1000).toLocaleString()}\n\n`;
    // markdownContent += `**Token使用量**: ${msg.accumulated_token_usage}\n\n`;

    // 如果存在thinking_content，先添加思考过程
    if (msg.thinking_content) {
      markdownContent += `#### 思考过程\n\n`;
      markdownContent += `${msg.thinking_content}\n\n`;
      markdownContent += `**思考耗时**: ${msg.thinking_elapsed_secs}秒\n\n`;
    }

    // 添加消息内容
    markdownContent += `#### 内容\n\n`;
    markdownContent += `${msg.content}\n\n`;

    // 如果存在文件，添加文件信息
    if (msg.files && msg.files.length > 0) {
      markdownContent += `#### 附件\n\n`;
      msg.files.forEach(file => {
        markdownContent += `- **文件名**: ${file.file_name}\n`;
        markdownContent += `  **文件大小**: ${file.file_size}字节\n`;
        markdownContent += `  **Token使用量**: ${file.token_usage}\n`;
        markdownContent += `  **上传时间**: ${new Date(file.inserted_at * 1000).toLocaleString()}\n\n`;
      });
    }

    markdownContent += `---\n\n`;
  });


  let title = chatData.chat_session.title;
  // update the title to valid file name
  title = createValidFileName(title)

  // return formattedChat;
  const fname = "./deepseek/" + title + ".md"
  console.log(fname + " 保存成功")

  Process("fs.data.writefile", fname, markdownContent)
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
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
  // console.log('>' + payload);

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
  const headers = {

    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'cookie': 'HWWAFSESID=6205db7a9a93cabd30d; HWWAFSESTIME=1739075355070; ds_session_id=4068729b423246bc8091241da6d5ed62; __cf_bm=VzVY8yIDNvs5sIiMuTCo0X6Q7gUSrKimfjNZCvsDKro-1739075357-1.0.1.1-u7Aaztbbu_VCqUHH_GdRBWOH6HZ89lU5Fl5Y4udV2pi8yX8Q4J_8KR7Ec7jMyMqoyDAzKj3dTqVwqJ1_cTdiaA; intercom-device-id-guh50jw4=c1b3e117-e3e4-4639-82b6-f8a0d63549dc; Hm_lvt_fb5acee01d9182aabb2b61eb816d24ff=1738557363,1738846569,1739070069,1739075381; Hm_lpvt_fb5acee01d9182aabb2b61eb816d24ff=1739075381; HMACCOUNT=BDD388FE392D28D7; intercom-session-guh50jw4=YWthM2EyaVhWWjRTUjZtTzI1dFEzWXNMLzBUZWlGMGZlbTJLQTZzMW5VL0oxWDRNaE03ay9Mb01MM3hndXVNQk5sMEk1Yi9HNDUxdHgrTi96ZHRBNlYrMVNiVlo1dXhDM2NiLzlUblFTRm89LS1SUDkva081V3dPRkhxQm5FZWg0Vyt3PT0=--923a5c8a19c4fc61e558f8ced9a5ee494e45572f',
    'dnt': '1',
    'origin': 'https://chat.deepseek.com',
    'priority': 'u=1, i',
    'referer': 'https://chat.deepseek.com/a/chat/s/7c41ecf8-fad1-4d68-a8fe-396cf0c74e7a',
    'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
    'sec-ch-ua-arch': "x86",
    'sec-ch-ua-bitness': "64",
    'sec-ch-ua-full-version': "132.0.2957.140",
    'sec-ch-ua-full-version-list': '"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.6834.160", "Microsoft Edge";v="132.0.2957.140"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': "",
    'sec-ch-ua-platform': "Windows",
    'sec-ch-ua-platform-version': "19.0.0",
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
    'x-app-version': '20241129.1',
    'x-client-locale': 'zh_CN',
    'x-client-platform': 'web',
    'x-client-version': '1.0.0-always',
    authorization: 'Bearer ' + getDeepSeekKey(),
    'Content-Type': 'application/json',
    'x-ds-pow-response': Process("yao.env.get", "DEEPSEKK_POW"),
  };
  const res = http.Post('https://chat.deepseek.com/api/v0/chat_session/create', { character_id: null }, null, null, headers)

  if (res.code != 200) {
    if (res.headers['Content-Type'][0].indexOf("text/html") > -1 && res.data) {
      msg = Process('encoding.base64.Decode', res.data);
      console.log(msg);
    }
    throw new Exception(res.message, res.code);
  }
  //   "Set-Cookie": [
  //     "HWWAFSESID=09956f49d230e854fe7; path=/",
  //     "HWWAFSESTIME=1738804006336; path=/"
  // ],
  const cookies = res.headers['Set-Cookie'] || [];
  //build the cookie string from set-cookie,get the first part from the array like cookie: HWWAFSESID=09956f49d230e854fe7;HWWAFSESTIME=1738804006336



  // {
  //     "code": 0,
  //     "data": {
  //         "biz_code": 0,
  //         "biz_data": {
  //             "agent": "chat",
  //             "character": null,
  //             "current_message_id": null,
  //             "id": "99e2c223-334f-4192-bc86-5d481a8f0a49",
  //             "inserted_at": 1738804009.387523,
  //             "seq_id": 1000033,
  //             "title": null,
  //             "title_type": null,
  //             "updated_at": 1738803587.697362,
  //             "version": 0
  //         },
  //         "biz_msg": ""
  //     },
  //     "msg": ""
  // }
  const biz_data = res.data?.data?.biz_data;
  const sessionId = biz_data?.id;
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
    chat_session_id: session_id,//"2a72c62d-c07c-4f51-be08-263cae29d403",
    parent_message_id: last_message_id || null,
    prompt: message.prompt,
    ref_file_ids: [],
    thinking_enabled: true,
    search_enabled: true,
  }

  let url = "https://chat.deepseek.com/api/v0/chat/completion";

  if (typeof ssEvent === "function") {
    ssEvent("session_id", session_id);
  } else {
    console.log("session_id", session_id);
  }

  const headers = {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    authorization: 'Bearer ' + getDeepSeekKey(),
    'Content-Type': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
    'x-ds-pow-response': Process("yao.env.get", "DEEPSEKK_POW"),
    'cookie': cookiestr,
  };

  console.log("RequestBody:", RequestBody);
  let err = http.Stream("POST", url, handler, RequestBody, null, headers);
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
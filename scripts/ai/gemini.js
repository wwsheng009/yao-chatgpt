let g_message = "";

function collect(content) {
  // console.log(`content:${content}`);
  if (typeof ssEvent === "function") {
    ssEvent("message", content);
  } else {
    console.log("send message:", content);
  }
}
/**
 * 回调函数
 * @param {object} payload 数据
 * @returns
 */
function handler(payload) {
  const lines = payload.split("\n\n");
  for (const line2 of lines) {
    const line = line2;
    if (line === "") {
      continue;
    }
    if (line === "data: [DONE]") {
      collect("[DONE]");
      return 0;
    } else if (line.startsWith("data:")) {
      const myString = line.substring(5);
      try {
        let message = JSON.parse(myString);
        if (message) {
          reply = message;
          let content = message.candidates[0].content.parts[0].text;
          if (content != null) {
            g_message += content;
            collect(content);
          }
        }
      } catch (error) {
        console.log("error:>>>>>", error.Error);
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
//yao run scripts.ai.gemini.test
function test() {
  const API_KEY = Process("yao.env.get", "GOOGLE_GEMINI_API_ACCESS_KEY");
  const GEMNI_API_HOST = Process("yao.env.get", "GOOGLE_GEMINI_API_HOST");
  const url = `${GEMNI_API_HOST}/v1beta/models/gemini-pro:streamGenerateContent?key=${API_KEY}&alt=sse`;
  const RequestBody = {
    contents: [
      { parts: [{ text: "Write long a story about a magic backpack." }] },
    ],
  };
  let err = http.Stream("POST", url, handler, RequestBody, null, {
    Accept: "text/event-stream; charset=utf-8",
    "Content-Type": "application/json",
  });
  if (err.code != 200) {
    throw new Exception(err.Message, err.code);
  }
}

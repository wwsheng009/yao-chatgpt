const { ExCallGpt } = Require("ai.stream2");

//chat session
function session() {
  const access_key = Process("yao.env.get", "YAO_CHAT_API_KEY");
  let hasAuth = false;
  if (access_key) {
    hasAuth = true;
  }
  return {
    status: "Success",
    message: "",
    data: { auth: hasAuth, model: "gpt-4" },
  };
}

//chat process stream
// yao run scripts.chatweb.process '::{"prompt":"测试"}'
function process(payload) {
  let sample = {
    prompt: "",
    options: {
      conversationId: "",
      parentMessageId: "",
    },
    systemMessage: "",
    temperature: "",
    top_p: "",
  };
  Object.assign(sample, payload);
  // console.log("sample", sample);
  ExCallGpt({
    prompt: sample.prompt,
    session_id: sample.options.conversationId,
  });
}

//config
// yao run scripts.chatweb.config
function config() {
  return {
    status: "Success",
    data: {
      apiModel: "",
      reverseProxy: "",
      socksProxy: "",
      httpsProxy: "",
      balance: "",
      timeoutMs: 1000,
    },
  };
}

// yao run scripts.chatweb.credit_grants
function credit_grants() {
  const access_key = Process("yao.env.get", "OPEN_API_ACCESS_KEY2");

  const res = Process(
    "http.get",
    "https://api.openai.com/dashboard/billing/credit_grants", //不能再使用api key来访问dashboard对象，只能是在浏览器上登录后获取sess-key来访问
    "",
    {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_key,
    }
  );
  //  "Your request to GET /dashboard/billing/usage must be made with a session key
  //  (that is, it can only be made from the browser). You made it with the following key type: secret.",
  console.log("res", res);
}
// yao run scripts.chatweb.usage
function usage() {
  const access_key = Process("yao.env.get", "OPEN_API_ACCESS_KEY2");

  const res = Process(
    "http.get",
    "https://api.openai.com/dashboard/billing/usage?end_date=2024-01-01&start_date=2023-12-01",
    "",
    {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_key,
    }
  );
  //  "Your request to GET /dashboard/billing/usage must be made with a session key
  //  (that is, it can only be made from the browser). You made it with the following key type: secret.",
  console.log("res", res);
}
function verify() {
  return { status: "Success", message: "Verify successfully", data: undefined };
}

function handler(payload) {
    // console.log("payload:", payload)
    if (payload == null) {
        return 0;
    }
    const content = payload.replace(/^data:/, "");
    if (typeof ssEvent === "function") {
        ssEvent("data", content);
    } else {
        console.print(content);
    }
    return 1;
}
// yao run scripts.adapter.tencent.Completions
function Completions(payload) {
    const model = payload.model;
    if (!model) {
        model = "deepseek-r1"
        // throw new Exception("缺少参数model", 400)
    }
    if (!payload.messages) {
        throw new Exception("缺少参数messages", 400)
    }
    const stream = payload.stream;
    const token = Process("yao.env.get", "COPILOT_TENCENT_TOKEN");
    const base_url = Process("yao.env.get", "COPILOT_TENCENT_HOST");
    let url = base_url + "/chat/completions";

    const RequestBody = {
        // prompt: prompt,
        model,
        max_tokens: 4096,
        top_p: 1,
        temperature: 0.6,
        presence_penalty: 1,
        frequency_penalty: 0,
        stream: true,
        ...payload
    };

    if (stream) {
        let err = http.Stream("POST", url, handler, RequestBody, null, {
            "Content-Type": "application/json",
            Authorization: `Bearer ` + token,
        });
        if (err.code != 200) {
            console.log("err:", err);
            throw new Exception(err.message, err.code);
        }
        return {
            type: "text/event-stream; charset=utf-8"
        }
    } else {
        throw new Exception("不支持非流式", 400)
    }
}
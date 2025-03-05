
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
// yao run scripts.adapter.aardio.Completions
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
    const token = Process("yao.env.get", "AARDIO_TOKEN");
    const base_url = Process("yao.env.get", "AARDIO_HOST");
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

    url = "http://127.0.0.1:9999"
    //    aardio的token使用了二进制编码，无法处理。
    if (stream) {
        let err = http.Stream("POST", url, handler, RequestBody, null, {
            "Content-Type": "application/json",
            Authorization: `Bearer ` + token,
            'User-Agent': "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
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

//yao run scripts.adapter.aardio.test
function test() {


    // return str;
    const requestBody = {
        "max_tokens": 1024,
        "messages": [
            {
                "content": "你是桌面智能助手。",
                "role": "system"
            },
            {
                "content": "请输入问题:",
                "role": "user"
            }
        ],
        "model": "test-model-id",
        "stream": true,
        "temperature": 0.5
    }

    const err = http.Stream("POST", "http://127.0.0.1:6099/api/v1/aardio/chat/completions", handler, requestBody, null, {
        "Content-Type": "application/json",
        Authorization: `Bearer ` + "sk-",
    })

    if (err.code != 200) {
        console.log("err:,", err);

        throw new Exception(err.message, err.code);
    }
}
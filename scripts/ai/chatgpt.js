/**
 * 调用chatgpt接口
 * @param {string} message 消息文本
 * @returns 
 */
function Call(message) {
    if (!message) {
        return "请填写您的问题"
    }
    if (message.length < 2) {
        return "请填写详细的问题"
    }
    const setting = GetSetting()
    if (!setting || !setting.api_token) {
        return "请在管理界面维护AI连接设置值"
    }
    access_count = setting.access_count

    //console.log("ask:", message)
    let reply = http.Post(
        "https://api.openai.com/v1/completions",
        {
            prompt: message,
            model: setting.model,
            max_tokens: setting.max_tokens,
            n: 1,
            stop: setting.stop,
            temperature: setting.temperature,
        },
        null,
        null,
        {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${$ENV.AI_API_KEY}`,
            'Authorization': `Bearer ` + setting.api_token,
        }
    );
    if (reply.code != 200) {
        return reply.data.error.message
    }
    const answer = reply.data.choices[0].text
    SaveLog(message, answer)
    SaveLog2(setting)
    return answer
}
/**
 * 更新访问统计
 * @param {object} setting 
 * @returns 
 */
function SaveLog2(setting) {
    return Process(
        "models.ai.setting.Update",
        setting.id, {
        access_count: setting.access_count + 1
    }
    );
}
function SaveLog(question, answer) {
    return Process(
        "models.ai.chatlog.Insert",
        ["question", "answer"],
        [
            [question, answer],
        ]
    );
}

function GetSetting() {
    const setting = Process("models.ai.setting.Find", 1, {})
    return setting
}

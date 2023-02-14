/**
 * 调用chatgpt接口
 * @param {string} message 消息文本
 * @returns 
 */
function Call(message) {
    //console.log("ask:", message)
    let reply = http.Post(
        "https://api.openai.com/v1/completions",
        {
            prompt: message,
            model: "text-davinci-003",
            max_tokens: 1024,
            n: 1,
            stop: "None",
            temperature: 0.5,
        },
        null,
        null,
        {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${$ENV.AI_API_KEY}`,
            'Authorization': `Bearer ` + getMyApiKey(),
        }
    );
    //console.log(reply)
    if (reply.code != 200) {
        return reply.data.error.message
    }
    //console.log(reply.data.choices[0].text)
    const answer = reply.data.choices[0].text
    SaveLog(message, answer)
    return answer
}

function SaveLog(question, answer) {
    return Process(
        "yao.table.Insert",
        "aichat",
        ["question", "answer"],
        [
            [question, answer],

        ]
    );
}
/**
 * 从数据库中读取gpt相关的配置，只读取第1条
 * @returns 
 */
function GetSetting() {
    const setting = Process("models.setting.Find", 1, {})
    return setting
}
function getMyApiKey() {
    return 'sk-'
}

function getISO8601Time(date1 = new Date) {
    let j = date1.getHours() + 8;
    return date1.setHours(j),
        new Date(date1).toISOString().replace(/\.[\d]{3}Z/, "+08:00")
}

const document = {
    domain: "chat.deepseek.com",
    referrer: "",
}
const navigator = {
    appName: "Netscape",
    version: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
    language: "zh-CN",
    browserLanguage: "zh-CN",
    platform: "Win32",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
}
const windowScreen = {
    width: 1920,
    height: 1080,
    colorDepth: 24,
}
function md5(str) {

    return Process("crypto.Hash", "MD5", str)
}

function getMid() {
    return generateMID()
}
function generateMID() {

    let docu = document
        , nav = navigator
        , screen = windowScreen;
    function _e(nt) {
        let at = 0
            , it = 0
            , ot = nt.length - 1;
        for (ot; ot >= 0; ot--) {
            let st = parseInt(nt.charCodeAt(ot), 10);
            at = (at << 6 & 268435455) + st + (st << 14),
                (it = at & 266338304) != 0 && (at = at ^ it >> 21)
        }
        return at
    }
    function tt() {
        let nt = [nav.appName, nav.version, nav.language || nav.browserLanguage, nav.platform, nav.userAgent, screen.width, "x", screen.height, screen.colorDepth, docu.referrer].join("")
            , at = nt.length
            , it = 17;//window.history.length;
        for (; it;)
            nt += it-- ^ at++;
        return (Math.round(Math.random() * 2147483647) ^ _e(nt)) * 2147483647
    }
    let rt;
    return rt = [_e(docu.domain), tt(), +new Date + Math.random() + Math.random()].join(""),
        rt = rt.replace(/\./gi, "e"),
        rt = rt.substr(0, 32),
        // this._saveUid(rt),
        rt
}
// yao run scripts.ai.bot_headers.getHeaders
getHeaders = () => {
    let arry = ["Web", getISO8601Time(), "1.2", getMid(), md5(navigator.userAgent)]
        , headers = {
            "device-platform": arry[0],
            timestamp: arry[1],
            "zm-ver": arry[2],
            "access-token": arry[3],
            "zm-token": "",
            "zm-ua": arry[4]
        };
    return arry[3] || arry.splice(3, 1),
        headers["zm-token"] = md5(arry.join("")),
    {
        ...headers,
        "func-ver": 1,
        "Content-Type": "application/json",//contentType,
        mid: '',//client360Store.mid,
        sid: arry[3],//client360Store.sid,
        "Auth-Token": '',//authToken,
        "Request-Id": v4()
    }
}

function v4(a, j, et) {
    return Process("scripts.chat.conversation.generateUUID")
}
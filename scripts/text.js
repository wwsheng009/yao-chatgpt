
/**
 * 裁剪过长的文本
 * @param {string} text 
 * @returns 
 */
function Cut(text) {
    // log.Info("Cut text:", text)
    if (text && text.length > 20) {
        return text.substring(0, 20) + "..."
    }
    return text
}

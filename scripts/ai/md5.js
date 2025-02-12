// 初始化 md5$2 和 crypt 对象
const md5Module = {
    exports: {}
};
const cryptModule = {
    exports: {}
};

// 定义 Base64 编码表
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// 定义密码学工具函数
(function() {
    const cryptoUtils = {
        // 循环左移操作
        rotateLeft: function(value, shift) {
            return (value << shift) | (value >>> (32 - shift));
        },
        // 循环右移操作
        rotateRight: function(value, shift) {
            return (value << (32 - shift)) | (value >>> shift);
        },
        // 字节序转换
        endian: function(value) {
            if (typeof value === 'number') {
                return (this.rotateLeft(value, 8) & 16711935) | (this.rotateLeft(value, 24) & 4278255360);
            }
            for (let i = 0; i < value.length; i++) {
                value[i] = this.endian(value[i]);
            }
            return value;
        },
        // 生成随机字节数组
        randomBytes: function(length) {
            const bytes = [];
            for (let i = 0; i < length; i++) {
                bytes.push(Math.floor(Math.random() * 256));
            }
            return bytes;
        },
        // 字节数组转换为字数组
        bytesToWords: function(bytes) {
            const words = [];
            let bitIndex = 0;
            for (let i = 0; i < bytes.length; i++, bitIndex += 8) {
                words[bitIndex >>> 5] |= bytes[i] << (24 - bitIndex % 32);
            }
            return words;
        },
        // 字数组转换为字节数组
        wordsToBytes: function(words) {
            const bytes = [];
            for (let i = 0; i < words.length * 32; i += 8) {
                bytes.push((words[i >>> 5] >>> (24 - i % 32)) & 255);
            }
            return bytes;
        },
        // 字节数组转换为十六进制字符串
        bytesToHex: function(bytes) {
            const hexChars = [];
            for (let i = 0; i < bytes.length; i++) {
                hexChars.push((bytes[i] >>> 4).toString(16));
                hexChars.push((bytes[i] & 15).toString(16));
            }
            return hexChars.join("");
        },
        // 十六进制字符串转换为字节数组
        hexToBytes: function(hex) {
            const bytes = [];
            for (let i = 0; i < hex.length; i += 2) {
                bytes.push(parseInt(hex.substr(i, 2), 16));
            }
            return bytes;
        },
        // 字节数组转换为 Base64 字符串
        bytesToBase64: function(bytes) {
            const base64Chars = [];
            for (let i = 0; i < bytes.length; i += 3) {
                const combined = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
                for (let j = 0; j < 4; j++) {
                    if (i * 8 + j * 6 <= bytes.length * 8) {
                        base64Chars.push(BASE64_CHARS.charAt((combined >>> (6 * (3 - j))) & 63));
                    } else {
                        base64Chars.push("=");
                    }
                }
            }
            return base64Chars.join("");
        },
        // Base64 字符串转换为字节数组
        base64ToBytes: function(base64) {
            base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");
            const bytes = [];
            let bitIndex = 0;
            for (let i = 0; i < base64.length; bitIndex = ++i % 4) {
                if (bitIndex !== 0) {
                    bytes.push(((BASE64_CHARS.indexOf(base64.charAt(i - 1)) & (Math.pow(2, -2 * bitIndex + 8) - 1)) << (bitIndex * 2)) | (BASE64_CHARS.indexOf(base64.charAt(i)) >>> (6 - bitIndex * 2)));
                }
            }
            return bytes;
        }
    };
    // 将密码学工具函数导出到 cryptModule
    cryptModule.exports = cryptoUtils;
})();

// 获取密码学工具函数
const cryptoUtils = cryptModule.exports;

// 字符编码转换工具
const charEncoding = {
    utf8: {
        // UTF-8 字符串转换为字节数组
        stringToBytes: function(str) {
            return charEncoding.bin.stringToBytes(unescape(encodeURIComponent(str)));
        },
        // 字节数组转换为 UTF-8 字符串
        bytesToString: function(bytes) {
            return decodeURIComponent(escape(charEncoding.bin.bytesToString(bytes)));
        }
    },
    bin: {
        // 二进制字符串转换为字节数组
        stringToBytes: function(str) {
            const bytes = [];
            for (let i = 0; i < str.length; i++) {
                bytes.push(str.charCodeAt(i) & 255);
            }
            return bytes;
        },
        // 字节数组转换为二进制字符串
        bytesToString: function(bytes) {
            const chars = [];
            for (let i = 0; i < bytes.length; i++) {
                chars.push(String.fromCharCode(bytes[i]));
            }
            return chars.join("");
        }
    }
};

// 判断对象是否为 Buffer
function isBuffer(obj) {
    return obj != null && (isNativeBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
}

function isNativeBuffer(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}

function isSlowBuffer(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isNativeBuffer(obj.slice(0, 0));
}

// MD5 哈希计算函数
(function() {
    const crypto = cryptoUtils;
    const utf8Encoder = charEncoding.utf8;
    const binaryEncoder = charEncoding.bin;

    // MD5 核心计算函数
    const md5Core = function(input, options) {
        if (typeof input === 'string') {
            if (options && options.encoding === "binary") {
                input = binaryEncoder.stringToBytes(input);
            } else {
                input = utf8Encoder.stringToBytes(input);
            }
        } else if (isBuffer(input)) {
            input = Array.prototype.slice.call(input, 0);
        } else if (!Array.isArray(input) && input.constructor !== Uint8Array) {
            input = input.toString();
        }

        const words = crypto.bytesToWords(input);
        const bitLength = input.length * 8;
        let a = 1732584193;
        let b = -271733879;
        let c = -1732584194;
        let d = 271733878;

        for (let i = 0; i < words.length; i++) {
            words[i] = ((words[i] << 8) | (words[i] >>> 24)) & 16711935 | ((words[i] << 24) | (words[i] >>> 8)) & 4278255360;
        }

        words[bitLength >>> 5] |= 128 << (bitLength % 32);
        words[((bitLength + 64) >>> 9 << 4) + 14] = bitLength;

        for (let i = 0; i < words.length; i += 16) {
            const originalA = a;
            const originalB = b;
            const originalC = c;
            const originalD = d;

            a = ff(a, b, c, d, words[i + 0], 7, -680876936);
            d = ff(d, a, b, c, words[i + 1], 12, -389564586);
            c = ff(c, d, a, b, words[i + 2], 17, 606105819);
            b = ff(b, c, d, a, words[i + 3], 22, -1044525330);
            a = ff(a, b, c, d, words[i + 4], 7, -176418897);
            d = ff(d, a, b, c, words[i + 5], 12, 1200080426);
            c = ff(c, d, a, b, words[i + 6], 17, -1473231341);
            b = ff(b, c, d, a, words[i + 7], 22, -45705983);
            a = ff(a, b, c, d, words[i + 8], 7, 1770035416);
            d = ff(d, a, b, c, words[i + 9], 12, -1958414417);
            c = ff(c, d, a, b, words[i + 10], 17, -42063);
            b = ff(b, c, d, a, words[i + 11], 22, -1990404162);
            a = ff(a, b, c, d, words[i + 12], 7, 1804603682);
            d = ff(d, a, b, c, words[i + 13], 12, -40341101);
            c = ff(c, d, a, b, words[i + 14], 17, -1502002290);
            b = ff(b, c, d, a, words[i + 15], 22, 1236535329);
            a = gg(a, b, c, d, words[i + 1], 5, -165796510);
            d = gg(d, a, b, c, words[i + 6], 9, -1069501632);
            c = gg(c, d, a, b, words[i + 11], 14, 643717713);
            b = gg(b, c, d, a, words[i + 0], 20, -373897302);
            a = gg(a, b, c, d, words[i + 5], 5, -701558691);
            d = gg(d, a, b, c, words[i + 10], 9, 38016083);
            c = gg(c, d, a, b, words[i + 15], 14, -660478335);
            b = gg(b, c, d, a, words[i + 4], 20, -405537848);
            a = gg(a, b, c, d, words[i + 9], 5, 568446438);
            d = gg(d, a, b, c, words[i + 14], 9, -1019803690);
            c = gg(c, d, a, b, words[i + 3], 14, -187363961);
            b = gg(b, c, d, a, words[i + 8], 20, 1163531501);
            a = gg(a, b, c, d, words[i + 13], 5, -1444681467);
            d = gg(d, a, b, c, words[i + 2], 9, -51403784);
            c = gg(c, d, a, b, words[i + 7], 14, 1735328473);
            b = gg(b, c, d, a, words[i + 12], 20, -1926607734);
            a = hh(a, b, c, d, words[i + 5], 4, -378558);
            d = hh(d, a, b, c, words[i + 8], 11, -2022574463);
            c = hh(c, d, a, b, words[i + 11], 16, 1839030562);
            b = hh(b, c, d, a, words[i + 14], 23, -35309556);
            a = hh(a, b, c, d, words[i + 1], 4, -1530992060);
            d = hh(d, a, b, c, words[i + 4], 11, 1272893353);
            c = hh(c, d, a, b, words[i + 7], 16, -155497632);
            b = hh(b, c, d, a, words[i + 10], 23, -1094730640);
            a = hh(a, b, c, d, words[i + 13], 4, 681279174);
            d = hh(d, a, b, c, words[i + 0], 11, -358537222);
            c = hh(c, d, a, b, words[i + 3], 16, -722521979);
            b = hh(b, c, d, a, words[i + 6], 23, 76029189);
            a = hh(a, b, c, d, words[i + 9], 4, -640364487);
            d = hh(d, a, b, c, words[i + 12], 11, -421815835);
            c = hh(c, d, a, b, words[i + 15], 16, 530742520);
            b = hh(b, c, d, a, words[i + 2], 23, -995338651);
            a = ii(a, b, c, d, words[i + 0], 6, -198630844);
            d = ii(d, a, b, c, words[i + 7], 10, 1126891415);
            c = ii(c, d, a, b, words[i + 14], 15, -1416354905);
            b = ii(b, c, d, a, words[i + 5], 21, -57434055);
            a = ii(a, b, c, d, words[i + 12], 6, 1700485571);
            d = ii(d, a, b, c, words[i + 3], 10, -1894986606);
            c = ii(c, d, a, b, words[i + 10], 15, -1051523);
            b = ii(b, c, d, a, words[i + 1], 21, -2054922799);
            a = ii(a, b, c, d, words[i + 8], 6, 1873313359);
            d = ii(d, a, b, c, words[i + 15], 10, -30611744);
            c = ii(c, d, a, b, words[i + 6], 15, -1560198380);
            b = ii(b, c, d, a, words[i + 13], 21, 1309151649);
            a = ii(a, b, c, d, words[i + 4], 6, -145523070);
            d = ii(d, a, b, c, words[i + 11], 10, -1120210379);
            c = ii(c, d, a, b, words[i + 2], 15, 718787259);
            b = ii(b, c, d, a, words[i + 9], 21, -343485551);

            a = (a + originalA) >>> 0;
            b = (b + originalB) >>> 0;
            c = (c + originalC) >>> 0;
            d = (d + originalD) >>> 0;
        }

        return crypto.endian([a, b, c, d]);
    };

    // MD5 轮函数 ff
    const ff = function(a, b, c, d, x, s, t) {
        const temp = a + ((b & c) | (~b & d)) + (x >>> 0) + t;
        return ((temp << s) | (temp >>> (32 - s))) + b;
    };

    // MD5 轮函数 gg
    const gg = function(a, b, c, d, x, s, t) {
        const temp = a + ((b & d) | (c & ~d)) + (x >>> 0) + t;
        return ((temp << s) | (temp >>> (32 - s))) + b;
    };

    // MD5 轮函数 hh
    const hh = function(a, b, c, d, x, s, t) {
        const temp = a + (b ^ c ^ d) + (x >>> 0) + t;
        return ((temp << s) | (temp >>> (32 - s))) + b;
    };

    // MD5 轮函数 ii
    const ii = function(a, b, c, d, x, s, t) {
        const temp = a + (c ^ (b | ~d)) + (x >>> 0) + t;
        return ((temp << s) | (temp >>> (32 - s))) + b;
    };

    // 设置 MD5 块大小和摘要大小
    md5Core._blocksize = 16;
    md5Core._digestsize = 16;

    // 导出 MD5 计算函数
    md5Module.exports = function(input, options) {
        if (input == null) {
            throw new Error("Illegal argument " + input);
        }
        const resultBytes = crypto.wordsToBytes(md5Core(input, options));
        if (options && options.asBytes) {
            return resultBytes;
        } else if (options && options.asString) {
            return binaryEncoder.bytesToString(resultBytes);
        } else {
            return crypto.bytesToHex(resultBytes);
        }
    };
})();

// 封装 MD5 函数供外部调用
function md5(input) {
    return md5Module.exports(input);
}
// yao run scripts.ai.md52.md5  "hello"
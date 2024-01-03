//代理js api请求
// import { Store, Studio, WebSocket } from "yao-node-client";
// import { Exception, Process, Query } from "yao-node-client";
// import { $L, FS, http, log } from "yao-node-client";
/**
 * api 代理服务，可以放在yao应用下
 * @param {object} payload
 * @returns
 */
function Server(payload) {
  // console.log("request received");
  // console.log(payload);
  // log.Info("debug served called");
  // log.Info(payload);
  // JSON.stringify({'a':null,'b':undefined})
  // '{"a":null}'
  let resp = {
    code: 200,
    message: "",
    // error: null as Error, //undefined不会出现在返回json key中
    data: null,
  };
  try {
    const type = payload.type;
    const method = payload.method;
    const args = payload.args;
    const space = payload.space; //"dsl","script","system"
    let localParams = [];
    if (Array.isArray(args)) {
      localParams = args;
    } else {
      localParams.push(args);
    }
    switch (type) {
      case "Process":
        resp.data = Process(method, ...localParams);
        break;
      case "Studio":
        // @ts-ignore
        __YAO_SU_ROOT = true;
        resp.data = Studio(method, ...localParams);
        break;
      case "Query":
        const query = new Query();
        //@ts-ignore
        resp.data = query[method](args);
        break;
      case "FileSystem":
        const fs = new FS(space);
        //@ts-ignore
        resp.data = fs[method](...args);
        break;
      case "Store":
        const cache = new Store(space);
        if (method == "Set") {
          resp.data = cache.Set(payload.key, payload.value);
        } else if (method == "Get") {
          resp.data = cache.Get(payload.key);
        }
        break;
      case "Http":
        //@ts-ignore
        resp.data = http[method](...args);
        break;
      case "Log":
        // console.log("Log args:", args);
        //@ts-ignore
        log[method](...args);
        resp.data = {};
        break;
      case "WebSocket":
        //目前yao只是实现了push一个方法，也是ws服务连接后push一条信息
        const ws = new WebSocket(payload.url, payload.protocols);
        if (method == "push") {
          ws.push(payload.message);
          resp.data = {};
        }
        break;
      case "Translate":
        resp.data = $L(payload.message);
        break;
      default:
        resp.code = 500;
        resp.message = `不支持的方法调用${type}`;
    }
  } catch (error) {
    resp.code = error.code || 500;
    resp.message = error.message || "接口调用异常";
  }
  return resp;
}
// 在外部按这个格式进行封装
// function MyProcess(...args: any[]) {
//   return Process("scripts.jsproxy.RemoteProcess",'scripts.ping.Ping' ...args);
// }
/**
 * 调用远程处理器，并返回处理结果
 * @param method 远程处理器方法
 * @param args 远程处理器参数
 * @returns 远程处理器结果
 */
function RemoteProcess(method, ...args) {
  if (!(typeof method === "string")) {
    throw new Exception(`方法格式不正确,方法名不是字符串${method}`, 500);
  }
  const types = method.split(".");
  if (!types.length) {
    throw new Exception(`方法格式不正确，没有命名空间${method}`, 500);
  }
  const type = types[0].toLowerCase();
  if (!["scripts", "services", "studio"].includes(type)) {
    throw new Exception(
      `不支持的方法,只支持调用scripts/services/studio,${method}`,
      500
    );
  }
  return RemoteClient("Process", method, ...args);
}
/**
 * 远程api接口
 * @param type 处理器类型scripts/services/studio
 * @param method scripts.xx.xx
 * @param args 任何参数
 * @returns 远程处理器的结果
 */
function RemoteClient(type, method, ...args) {
  // let ret = http.Post(process.env.REMOTE_DEBUG_SERVER, {
  let server = Process("utils.env.Get", "REMOTE_DEBUG_SERVER");
  let ret = http.Post(server, {
    method: method,
    type: type,
    args: args,
  });
  if (ret.code != 200) {
    throw Error(`远程程序执行异常:代码:${ret.code},消息：${ret.message}`);
  }
  return ret.data;
}

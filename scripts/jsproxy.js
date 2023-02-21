//代理js api请求
//函数名称不要使用Process/Query/FS/Store

/**
 * yao本地js api代理
 * @param {object} payload
 * @returns
 */
function Server(payload) {
  // console.log("request received");
  // console.log(payload);
  log.Info("debug served called");
  log.Info(payload);

  const type = payload.type;

  const method = payload.method;
  const args = payload.args;
  const space = payload.space; //"dsl","script","system"

  switch (type) {
    case "Process":
      let localParams = [];
      if (Array.isArray(args)) {
        localParams = args;
      } else {
        localParams.push(args);
      }
      return Process(method, ...localParams);
    case "Query":
      const query = new Query();
      return query[method](args);
    case "FileSystem":
      const fs = new FS(space);
      return fs[method](...args);
    case "Store":
      const cache = new Store(space);
      if (method == "Set") {
        return cache.Set(payload.key, payload.value);
      } else if (method == "Get") {
        return cache.Get(payload.key);
      }
    case "Http":
      return http[method](...args);
    case "Log":
      // console.log("Log args:", args);
      log[method](...args);
      return {};
    case "WebSocket":
      //目前yao只是实现了push一个方法，也是ws服务连接后push一条信息
      const ws = new WebSocket(payload.url, payload.protocols);
      if (method == "push") {
        ws.push(payload.message);
        return {};
      }
    case "Translate":
      return $L(payload.message);
    default:
      break;
  }
  throw new Exception("操作未支持", 404);
}

/**
 * yao-debug run scripts.remote.server.testProcess
 */
function testProcess() {
  let RequestBody = { type: "Process", method: "utils.now.Date" };
  const res = Main(RequestBody);
  console.log(res);
}

/**
 * yao-debug run scripts.remote.server.testProcess2
 * 测试数组
 */
function testProcess2() {
  let RequestBody = {
    type: "Process",
    method: "utils.str.Concat",
    args: ["name:", "value"],
  };
  const res = Main(RequestBody);
  console.log(res);
}

/**
 * yao-debug run scripts.remote.server.testProcess3
 * 测试一个参数
 */
function testProcess3() {
  let RequestBody = {
    type: "Process",
    method: "utils.fmt.Print",
    args: new Date(),
  };
  const res = Main(RequestBody);
  console.log(res);
}

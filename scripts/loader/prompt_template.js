// import { ProcessEnum } from "yao-app-ts-types";
// import { Exception, FS, http, Process, Query } from "yao-node-client";
/**
 * 加载提示词模板
 * 数据来源：https://github.com/PlexPt/awesome-chatgpt-prompts-zh/blob/main/README.md
 * @returns
 */
function Run() {
  var qb = new Query("xiang");
  let rc = qb.Get({
    sql: {
      stmt: "delete from prompt_template",
    },
  });
  var fs = new FS("system");
  if (!fs.Exists("/中文调教指南.md.txt")) {
    let document = http.Get(
      "https://raw.githubusercontent.com/PlexPt/awesome-chatgpt-prompts-zh/main/README.md"
    );
    if (document.status != 200) {
      throw new Exception(`网络请求异常${document.message}`, 500);
    }
    let buffer = Process("Encoding.Base64.Decode", document.data);
    fs.WriteFileBuffer("/中文调教指南.md.txt", buffer);
  }
  var data = fs.ReadFile("/中文调教指南.md.txt");
  const words = data.split("\n");
  let startindex = 0;
  let title = "";
  let content = "";
  let newData = [];
  words.forEach((line, index) => {
    if (line.length == 0) {
      return;
    }
    if (line.startsWith("# 正经指南")) {
      startindex = index;
    }
    if (startindex && index > startindex) {
      let matchs = line.match(/##\s(.*)$/);
      if (matchs && matchs.length == 2) {
        title = matchs[1];
      }
      matchs = line.match(/>\s(.*)$/);
      if (matchs && matchs.length == 2) {
        content = matchs[1];
      }
      if (title && content) {
        newData.push([title, content]);
        title = "";
        content = "";
      }
    }
  });
  rc = Process(
    "Models.chat.prompttemplate.Insert",
    ["title", "content"],
    newData
  );
  //   console.log(rc);
  return rc;
}
// load_prompt_template();

// import { FS, Process, Query } from "yao-node-client";
/**
 * 从文件加载敏感词到数据库表中
 * @returns
 */
function load_sensitive_word() {
  var fs = new FS("system"); // /app_root/data
  var data = fs.ReadFile("/word.txt"); // /app_root/data/xxx
  const words = data.split("\n");
  var qb = new Query();
  let rc = qb.Get({
    sql: {
      stmt: "delete from sensitive_word",
    },
  });
  let wordArray = [];
  words.forEach((word) => wordArray.push([word]));
  rc = Process("Models.sensitive_word.Insert", ["word"], wordArray);
  console.log(rc);
  return rc;
}
// load_sensitive_word();

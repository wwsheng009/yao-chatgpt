//读取测试
//yao-debug run models.ai.model.get '::{"withs":{"permissions":{}}}'
//yao-debug run models.ai.permission.get '::{"withs":{"model":{}}}'

/**
 * 更新open ai 模型列表
 * 测试 yao-debug run scripts.ai.model.UpdateModel
 */
function UpdateModel() {
  //清除所有的数据
  var qb = new Query("xiang");
  let rc = qb.Get({
    sql: {
      stmt: "delete from ai_model",
    },
  });

  var qb = new Query("xiang");
  rc = qb.Get({
    sql: {
      stmt: "delete from ai_permission",
    },
  });

  let setting = Process("scripts.ai.chatgpt.GetSetting");
  token = setting.api_token;
  let reply = http.Get("https://api.openai.com/v1/models", null, {
    "Content-Type": "application/json",
    // 'Authorization': `Bearer ${$ENV.AI_API_KEY}`,
    Authorization: `Bearer ` + setting.api_token,
  });
  // console.log(arrs.values)
  if (reply.code != 200) {
    throw new Exception(reply.data.error.message);
    // return reply.data.error.message
  }
  // let fs = new FS("system");
  // fs.WriteFile("openai_models.json", JSON.stringify(reply.data.data))
  // Process("fs.system.writefile", "openai_models.json", reply)

  let res = reply.data.data;

  let perms = [];
  res.forEach((line) => {
    //处理权限
    line.permission.map((item) => {
      item.model_id = line.id;
      item.idx = item.id; //xgen目前不支持非数字类型的主键
      item.created = convertUTCDateToLocalDate(item.created);
      delete item.id;
    });
    line.idx = line.id;
    delete line.id; //xgen目前不支持非数字类型的主键
    line.created = convertUTCDateToLocalDate(line.created);
    line.title = line.idx; //更新标题

    perms = perms.concat(line.permission);

    delete line.permission;
  });
  let arrs = Process("utils.arr.Split", perms);
  rc = Process("Models.ai.permission.Insert", arrs.columns, arrs.values);

  arrs = Process("utils.arr.Split", res);
  rc = Process("Models.ai.model.Insert", arrs.columns, arrs.values);
  // console.log("rc4:", rc)
}

/**
 * yao-debug run scripts.ai.model.ConvertTime 1669085501
 * @param {*} unixTimestamp
 */
function ConvertTimeCmd(unixTimestamp) {
  times = parseInt(unixTimestamp);
  return convertUTCDateToLocalDate(times);
}
/**
 * 把utc时间转换成北京时间
 * @param {integer} unixTimestamp
 * @returns string
 */
function convertUTCDateToLocalDate(unixTimestamp) {
  var date = new Date(unixTimestamp * 1000);
  // utc时间整时区
  date.setHours(date.getHours() + 8);
  // console.log(date.toISOString().slice(0, 19) + "08:00");
  return date.toISOString().slice(0, 19) + "08:00"; //北京时区
  // return newDate.toISOString().slice(0, 19).replace("T", " ");
  // return dateObj.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}

// convertUTCDateToLocalDate(1676642163);

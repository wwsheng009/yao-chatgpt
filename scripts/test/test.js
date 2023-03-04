function testTrimWord() {
  const ls =
    "\n\n1. 丽江古城夕照湖：位于云南省，是中国最著名的湖泊之一。\n2. 青海湖：位于青海省，是中国著名的湖泊之一，也是世界文化遗产。\n3. 洞庭湖：位于湖南省，是中国第一大淡水湖，也是中国最著名的湖泊之一。\n4. 天津渤海：位于天津市，是中国最大的沿海湾，也是中国最著名的湖泊之一。\n5. 小五台：位于山西省，是中国著名的湖泊之一，也是世界文化遗产之一。\n6. 合肥太湖：位于安徽省，是中国最大的内陆湖泊，也是中国最著名的湖泊之一。\n7. 洱海：位于云南省，是中国最大的湖泊，也是中国最著名的湖泊之一。";

  let answer = ls.trim();
  //删除第一个空行
  console.log("删除第一个空行:", answer);
  answer = answer.replace(/^\s*\n/, "");
  console.log();
  console.log(answer);
}
function CurrentTime() {
  var date = new Date();
  // utc时间整时区

  date.setHours(date.getHours() + 8);
  // console.log(date.toISOString().slice(0, 19) + "Z08:00");
  return date.toISOString().slice(0, 19) + "Z08:00"; //北京时区
  // return newDate.toISOString().slice(0, 19).replace("T", " ");
  // return dateObj.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}
// CurrentTime();

function testTime() {
  var newDate = new Date();
  var timeoffset = -480; //newDate.getTimezoneOffset();

  var offset = timeoffset / 60;
  var hours = newDate.getHours();
  newDate.setHours(hours - offset);
  console.log(newDate.toISOString());
  console.log(newDate.toUTCString());
  console.log(newDate.toLocaleDateString());
  console.log(newDate.toISOString().slice(0, 19) + "Z08:00"); //北京时区
}

/**
 * 更新访问统计
 * @param {object} setting
 * @returns
 */
function SaveLog2(setting) {
  return Process("models.ai.setting.Update", setting.id, {
    access_count: setting.access_count + 1,
  });
}
function SaveLog(question, answer) {
  return Process(
    "models.ai.chatlog.Insert",
    ["question", "answer"],
    [[question, answer]]
  );
}

function CurrentTime() {
  var date = new Date();
  // utc时间整时区

  date.setHours(date.getHours() + 8);
  // console.log(date.toISOString().slice(0, 19) + "Z08:00");
  return date.toISOString().slice(0, 19) + "Z08:00"; //北京时区
  // return newDate.toISOString().slice(0, 19).replace("T", " ");
  // return dateObj.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}
// CurrentTime();

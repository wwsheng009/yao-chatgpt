// const { Process } = require("../../remote-debug");
// console.log(global);
function Main() {
  let setting = GetSetting();
  console.log(setting);
}
function GetSetting() {
  const setting = Process("models.ai.setting.Get", {
    wheres: [
      {
        Column: "default",
        Value: true,
      },
      {
        Column: "deleted_at",
        Value: null,
      },
    ],
  });
  return setting[0];
}
// Main();

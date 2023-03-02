// import { Exception } from "yao-node-client";
// import { FS, Process } from "yao-node-client";
//在form与table配置中，yao可以只配置简单的与模型的绑定关系就能带出所有的配置，
//但是这些配置都是默认项，一般情况是够用了，如果需要更多的配置，就需要手动修改配置文件。
/**
 * 初始化表格的配置文件。
 * @param table 表格名称
 */
function createTableSetting(table) {
  let filename = `tables/${table.split(".").join("/")}.tab.json`;
  // let table_file = `tables/${table.split(".").join("/")}.tab.json`;
  let setting = Process("yao.table.Setting", table);
  if (setting.code && setting.message) {
    throw new Exception(setting.message, setting.code);
  }
  delete setting["hooks"];
  //重新近排布局
  let newTable = {
    name: table,
    action: {
      bind: {
        model: table,
        option: {
          form: table,
          withs: {},
        },
      },
    },
    layout: {},
    fields: {},
  };
  let fields = setting.fields;
  delete setting.fields;
  newTable.layout = setting;
  newTable.fields = fields;
  if (newTable.layout) {
    newTable.config = newTable.layout.config;
    delete newTable.layout.config;
    delete newTable.layout.name;
  }
  deleteObjectKey(newTable, "id");
  let fs = new FS("dsl");
  // if (fs.Exists(filename)) {
  //   let template = JSON.parse(fs.ReadFile(filename));
  //   //如果不存在配置，增加，不要直接替换
  //   for (const key in template) {
  //     if (!newTable[key]) {
  //       newTable[key] = template[key];
  //     }
  //   }
  // }
  //make sure the folder exist
  let folder = filename.split("/").slice(0, -1);
  if (!fs.Exists(folder.join("/"))) {
    fs.MkdirAll(folder.join("/"));
  }
  let rc = fs.WriteFile(
    filename.slice(0, -4) + "default.json",
    JSON.stringify(newTable)
  );
  console.log(rc);
}
/**
 * 创建表单的配置文件，适用于初始化表单配置
 * @param form 表单名称
 */
function createFormSetting(form) {
  let filename = `forms/${form.split(".").join("/")}.form.json`;
  let setting = Process("yao.form.Setting", form);
  // createSetting(setting, filename);
  if (setting.code && setting.message) {
    throw new Exception(setting.message, setting.code);
  }
  delete setting["hooks"];
  let newForm = {
    //{ [key: string]: any } = {
    name: form,
    action: {
      bind: {
        model: form,
        option: {},
      },
    },
    layout: {},
    fields: {},
  };
  let fields = setting.fields;
  delete setting.fields;
  newForm.layout = setting;
  newForm.fields = fields;
  if (newForm.layout) {
    newForm.config = newForm.layout.config;
    delete newForm.layout.config;
    delete newForm.layout.name;
  }
  deleteObjectKey(newForm, "id");
  // 合并原来的配置
  let fs = new FS("dsl");
  // if (fs.Exists(filename)) {
  //   let template = JSON.parse(fs.ReadFile(filename));
  //   for (const key in template) {
  //     if (!newForm[key]) {
  //       newForm[key] = template[key];
  //     }
  //   }
  // }
  let actions = [
    {
      title: "返回",
      icon: "icon-arrow-left",
      showWhenAdd: true,
      showWhenView: true,
      action: [
        {
          name: "CloseModal",
          type: "Common.closeModal",
          payload: {},
        },
      ],
    },
    {
      title: "保存",
      icon: "icon-check",
      style: "primary",
      showWhenAdd: true,
      action: [
        {
          name: "Submit",
          type: "Form.submit",
          payload: {},
        },
        {
          name: "Back",
          type: "Common.closeModal",
          payload: {},
        },
      ],
    },
    {
      action: [
        {
          name: "Delete",
          payload: {
            model: form,
          },
          type: "Form.delete",
        },
        {
          name: "Back",
          type: "Common.closeModal",
          payload: {},
        },
      ],
      confirm: {
        desc: "请确认删除，删除后数据无法恢复",
        title: "确认",
      },
      icon: "icon-trash-2",
      style: "danger",
      title: "Delete",
    },
  ];
  newForm.layout.actions = actions;
  //make sure the folder exist
  let folder = filename.split("/").slice(0, -1);
  if (!fs.Exists(folder.join("/"))) {
    fs.MkdirAll(folder.join("/"));
  }
  let rc = fs.WriteFile(
    filename.slice(0, -4) + "default.json",
    JSON.stringify(newForm)
  );
  console.log(rc);
}
/**
 * delete special key in object
 * @param obj object or arry
 * @param delete_id key to be delete
 * @returns void
 */
function deleteObjectKey(obj, delete_id) {
  if (!(obj instanceof Object) && !(obj instanceof Array)) {
    return;
  }
  if (obj instanceof Array) {
    for (let index = 0; index < obj.length; index++) {
      deleteObjectKey(obj[index], delete_id);
    }
    return;
  }
  for (const key in obj) {
    if (obj[key] instanceof Object) {
      deleteObjectKey(obj[key], delete_id);
    } else if (obj[key] instanceof Array) {
      deleteObjectKey(obj[key], delete_id);
    }
    if (key == delete_id) {
      delete obj[delete_id];
    }
  }
}
function test_delete_object_key() {
  let obj = {
    test: {
      id: "test",
    },
    fields: [
      {
        id: "test2",
      },
    ],
  };
  deleteObjectKey(obj, "id");
  console.log(obj);
}
/**
 * create default table and table config json file
 * @param model yao model name
 */
function createTableAndForm(model) {
  createTableSetting(model);
  createFormSetting(model);
}
//按以下格式创建默认的table的配置，再调用函数生成默认table配置。
// {
//   "name": "::Chat Message",
//   "action": {
//     "bind": {
//       "model": "chat.message",
//       "option": { "form": "chat.message", "withs": {} }
//     }
//   }
//}
//按以下格式创建默认的form配置，再调用函数生成默认form配置
// {
//   "name": "::AI Conversation Message",
//   "action": {
//     "bind": {
//       "model": "chat.message",
//     }
//   }
// }
// createTableSetting("chat.prompt_template1");
// createFormSetting("chat.prompt_template");
// createTableAndForm("chat.prompt_template");
// createTableAndForm("chat.conversation");
// createTableAndForm("chat.message");
// createTableAndForm("ai.model");
// createTableAndForm("chat.conversation");

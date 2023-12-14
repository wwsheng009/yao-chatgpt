function main() {
  console.log("xxxxxxxxx");

  let items = [
    {
      id: 1,
      blocks: 0,
      icon: "icon-activity",
      name: "图表",
      parent: null,
      path: "/x/Dashboard/ai",
      visible_menu: 0,
      children: [
        {
          id: 5,
          blocks: 0,
          icon: "icon-activity",
          name: "聊天图表",
          path: "/x/Chart/ai.chat",
          visible_menu: 0,
        },
      ],
    },
    {
      name: "聊天",
      path: "/iframe?src=/index.html",
      icon: "icon-trello",
    },
    {
      id: 2,
      blocks: 0,
      icon: "icon-message-square",
      name: "聊天会话",
      parent: null,
      path: "/x/Table/chat.conversation_simple",
      visible_menu: 1,
      children: [
        {
          id: 13,
          blocks: 0,
          icon: "message-circle",
          name: "会话",
          parent: null,
          path: "/x/Table/chat.conversation_simple",
          visible_menu: 1,
        },
        {
          id: 14,
          blocks: 0,
          icon: "icon-coffee",
          name: "消息",
          parent: null,
          path: "/x/Table/chat.message_simple",
          visible_menu: 1,
        },
      ],
    },
    {
      id: 5,
      icon: "icon-tool",
      name: "AI接口配置",
      path: "/x/Table/ai.setting",
    },
    {
      id: 5,
      icon: "icon-tool",
      name: "chat",
      path: "/x/Form/chat.chat/0/edit",
    },
    {
      id: 3,
      blocks: 0,
      icon: "icon-list",
      name: "模型",
      parent: null,
      path: "/x/Table/ai.model",
      visible_menu: 1,
      children: [
        {
          id: 15,
          blocks: 0,
          icon: "icon-list",
          name: "AI模型",
          parent: null,
          path: "/x/Table/ai.model",
          visible_menu: 1,
        },
        {
          id: 16,
          blocks: 0,
          icon: "icon-book",
          name: "模型权限",
          parent: null,
          path: "/x/Table/ai.permission",
          visible_menu: 1,
        },
      ],
    },
    {
      id: 4,
      blocks: 0,
      icon: "icon-rss",
      name: "提示模板",
      parent: null,
      path: "/x/Table/chat.prompttemplate",
      visible_menu: 1,
      children: [
        {
          id: 13,
          blocks: 1,
          icon: "icon-book",
          name: "提示模板",
          parent: null,
          path: "/x/Table/chat.prompttemplate",
          visible_menu: 1,
        },
        {
          id: 14,
          blocks: 1,
          icon: "icon-book-open",
          name: "敏感词",
          parent: null,
          path: "/x/Table/chat.sensitive_word",
          visible_menu: 1,
        },
      ],
    },
  ];

  let setting = [
    {
      icon: "icon-settings",
      id: 999999,
      name: "设置",
      path: "/x/Form/ai.setting/1/edit",
      children: [
        {
          id: 10002,
          name: "系统设置",
          path: "/setting",
        },

        {
          id: 10004,
          name: "用户配置",
          path: "/x/Table/yao.user",
        },
      ],
    },
  ];
  // let info = Process("utils.app.Ping");
  return {
    items,
    setting,
  };
  // if (info.version == "0.10.3") {
  //   return {
  //     items,
  //     setting,
  //   };
  // } else {
  //   let data = items.concat(setting);
  //   // console.log(data);
  //   return data;
  // }
}

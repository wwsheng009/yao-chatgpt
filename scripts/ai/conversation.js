/**
 *  create a uuid
 * https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
 * @returns string
 */
function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * yao-debug run scripts.ai.conversation.testDummyMessage
 */

function testDummyMessage() {
  let { id } = NewConversation();

  let isUser = true;
  for (let index = 0; index < 100; index++) {
    var d = new Date();
    if (isUser) {
      NewMessage(id, "user", d.toISOString().slice(0, 19).replace("T", " "));
      isUser = false;
    } else {
      NewMessage(id, "AI", d.toISOString().slice(0, 19).replace("T", " "));
      isUser = true;
    }
  }
}

/**
 * yao-debug migrate -n ai.conversation --reset
 * yao-debug run scripts.ai.conversation.NewConversation
 * yao-debug run models.ai.conversation.Get '::{}'
 *
 */

function NewConversation() {
  let uuid = generateUUID();
  let newID = Process("models.ai.conversation.Create", {
    uuid: uuid,
    api_setting: 1,
    title: "new conversation",
    description: "new conversation with openai",
  });
  return { id: newID, uuid: uuid };
}

/**
 * 创建新的消息
 * yao-debug migrate -n ai.message --reset
 * yao-debug run scripts.ai.conversation.NewMessage 0ae38ad4-8b2d-45e3-b1a0-0c7454ca25a7 user "hello world"
 * yao-debug run scripts.ai.conversation.NewMessage 0ae38ad4-8b2d-45e3-b1a0-0c7454ca25a7 AI "hello world"
 * yao-debug run models.ai.message.Get '::{}'
 *
 */
/**
 * 创建新消息
 * @param {integer} conversation_id 会话ID
 * @param {*} user 用户
 * @param {*} message 消息
 * @returns
 */
function NewMessage(conversation_id, user, message) {
  //   console.log();
  if (message.length == 0) {
    return;
  }
  CheckConversationId(conversation_id);

  let newid = Process("models.ai.message.create", {
    parent_id: conversation_id,
    message: message,
    user: user,
    length: message.length,
  });
  return newid;
}

/**
 *
 * @returns Array
 *
 * yao-debug run scripts.ai.conversation.FindConversation
 */
function FindConversation() {
  //   CheckConversationId(uuid);
  return Process("models.ai.conversation.Get", {
    select: ["uuid", "title"],
    withs: {
      messages: {
        query: {
          select: ["id", "message", "user"],
          orders: [{ column: "id", option: "asc" }],
        },
      },
    },
  });
}
/**
 *
 * @param {*} uuid
 * @returns
 *
 * yao-debug run scripts.ai.conversation.FindConversationById 63d7eb9b-ba12-4a70-8624-575dfe53badc
 */
function FindConversationById(uuid) {
  //   CheckConversationId(uuid);
  let list = Process("models.ai.conversation.Get", {
    select: ["id", "uuid", "title"],
    withs: {
      messages: {
        query: {
          select: ["id", "message", "user"],
          orders: [{ column: "id", option: "desc" }],
          limit: 10,
        },
      },
    },
    wheres: [
      {
        Column: "uuid",
        Value: uuid,
      },
    ],
  });
  if (list.length) {
    list[0].messages = list[0].messages.reverse();
    return list[0];
  }
}

/**
 * 查询会话中的最新的10条消息
 * @param {string} uuid 会话ID
 * @returns
 *
 *
 * yao-debug run scripts.ai.conversation.FindMessage 63d7eb9b-ba12-4a70-8624-575dfe53badc
 */
function FindMessage(uuid) {
  CheckConversationId(uuid);
  let conversation = Process("models.ai.conversation.Get", {
    select: ["uuid"],
    withs: {
      messages: {
        query: {
          select: ["id", "message", "user"],
          orders: [{ column: "id", option: "desc" }],
          limit: 10,
        },
      },
    },
    wheres: [
      {
        Column: "uuid",
        Value: uuid,
      },
    ],
  });
  if (conversation.length) {
    let list = conversation[0].messages.reverse();
    return list;
  }

  //   let messages = Process("models.ai.message.Get", {
  //     wheres: [
  //       {
  //         Column: "uuid",
  //         Value: uuid,
  //       },
  //     ],
  //   });
  //   return messages;
}

/**
 * 检查会话ID是否存在
 * @param {string} uuid 会话ID
 * @returns
 *
 * test
 * yao-debug run scripts.ai.conversation.CheckConversationId da472c6c-d2a7-48a2-b4b2-71591660b44f
 * yao-debug run scripts.ai.conversation.CheckConversationId
 */
function CheckConversationId(id) {
  let conversation = Process("models.ai.conversation.Get", {
    wheres: [
      {
        column: "id",
        value: id,
      },
      { method: "orWhere", column: "uuid", value: id },
    ],
  });
  if (!conversation || conversation.length == 0) {
    throw Exception(`找不到对应的会话ID:${id}`);
  }
  return true;
}

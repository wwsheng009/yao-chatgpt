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
 * yao-debug run scripts.chat.conversation.testDummyMessage
 */

function testDummyMessage() {
  let { id } = NewConversation();

  let isUser = true;
  for (let index = 0; index < 100; index++) {
    var d = new Date();
    if (isUser) {
      // return newDate.toISOString().slice(0, 19) + "Z08:00"; //北京时区
      NewMessage(id, "user", d.toISOString().slice(0, 19).replace("T", " "));
      isUser = false;
    } else {
      NewMessage(id, "AI", d.toISOString().slice(0, 19).replace("T", " "));
      isUser = true;
    }
  }
}
/**
 * yao-debug migrate -n chat.conversation --reset
 * yao-debug run scripts.chat.conversation.NewConversation
 * yao-debug run models.chat.conversation.Get '::{}'
 *
 */

/**
 * 创建一个新的会话
 * @param {string} title 新会话标题
 * @param {string} description 描述
 * @returns {id:string,uuid:uuid}
 */
function NewConversation(title, description) {
  let uuid = generateUUID();
  let newID = Process("models.chat.conversation.Create", {
    uuid: uuid,
    api_setting: 1,
    title: title || "new conversation",
    description: description, //|| "new conversation with openai",
  });
  return { id: newID, uuid: uuid };
}

/**
 * 创建新的消息
 * yao-debug migrate -n chat.message --reset
 * yao-debug run scripts.chat.conversation.NewMessage 0ae38ad4-8b2d-45e3-b1a0-0c7454ca25a7 user "hello world"
 * yao-debug run scripts.chat.conversation.NewMessage 0ae38ad4-8b2d-45e3-b1a0-0c7454ca25a7 AI "hello world"
 * yao-debug run models.chat.message.Get '::{}'
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

  let newid = Process("models.chat.message.create", {
    conversation_id: conversation_id,
    message: message,
    user: user,
    length: message.length,
  });
  return newid;
}
/**
 * New Message API
 * @param {map} param0 new message object
 */
function NewMessageApi({
  conversationId,
  prompt,
  answer,
  replydata,
  aiUserName,
  endUserName,
}) {
  console.log({
    conversationId,
    prompt,
    answer,
    replydata,
    aiUserName,
    endUserName,
  });
  try {
    let new_message = {
      conversation_id: conversationId,
      ai_user: aiUserName,
      end_user: endUserName,
      prompt: prompt,
      completion: answer,
      prompt_len: prompt.length,
      completion_len: answer.length,
    };

    if (replydata) {
      new_message.completion_tokens = replydata.usage.completion_tokens;
      new_message.prompt_tokens = replydata.usage.prompt_tokens;
      new_message.total_tokens = replydata.usage.total_tokens;
      new_message.request_total_time = seconds;
      new_message.created = Process(
        "scripts.ai.model.convertUTCDateToLocalDate",
        replydata.created
      );
      new_message.model = replydata.model;
      new_message.object = replydata.object;
    }

    NewMessageObject(new_message);
  } catch (error) {
    console.log("更新消息失败");
    throw error;
  }
}

function NewMessageObject(message) {
  //   console.log();
  if (message.length == 0) {
    return;
  }
  CheckConversationId(message.conversation_id);

  let newid = Process("models.chat.message.create", message);
  return newid;
}
/**
 *
 * @returns Array
 *
 * yao-debug run scripts.chat.conversation.FindConversation
 */
function FindConversation() {
  //   CheckConversationId(uuid);
  return Process("models.chat.conversation.Get", {
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
 * yao-debug run scripts.chat.conversation.FindConversationById d9a78a11-6890-46db-87e3-874ca25bdf93
 */
function FindConversationById(uuid) {
  //   CheckConversationId(uuid);
  let list = Process("models.chat.conversation.Get", {
    select: ["id", "uuid", "title"],
    withs: {
      messages: {
        query: {
          select: [],
          orders: [{ column: "id", option: "desc" }],
          limit: 2,
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

  if (list && list.length) {
    if (list[0].messages) {
      //上面是倒序查找，现在再反过来
      list[0].messages = list[0].messages.reverse();
    }
    return list[0];
  }
}

/**
 * 查询会话中的最新的10条消息
 * @param {string} uuid 会话ID
 * @returns
 *
 *
 * yao-debug run scripts.chat.conversation.FindMessage d9a78a11-6890-46db-87e3-874ca25bdf93
 */
function FindMessage(uuid) {
  CheckConversationId(uuid);
  let conversation = Process("models.chat.conversation.Get", {
    select: ["uuid"],
    withs: {
      messages: {
        query: {
          select: [],
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

  //   let messages = Process("models.chat.message.Get", {
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
 * yao-debug run scripts.chat.conversation.CheckConversationId da472c6c-d2a7-48a2-b4b2-71591660b44f
 * yao-debug run scripts.chat.conversation.CheckConversationId
 */
function CheckConversationId(id) {
  let conversation = Process("models.chat.conversation.Get", {
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

/**
 * vector database (on Weaviate)
 * Will be replaced by the new vector process
 */

const MaxTokens = 1536;

/**
 * Match content from the vector database
 * yao run scripts.doc.vector.Match '::{"pathname":"/x/Table"}' '::[{"role":"user", "content":"Yao 是什么"}]'
 *
 * @param {*} context
 * @param {*} messages
 * @returns
 */
function Match(context, messages) {
  return match(context, messages, 1024);
}

function getFileExtension(filePath) {
  // Extract the last portion of the file path after the last dot
  var re = /(?:\.([^.]+))?$/;

  // Execute the regular expression on the file path
  var ext = re.exec(filePath)[1];

  // Return the extension, or an empty string if there's no extension
  return ext || "";
}

// scripts.doc.vector.uploadFile
function uploadFile(file) {
  let fs = new FS("system");

  const uploadFolder = `/data/upload`;
  const filePath = `/${uploadFolder}/${file.name}`;

  if (!fs.Exists(uploadFolder)) {
    fs.MkdirAll(uploadFolder);
  }
  fs.Move(file.tempFile, `${filePath}`);

  const fname = fs.Abs(filePath);

  const id = Process("models.doc.file.save", {
    filename: file.name,
    task_id: 0,
    path: fname,
    title: "",
    fitle_type: getFileExtension(file.name),
    splitter: "",
    index_status: "new",
  });

  const task_id = Process("tasks.doc.add", id, fname);
  if (task_id == 0) {
    throw Error("Create task failed");
  }
  return {
    message: "TASK ID: " + task_id,
  };
}
/**
 * Search content from the vector database
 * @param {*} input
 * @param {*} page
 * @returns
 */
function Search(input, page) {
  // const params = { input: input, distance: 0.25 };
  // return Process("scripts.doc.Search", params, page, 9);
}
// yao run scripts.doc.vector.indexFile
function indexFile(fname, task_id, record_id) {
  let fs = new FS("system");

  // const uploadFolder = `/data/upload`;
  // const filePath = `/${uploadFolder}/${file.name}`;

  // if (!fs.Exists(uploadFolder)) {
  //   fs.MkdirAll(uploadFolder);
  // }
  // fs.Move(file.tempFile, `${filePath}`);

  // const fname = fs.Abs(filePath);

  const pages = Process("plugins.docloader.text", fname);

  if (pages && pages.code && pages.message) {
    console.log(
      "",
      `docloader.so plugin error: ${pages.code} ${pages.message}`,
      "maybe you need install pdf plugin see here: https://github.com/YaoApp/yao-knowledge-pdf"
    );
    fs.Remove(fname);
    throw new Exception(pages.message, pages.code);
  }

  // alltext = "";
  // pages.data.forEach((p) => {
  //   alltext += p.PageContent + "\n\n";
  // });

  // console.log("Parse the PDF title and summary...");
  Process("models.doc.file.update", record_id, {
    index_status: "creating",
  });
  const total = pages.data.length;
  pages.data.forEach((p, idx) => {
    Process("tasks.doc.progress", task_id, idx, total, ``);

    let content = p.PageContent;

    // const article = Reduce(content);
    // let title = "";
    // let summary = "";
    // try {
    //   title = Process("aigcs.title", article);
    //   summary = Process("aigcs.summary", article);
    // } catch (e) {
    //   fs.Remove(file);
    //   throw e;
    // }

    let input = content.replace(/\*|\n/g, " ");

    const source = "local";

    let embeddingResponse = null;
    if (source == "local") {
      embeddingResponse = http.Post("http://localhost:8001/emb", {
        input: input,
      });
    } else {
      embeddingResponse = Process(
        "openai.Embeddings",
        "text-embedding-ada-002",
        input,
        "user-01"
      );
    }
    if (!embeddingResponse || !embeddingResponse.data) {
      console.log("请求出错");
      throw new Error("请求出错");
    }
    const [{ embedding }] = embeddingResponse.data;

    Process("models.doc.vector.save", {
      // filename: file.name,
      // path: filePath,
      // title,
      // summary,
      index: idx,
      file_id: record_id,
      content: input,
      embedding: JSON.stringify(embedding),
    });
  });
}

/**
 * Save the content to the vector database
 * @param {*} payload
 * @returns
 */
function Save(payload) {
  const fs = new FS("system");
  const id =
    payload.fingerprint || Process("utils.str.UUID").replaceAll("-", "");
  const file = `${id}.pdf`;
  if (fs.Exists(file)) {
    throw new Exception(`${id} content exits`, 409);
  }
  fs.WriteFileBase64(file, payload.content, "0644");
  // =============================================================================
  // Read the PDF content
  // @todo You can add your own code here
  // @see https://github.com/YaoApp/yao-knowledge-pdf
  // ==============================================================================
  const pages = Process("plugins.pdf.Content", fs.Abs(file));
  if (pages && pages.code && pages.message) {
    console.log(
      "",
      `pdf.so plugin error: ${pages.code} ${pages.message}`,
      "maybe you need install pdf plugin see here: https://github.com/YaoApp/yao-knowledge-pdf"
    );
    fs.Remove(file);
    throw new Exception(pages.message, pages.code);
  }
  // fs.Remove(file); // debug
  console.log("Parse the PDF title and summary...");
  const article = Reduce(pages.join("\n\n"));
  let title = "";
  let summary = "";
  try {
    title = Process("aigcs.title", article);
    summary = Process("aigcs.summary", article);
  } catch (e) {
    fs.Remove(file);
    throw e;
  }
  // Save the document to the vector database
  let part = 0;
  pages.forEach((content, index) => {
    content = content.replaceAll(" ", "");
    content = content.replaceAll("\n", "");
    content = content.replaceAll("\r", "");
    // Ignore the short content
    if (content == "" || content.length < 20) {
      return;
    }
    // =============================================================================
    // Save the document to the vector database
    // @todo You can add your own code here
    // ==============================================================================
    const doc = {
      type: "pdf",
      path: file,
      fingerprint: id,
      user: "__public",
      name: title,
      summary: summary,
      content: content,
      part: part,
    };
    const result = Process("scripts.doc.Insert", doc);
    if (result && result.code && result.message) {
      fs.Remove(file);
      throw new Exception(result.message, result.code);
    }
    part = part + 1;
    // Debug
    console.log(doc);
    // openai api limit
    time.Sleep(200);
  });
  // debug
  // console.log(pages);
  return { code: 200, message: "ok" };
}

/**
 * Reduce the content size
 * @param {*} content
 */
function Reduce(content) {
  var tokenSize = MaxTokens;
  if (content.length > 5000) {
    content = content.substring(0, 5000);
  }

  while (tokenSize >= MaxTokens) {
    // process: openai.Tiktoken
    // args[0]: is the model name
    // args[1]: is the content
    tokenSize = Process("openai.Tiktoken", "gpt-3.5-turbo", content);
    content = content.substring(0, content.length - 128);
    console.log(`Reduce the content size to ${tokenSize}`);
  }
  return content;
}

/**
 * ReadFile the doc file
 * scripts.doc.vector.ReadFile
 * @param {*} file
 */
function ReadFile(file) {
  const fs = new FS("system");
  const path = fs.Abs(file);
  // you can add your own code here
  const content = Process("plugins.docloader.text", path);
  if (content && content.code && content.message) {
    throw new Exception(content.message, content.code);
  }
  return content;
}

/**
 * @param {*} context
 * @param {*} messages
 */
function match(context, messages, maxTokenSize) {
  // =============================================================================
  // You can add your own code here
  // Change the code to match your own knowledge base
  // ==============================================================================

  messages = messages || [];
  if (messages.length == 0) {
    throw new Exception("messages is empty", 400);
  }

  const input = messages[messages.length - 1].content || "";
  if (input == "") {
    throw new Exception("input is empty", 400);
  }

  const payload = { input: input, threshold: 0.5, count: 10 };
  const resp = Process("scripts.doc.local.QueryDoc", payload);
  if (resp && resp.code && resp.message) {
    throw new Exception(resp.message, resp.code);
  }

  const docs = resp.data || [];
  return ReduceMessage(messages, docs, maxTokenSize);
}

function ReduceMessage(messages, docs, maxTokenSize) {
  // =============================================================================
  // You can add your own code here
  // Change the code to match your own knowledge base
  // ==============================================================================

  maxTokenSize = maxTokenSize == undefined ? MaxTokens : maxTokenSize;
  newMessages = [
    {
      role: "system",
      content: `
      - The above content is my knowledge base.
      - The field "content" is the content of the document.
      - The field "summary" is the summary of the document.
      - The field "filename" is the title of the document.
      - The field "path" is the file path of the document.
      - The field "type" is the type of the document.
      - Please prioritize answering user questions based on my knowledge base provided to you.
     `,
    },
  ];

  messageText = JSON.stringify(messages);
  let tokenSize = 0;
  while (tokenSize < maxTokenSize) {
    const doc = docs.shift();
    if (!doc) {
      break;
    }
    newMessages.unshift({ role: "system", content: JSON.stringify(doc) });
    const text = JSON.stringify(newMessages) + messageText;
    tokenSize = Process("openai.Tiktoken", "gpt-3.5-turbo", text);
  }

  console.log("--- Vector Query------", messages);

  if (newMessages.length > 1) {
    console.log("--- Vector Match ---", newMessages);
  }

  return newMessages.length > 1 ? newMessages : [];
}

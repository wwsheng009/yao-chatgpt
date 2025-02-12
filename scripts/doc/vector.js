/**
 * vector database (on Weaviate)
 * Will be replaced by the new vector process
 */

const MaxTokens = 1536;

/**
 * Match content from the vector database
 * yao run scripts.doc.vector.Match '::{"pathname":"/x/Table"}' '::[{"role":"user", "content":"Yao 是什么"}]'
 *
 * @param {*} context,由neo调用，不要省略这个参数
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

  const task_id = Process("tasks.doc.add", id, filePath);
  if (task_id == 0) {
    console.log("创建任务失败");
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

// scripts.doc.vector.getEmbedding 'test'
function getEmbedding(content) {
  let input = content.replace(/\*|\n/g, " ");

  let embedding_api_endpoint = Process(
    "utils.env.Get",
    "EMBEDDING_API_ENDPOINT"
  );
  let embeddingResponse = null;
  // 使用私有向量服务
  if (embedding_api_endpoint != "") {
    embeddingResponse = http.Post(embedding_api_endpoint, {
      input: input,
    });
    if (embeddingResponse.code != 200) {
      console.log(embeddingResponse)
      throw new Error(embeddingResponse.data.detail[0].msg);
    }
  } else {
    console.log('input length >' + input.length);

    console.log('input >' + input);
    embeddingResponse = Process(
      "openai.Embeddings",
      'text-embedding-llamacpp',
      // "text-embedding-doubao",
      input
    );
  }

  if (!embeddingResponse || !embeddingResponse.data) {
    console.log("请求出错");
    throw new Error("请求出错");
  }
  const [{ embedding }] = embeddingResponse.data;
  return embedding;
}
// yao run scripts.doc.vector.QueryDoc '::{"input":"系统安装?"}'
// yao run scripts.doc.vector.QueryDoc "浏览器?"

function QueryDoc(payload) {
  if (typeof payload === "string") {
    payload = { input: payload }
  }
  let document = payload.input;

  const embedding = getEmbedding(document);
  const q = new Query();
  const query_embedding = `'${JSON.stringify(embedding)}'`;
  // console.log(query_embedding)

  const match_threshold = payload.threshold || 0.8;
  const match_count = payload.count || 5;
  // const sql = `select id, file_id,content, 1 - (embedding <=> ${query_embedding}::vector) as similarity
  // from doc_vector where 1 - (embedding <=> ${query_embedding}::vector) > ${match_threshold}
  // order by similarity DESC limit ${match_count}`;

  const sql = `select id, file_id,content, 1 - (embedding <=> ${query_embedding}::vector) as similarity
  from doc_vector
  order by similarity DESC limit ${match_count}`;

  // const sql = `
  // SELECT i.id, i.file_id, i.content
  // FROM (
  //     SELECT id,file_id,content, embedding <=> ${query_embedding} AS distance
  //     FROM doc_vector
  //     ORDER BY binary_quantize(embedding::vector)::bit(4096) <~> binary_quantize(${query_embedding}::vector)
  //     LIMIT 1000
  // ) i
  // ORDER BY i.distance
  // LIMIT ${match_count};
  // `

  //   console.log(sql)
  // const sql = `select id, file_id, content, 1 - (embedding <=> ${ query_embedding }) as similarity
  // from doc_vector where 1 - (embedding <=> ${query_embedding}) > ${match_threshold}
  // order by similarity DESC limit ${match_count}`;


  const data = q.Get({
    sql: {
      stmt: sql,
    },
  });
  data.forEach((doc) => {
    doc.file = Process("models.doc.file.find", doc.file_id, {});
  });
  return { data: data };
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

  const pages = Process("plugins.docloader.text", fs.Abs(fname));
  if (pages && pages.code && pages.message) {
    console.log(
      "",
      `docloader.so plugin error: ${pages.code} ${pages.message}`,
      "maybe you need install document loader plugin see here: https://github.com/wwsheng009/yao-plugin-document-loader"
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
    const embedding = getEmbedding(content);
    Process("models.doc.vector.save", {
      // filename: file.name,
      // path: filePath,
      // title,
      // summary,
      index: idx,
      file_id: record_id,
      content: content,
      embedding: JSON.stringify(embedding),
    });
  });
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
  const resp = QueryDoc(payload);
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

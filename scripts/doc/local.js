/**
 * 使用pg数据库，配合pgvector插件作一个本地向量文档搜索
 * 首先需要安装pg数据库，再安装pgvector插件
 * 在pg中创建一个数据库，并且执行以下的命令启用插件
 * CREATE EXTENSION vector
 * 使用yao命令yao migrate
 * yao migrate
 */

// yao run scripts.doc.local.QueryDoc '::{"input":"yao是什么?"}'
function QueryDoc(payload) {
  let document = payload.input;

  let input = document.replace(/\*|\n/g, " ");

  const embeddingResponse = http.Post("http://localhost:8001/emb", {
    input: input,
  });
  if (!embeddingResponse.data) {
    throw new Error("请求出错");
  }

  if (embeddingResponse.code != 200) {
    throw new Error(embeddingResponse.data.detail[0].msg);
  }
  const [{ embedding }] = embeddingResponse.data;
  const q = new Query();
  const query_embedding = `'${JSON.stringify(embedding)}'`;
  const match_threshold = payload.threshold || 0.6;
  const match_count = payload.count || 10;
  const sql = `select id, filename,path,content, 1 - (embedding <=> ${query_embedding}) as similarity
  from documents where 1 - (embedding <=> ${query_embedding}) > ${match_threshold}
  order by similarity DESC limit ${match_count}`;

  const data = q.Get({
    sql: {
      stmt: sql,
    },
  });

  return { data: data };
}

// yao run scripts.test.demoSearch
function demoSearch() {
  return searchText2vect("Did anyone adopt a cat this weekend?");
}
// yao run scripts.test.text2vect 测试

function saveText2vect(document) {
  let input = document.replace(/\*|\n/g, " ");

  const embeddingResponse = http.Post("http://localhost:8001/emb", {
    input: input,
  });

  const [{ embedding }] = embeddingResponse.data;

  Process("models.documents.save", {
    content: document,
    embedding: JSON.stringify(embedding),
  });

  return "ok";
}
// yao run scripts.test.vector
function vector() {
  const q = new Query();
  const sql = `SELECT * FROM items ORDER BY embedding <-> '[3,1,2]' LIMIT 5;`;
  const data = q.Get({
    sql: {
      stmt: sql,
    },
  });

  return data;
}
// yao run scripts.test.demoSave
function demoSave() {
  texts = [
    "I like to eat broccoli and bananas.",
    "I ate a banana and spinach smoothie for breakfast.",
    "Chinchillas and kittens are cute.",
    "My sister adopted a kitten yesterday.",
    "Look at this cute hamster munching on a piece of broccoli.",
  ];

  texts.forEach((text) => {
    saveText2vect(text);
  });
}

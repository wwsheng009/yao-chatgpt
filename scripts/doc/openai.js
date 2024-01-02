// yao run scripts.test.save 测试
function save(document) {
  let input = document.replace(/\*|\n/g, " ");
  const embeddingResponse = Process(
    "openai.Embeddings",
    "text-embedding-ada-002",
    input,
    ""
  );

  const [{ embedding }] = embeddingResponse.data;
  Process("models.documents.save", {
    content: document,
    embedding: JSON.stringify(embedding),
  });

  return "ok";
}
// yao run scripts.test.search "Did anyone adopt a cat this weekend?"
function search(words) {
  const embeddingResponse = Process(
    "openai.Embeddings",
    "text-embedding-ada-002",
    words,
    "user-01"
  );
  const [{ embedding }] = embeddingResponse.data;

  // ("${JSON.stringify(embedding)}");
  const q = new Query();
  const query_embedding = `'${JSON.stringify(embedding)}'`;
  // console.log("query_embedding", query_embedding);
  const match_threshold = 0.7;
  const match_count = 10;
  const sql = `select id, content, 1 - (embedding <=> ${query_embedding}) as similarity
  from documents where 1 - (embedding <=> ${query_embedding}) > ${match_threshold}
  order by similarity DESC limit ${match_count}`;

  // const sql = `SELECT * FROM match_documents('${JSON.stringify(
  //   embedding
  // )}', 0.7, 10);`;
  const data = q.Get({
    sql: {
      stmt: sql,
    },
  });
  return data;
}

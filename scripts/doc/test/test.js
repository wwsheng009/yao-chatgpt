function test() {
  let tableName = "stockcode";
  const wheres = [];
  if (tableName) {
    wheres.push({ column: "table_name", value: tableName });
    wheres.push({ method: "orwhere", column: "name", value: tableName });
  } else {
    wheres.push({ method: "where", column: "name", value: tableName });
  }

  const [line] = Process("models.ddic.model.get", {
    wheres: wheres,
    with: {},
    limit: 1,
  });

  console.log("id:", line.id);
}

// scripts.test.pg
function pg() {
  const q = new Query();
  const sql = `SELECT time_bucket('15 minutes', time) AS fifteen_min,
  location, COUNT(*),
  MAX(temperature) AS max_temp,
  MAX(humidity) AS max_hum
FROM conditions
WHERE time > NOW() - interval '3 hours'
GROUP BY fifteen_min, location
ORDER BY fifteen_min DESC, max_temp DESC;`;
  const data = q.Get({
    sql: {
      stmt: sql,
    },
  });

  return data;
}

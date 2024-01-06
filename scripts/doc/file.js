function Save(payload) {
  //先保存主表，获取id后再保存从表

  const t = new Query();
  t.Run({
    sql: {
      stmt: "START TRANSACTION;",
    },
  });

  let res = null;
  try {
    res = Process("models.doc.file.Save", payload);
    if (res.code && res.code > 300) {
      throw new Exception(res.message, res.code);
    }
    SaveRelations(res, payload);
  } catch (error) {
    console.log("Mode doc.file Save Failed,Payload:", payload);

    t.Run({
      sql: {
        stmt: "ROLLBACK;",
      },
    });

    if (error.message && error.code) {
      console.log("error:", error.code, error.message);
      throw new Exception(error.message, error.code);
    } else {
      console.log("system error:", error);
      throw error;
    }
  }

  t.Run({
    sql: {
      stmt: "COMMIT;",
    },
  });

  return res;
}
//保存关联表数据
function SaveRelations(id, payload) {
  Save_vector(id, payload);
  return id;
}

//删除关联表数据
function BeforeDelete(id) {
  Delete_vector(id);
}

//保存doc.vector
function Save_vector(id, payload) {
  const items = payload.vector || {};
  const deletes = items.delete || [];
  const data = items.data || items || [];
  if (data.length > 0 || deletes.length > 0) {
    // 忽略实际数据 ( 通过 record 计算获取)
    for (const i in data) {
      if (typeof data[i].id === "string" && data[i].id.startsWith("_")) {
        //新增项目，在前端会生成唯一字符串,
        //由于后台使用的自增长ID，不需要生成的唯一字符串，由数据库生成索引
        delete data[i].id;
      }
    }

    // 保存物品清单
    var res = Process("models.doc.vector.EachSaveAfterDelete", deletes, data, {
      file_id: id,
    });
    if (res.code && res.code > 300) {
      console.log("doc.vector:AfterSave Error:", res);
      //console.log(items)
      throw new Exception(res.message, res.code);
    } else {
      return id;
    }
  }
}

//删除doc.vector == file_id
function Delete_vector(id) {
  let rows = Process("models.doc.vector.DeleteWhere", {
    wheres: [{ column: "file_id", value: id }],
  });

  //remembe to return the id in array format
  return [id];
}

//多对一表数据查找
function AfterFind(payload) {
  const t = new Query();
  payload["vector"] = t.Get({
    from: "doc_vector",
    wheres: [
      {
        field: "file_id",
        op: "=",
        value: payload.id,
      },
    ],
    select: ["id", "index", "file_id", "content", "embedding"],
  });
  return payload;
}

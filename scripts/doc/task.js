// scripts.doc.task.Process
/**
 * 任务绑定的处理器，
 * @param {integer} task_id 作业的id,
 * @param {any} args 任务的参数，可以有多个，由tasks.xxx.add处理器传入。
 *
 */
function TaskProcess(task_id, record_id, filename) {
  // 业务处理
  Process("models.doc.file.update", record_id, {
    task_id: task_id,
    index_status: "new",
  });
  Process("scripts.doc.vector.indexFile", filename, task_id, record_id);

  Process("models.doc.file.update", record_id, {
    index_status: "done",
  });
  return {
    message: "done",
  };
}
var task_id = 1024;

/**
 * 任务标识生成器
 * Generate job id，需要返回一个整型的数字，用来生成任务的标识
 * @returns
 */
function NextID() {
  task_id = task_id + 1;
  console.log(`NextID: ${task_id}`);
  return task_id;
}

/**
 * OnAdd add event
 * @param {*} task_id 任务id
 */
function OnAdd(task_id) {
  console.log(`OnAdd: #${task_id}`);
}

/**
 * OnProgress
 * @param {*} task_id task id,任务ID
 * @param {*} current
 * @param {*} total
 * @param {*} message
 */
function OnProgress(task_id, current, total, message) {
  console.log(`OnProgress: #${task_id} ${current}/${total}${message}\r`);
}
/**
 * OnProgress
 * @param {*} task_id task id,任务ID
 * @param {*} res 任务运行处理器返回的结果
 */
function OnSuccess(task_id, res) {
  console.log(`OnSuccess: #${task_id} ${JSON.stringify(res)}`);
}

function OnError(task_id, err) {
  console.log(`OnError: #${task_id} ${err}`);
}

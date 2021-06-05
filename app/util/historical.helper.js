const {GET_EARLIEST_SLOT, GET_LATEST_TASK} = require("./constants");

const client = require('../config/db.config')

const sleep = (ms) => {
  return new Promise ((resolve) => {
    setTimeout(resolve, ms);
  })
}

const convertEpochToTimestamp = (epochTime) => {
  return "'" + new Date(epochTime * 1000).toISOString() + "'";
}

const scheduleTasks = async () => {
  await scheduleMissingDataTasks();
  await scheduleOldTasks();
}

const scheduleMissingDataTasks = async () => {

}

const scheduleOldTasks = async () => {
  await getTaskPosition();
  let earliestSlot = await client.query(`select block from stats.block_stats where mod (block, 2) = ${process.env['taskPosition']} order by block asc limit 1`);
  let latestTask = await client.query(`select slot from stats.tasks where mod (slot, 2) = ${process.env['taskPosition']} and task_type = 'historical' order by slot desc limit 1`);
  console.log(earliestSlot.rows[0]);
  console.log(latestTask.rows[0]);
  let latestScheduled = 0;
  if (!latestTask.rows[0] || earliestSlot.rows[0].block <= latestTask.rows[0].slot) {
    latestScheduled = earliestSlot.rows[0].block;
  } else {
    latestScheduled = latestTask.rows[0].slot;
  }
  let tasks = [...Array(100).keys()]
    .filter((a, i)=>i%2 === parseInt(process.env['taskPosition']) && i !== 0)
    .map(i => latestScheduled - parseInt(process.env['taskPosition']) - i);
  let query = createInsertTaskQuery(tasks, 'historical');
  await client.query(query);
}

const getTasks = async () => {
  return client.query(`SELECT slot FROM STATS.TASKS WHERE OWNER = '${process.env['taskName']}'`);
}

const createInsertTaskQuery = (tasks, type) => {
  let query = 'INSERT INTO STATS.TASKS (slot, task_type, owner, start_time, task_position) VALUES ';
  let currentTimestamp = "'" + new Date().toISOString() + "'"
  tasks.forEach(slot => query += `(${slot}, '${type}', '${process.env['taskName']}', ${currentTimestamp}, ${process.env['taskPosition']}),`);
  return query.replace(/,\s*$/, "");
}

const getTaskPosition = async () => {
  if (!process.env['taskPosition']) {
    let taskPosition = await client.query(`select task_position from stats.tasks where task_type = 'historical' order by slot desc limit 1`);
    if (!taskPosition.rows[0]) {
      process.env['taskPosition'] = 0;
    } else {
      process.env['taskPosition'] = 1;
    }
  }
  return process.env['taskPosition'];
}

exports.sleep = sleep;
exports.convertEpochToTimestamp = convertEpochToTimestamp;
exports.getTasks = getTasks;
exports.scheduleTasks = scheduleTasks;
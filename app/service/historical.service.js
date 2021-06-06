const {getTransactionInfo} = require("./transaction.service");
const {cleanUpTasks, insertNewBlock} = require("./db.service");
const {convertEpochToTimestamp, getTasks, scheduleTasks, sleep} = require("../util/historical.helper");
const {getConfirmedBlock} = require("./rpc.service");

const startHistoricalRetrieval = async () => {
  let sleepTime = 500;
  let taskIndex = 0;
  await scheduleTasks();
  let tasks = await getTasks();
  while (true) {
    let currentSlot = tasks.rows[taskIndex].slot;
    try {
      let confirmedBlock = await getConfirmedBlock(currentSlot);
      let block = confirmedBlock.data;
      if (block.error && (block.error.code === -32007 || block.error.code === -32009)) {
        insertSkippedBlock(currentSlot, block.error.code);
      } else if (block.error && block.error.code === -32004) {
        taskIndex--;
        sleepTime = 2500;
      } else if (block.error) {
        console.log(`Unknown error ${block.error}`);
        console.log(block.error);
        sleepTime = 2500;
      } else {
        analyzeBlock(currentSlot, block.result);
        sleepTime = 500;
      }
    } catch (e) {
      console.log(e);
      taskIndex--;
      sleepTime = 10000;
    }
    if (taskIndex === tasks.rows.length - 1) {
      await cleanUpTasks();
      await scheduleTasks();
      tasks = await getTasks();
      taskIndex = 0;
    } else {
      taskIndex++;
    }
    await sleep(sleepTime);
  }
}

function analyzeBlock(slot, block) {
  let transactionInfo = getTransactionInfo(block);
  let dbKeys = ['block', 'block_time', 'fee_amt', 'num_transactions',
    'num_failed_transactions', 'num_success_transactions', 'num_voting', 'num_serum'];
  let dbValues = [slot, convertEpochToTimestamp(block.blockTime), transactionInfo.fees, transactionInfo.total,
    transactionInfo.numFailed, transactionInfo.numSuccess, transactionInfo.numVote, transactionInfo.numSerum];
  insertNewBlock(dbKeys, dbValues);
}

function insertSkippedBlock(slot, code) {
  let dbKeys = ['block', 'skipped', 'code'];
  let dbValues = [slot, true, code];
  insertNewBlock(dbKeys, dbValues);
}

exports.startHistoricalRetrieval = startHistoricalRetrieval;
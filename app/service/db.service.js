const client = require('../config/db.config')

const getRowsMissing = () => {

}

const getTasks = () => {

}

const insertNewTasks = () => {

}

const cleanUpTasks = async () => {
  await client.query(`DELETE FROM STATS.TASKS WHERE OWNER = '${process.env['taskName']}'`);
  await client.query(`DELETE FROM STATS.TASKS WHERE START_TIME < (NOW() - INTERVAL '10' MINUTE )`)
}

const updateBlock = (keys, values) => {

}

const insertNewBlock = (keys, values) => {
  let keyQuery = createQuery(keys);
  let valuesQuery = createQuery(values);
  let query = `INSERT INTO stats.block_stats (${keyQuery}) VALUES (${valuesQuery})`;
  client.query(query, (err, res) => {
    if (err) {
      console.log(`Error inserting slot ${values[0]}`);
      console.log(err);
    } else {
      console.log(`Insertion of slot ${values[0]} successful`)
    }
  });
}

const createQuery = (keys) => {
  let keyQuery = '';
  keys.forEach(key => keyQuery += key + ',');
  return keyQuery.replace(/,\s*$/, "");
}

exports.insertNewBlock = insertNewBlock;
exports.getRowsMissing = getRowsMissing;
exports.getTasks = getTasks;
exports.insertNewTasks = insertNewTasks;
exports.cleanUpTasks = cleanUpTasks;
exports.updateBlock = updateBlock;
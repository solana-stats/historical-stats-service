
async function healthCheck(req, res) {
  res.send('Historical Service is healthy');
}

module.exports = healthCheck;
let AWS = require('aws-sdk'),
  region = "us-east-1",
  secretName = "prod/solanastats/db",
  secret,
  decodedBinarySecret;

const awsClient = new AWS.SecretsManager({
  region: region
});

const readSecrets = async () => {
  return new Promise(function (resolve, reject) {
    awsClient.getSecretValue({SecretId: secretName}, function(err, data) {
      if (err) {
        throw err;
      }
      else {
        if ('SecretString' in data) {
          secret = JSON.parse(data.SecretString);
          process.env['dbUsername'] = secret.username;
          process.env['dbPassword'] = secret.password;
          process.env['dbHost'] = secret.host;
          process.env['dbPort'] = secret.port;
          process.env['dbName'] = secret.dbname;
          resolve(true);
        } else {
          let buff = new Buffer(data.SecretBinary, 'base64');
          decodedBinarySecret = buff.toString('ascii');
        }
      }
    });
  });
};

exports.readSecrets = readSecrets;
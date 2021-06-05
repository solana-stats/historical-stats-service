const axios = require('axios');

const web3Config = {
  rpcs: [
    { url: 'https://api.mainnet-beta.solana.com', weight: 50},
    { url: 'https://api.rpcpool.com', weight: 30},
    { url: 'https://solana-api.projectserum.com', weight: 20}
  ]
};

const getBlockBody = (slot) => {
  return {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getConfirmedBlock",
    "params": [
      slot,
      {
        "encoding": "jsonParsed",
        "transactionDetails": "full",
        "rewards": false
      }
    ]
  };
}

const getSlotBody = {
  "jsonrpc":"2.0",
  "id":1,
  "method":"getSlot"
}

const getRpcUrl = () => {
  let currentNumber = 0;
  const randomNum = Math.random() * 100
  for (const endpoint of web3Config.rpcs) {
    if (currentNumber <= randomNum <= + currentNumber + endpoint.weight) {
      return endpoint.url;
    }
    currentNumber += endpoint.weight;
  }
};

const getConfirmedBlock = async (slot) => {
  const endpoint = getRpcUrl();
  const getBlock = getBlockBody(slot);
  return await axios.post(endpoint, getBlock);
};

const getCurrentSlot = () => {
  return axios.post(getRpcUrl(), getSlotBody);
};

exports.getConfirmedBlock = getConfirmedBlock;
exports.getCurrentSlot = getCurrentSlot;
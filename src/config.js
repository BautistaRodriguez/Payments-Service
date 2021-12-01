require("dotenv").config();
const network = "kovan";
const deployArtifact = require(`../deployments/${network}/BasicPayments`);
const deployerMnemonic = process.env.MNEMONIC;
const infuraApiKey = process.env.INFURA_API_KEY;

module.exports = {
  contractAddress: deployArtifact.address,
  contractAbi: deployArtifact.abi,
  deployerMnemonic,
  infuraApiKey,
  network,
};

/* eslint-disable no-undef */
module.exports = {
  port: process.env.PORT || 8080,
  log: {
    error: process.env.LOG_ERROR == undefined || process.env.LOG_ERROR == "true",
    warn: process.env.LOG_WARN == undefined || process.env.LOG_WARN == "true",
    info: process.env.LOG_INFO == undefined || process.env.LOG_INFO == "true",
    debug: process.env.LOG_DEBUG == undefined || process.env.LOG_DEBUG == "true",
  }
};

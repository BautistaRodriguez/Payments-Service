const ethers = require("ethers");
const { logInfo, logError } = require("../utils/log");
const databaseConfig = require("../databasepg")

const getDeployerWallet = ({ config }) => () => {
  const provider = new ethers.providers.InfuraProvider(config.network, config.infuraApiKey);
  const wallet = ethers.Wallet.fromMnemonic(config.deployerMnemonic).connect(provider);
  return wallet;
};

/* Crea una wallet nueva con un proveedor (en este caso es infura), nos conectamos a la blockchain kovan a traves
de infura */
const createWallet = (userId) => async (userId) => {
  logInfo("Creating wallet for user " + userId)

  const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_API_KEY);

  // This may break in some environments, keep an eye on it
  const wallet = ethers.Wallet.createRandom().connect(provider);

  var client = databaseConfig.client;

  const queryParams ={
    name: 'Create wallet',
    text:  'INSERT INTO wallet_info(user_id, wallet_address, wallet_private_key) VALUES ($1, $2, $3)',
    values: [userId, wallet.address, wallet.privateKey],
  }

  client.query(queryParams, (err,res) => {
    if (!err) {
      console.log(res)
    } else {
      console.log(err.message);
    }
  })

  const result = {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };

  // Close client
  client.end;

  return result;
};



const getWalletForUser = userId => new Promise((resolve, reject) => {
  var client = databaseConfig.client;

  const queryParams ={
    name: 'Get wallet',
    text:  'SELECT * FROM wallet_info w WHERE w.User_id = $1',
    values: [userId],
  }

  client.query(queryParams, (err, res) => {
    if (!err) {
      logInfo("Wallet address " + res.rows[0]['wallet_address'] + " for user id " + userId)
      return resolve(res)
    } else {
      return reject(err)
    }
  })

  client.end
})

const getWallet = () => (userId) => {
  logInfo("Getting wallet for user id " + userId)

  const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_API_KEY);

  return new Promise ((resolve, reject) => {
    getWalletForUser(userId)
      .then(queryResponse => resolve(new ethers.Wallet(queryResponse.rows[0]['wallet_private_key'], provider)))
      .catch(err => reject(logError(err.message)))
  })
};

module.exports = ({ config }) => ({
  createWallet: createWallet({ config }),
  getDeployerWallet: getDeployerWallet({ config }),
  getWallet: getWallet({ config }),
});

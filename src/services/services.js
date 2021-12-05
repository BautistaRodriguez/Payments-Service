const walletService = require("./wallets");
const contractInteraction = require("./contractInteraction");
const suscriptionService = require("./suscriptionService");

module.exports = ({ config }) => ({
  walletService: walletService({ config }),
  contractInteraction: contractInteraction({ config }),
  suscriptionService: suscriptionService({ config })
});

const { logInfo } = require("../utils/log");

function schema() {
  return {
    params: {
      type: "object",
      properties: {
        id: {
          type: "integer",
        },
      },
    },
    required: ["id"],
  };
}

function handler({ walletService }) {
  return async function (req, reply) {
    logInfo("Getting wallet for user " + req.params.id)

    walletService.getWallet(req.params.id, function(wallet){
      reply.code(200).send(wallet);
    });
  };
}

module.exports = { handler, schema };

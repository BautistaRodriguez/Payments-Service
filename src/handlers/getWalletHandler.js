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
  return function (req, reply) {
    walletService.getWallet(req.params.id)
      .then(wallet => reply.code(200).send(wallet))
      .catch(err => reply.code(400).send(err))
  }
}

module.exports = { handler, schema };

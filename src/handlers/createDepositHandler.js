const { logInfo, logError } = require("../utils/log");

function schema() {
  return {
    params: {
      type: "object",
      properties: {
        senderId: {
          type: "integer",
        },
        suscriptionId: {
          type: "integer",
        },
      },
    },
    required: ["suscriptionId", "senderId"],
  };
}

function handler({ contractInteraction, walletService, suscriptionService }) {
  return function (req, reply) {
    Promise.all([suscriptionService.getSuscriptionPrice(req.body.suscriptionId), walletService.getWallet(req.body.senderId)])
      .then(async ([price, senderWallet]) => {
        var tx

        try {
          // Update table
          await suscriptionService.updateUserSuscription(req.body.suscriptionId, req.body.senderId)

          // Make new deposit to contract
          tx = await contractInteraction.deposit(senderWallet, (price+0.0001).toString())
        } catch (err) {
          logError("Transaction failed!")
          reply.code(400).send(err.message)
          return
        }

        logInfo("Transaction succeed!")
        reply.code(201).send(tx)
      })
      .catch(err => reply.code(400).send(err))
    }
}

module.exports = { schema, handler };

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
    if (req.body.suscriptionId == 1) {
      logInfo("Suscription is free!")
      reply.code(201).send(tx)
      return
    }

    Promise.all([suscriptionService.getSuscriptionPrice(req.body.suscriptionId), walletService.getWallet(req.body.senderId)])
      .then(async ([price, senderWallet]) => {
        var tx

        try {
          // Update table
          suscriptionService.updateUserSuscription(req.body.suscriptionId, req.body.senderId, true)
            .then(
              // Make new deposit to contract
              tx = await contractInteraction.deposit(senderWallet, price.toString())
            )
            .catch(err => {
              logError("Transaction failed with error " + err.message + " for user " + req.body.senderId)
              reply.code(400).send(err.message)
            })
        } catch (err) {
          logError("Transaction failed with error " + err.message + ". Rollbacking table for user " + req.body.senderId)

          suscriptionService.updateUserSuscription(req.body.suscriptionId, req.body.senderId, false) // is_paid false
            .then(reply.code(400).send(err.message))
            .catch(err => logError(err.message))
        }

        logInfo("Transaction succeed!")
        reply.code(201).send(tx)
      })
      .catch(err => reply.code(400).send(err))
    }
}

module.exports = { schema, handler };

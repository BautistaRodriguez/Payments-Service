const { logInfo, logError } = require("../utils/log");

function schema() {
  return {
    params: {
      type: "object",
      properties: {
        senderId: {
          type: "integer",
        },
        amountInEthers: {
          type: "string",
        },
      },
    },
    required: ["senderId", "amountInEthers"],
  };
}

function handler({ contractInteraction, walletService, suscriptionService }) {
  return function (req, reply) {
    Promise.all([suscriptionService.getSuscriptionPrice(req.body.suscriptionId), walletService.getWallet(req.body.senderId)])
      .then(async ([price, senderWallet]) => {
        console.log("Price for suscription is: " + price)

        try {
          const tx = await contractInteraction.deposit(senderWallet, (price+0.0001).toString())
          logInfo("Transaction succeed!")

          reply.code(201).send(tx)
        } catch (err) {
          logError("Transaction failed!")
          reply.code(400).send("An error ocurred during payment. Please, check if you hace neccessary founds.")
        }

      })
      .catch(err => reply.code(400).send(err))
    }
}

module.exports = { schema, handler };

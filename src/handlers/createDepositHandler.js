const { logInfo } = require("../utils/log");

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
      .then(([price, senderWallet]) => {
        console.log("Price for suscription is: " + price)
        const tx = contractInteraction.deposit(senderWallet, price.toString())
        reply.code(201).send("Transaction success!")
      })
      .catch(err => reply.code(400).send(err))
    }
}

module.exports = { schema, handler };

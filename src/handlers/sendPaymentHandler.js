function schema() {
  return {
    params: {
      type: "object",
      properties: {
        walletAddress: {
          type: "string",
        },
      },
    },
    required: ["walletAddress"],
  };
}

function handler({ config, walletService, contractInteraction }) {
  return async function (req, reply) {
    const body = await contractInteraction.sendMoneyToWallet(walletService.getWallet(1), 
      req.body.amountInEthers, 
      walletService.getDeployerWallet(config));
    reply.code(200).send(body);
  };
}

module.exports = { handler, schema };

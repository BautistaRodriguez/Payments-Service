const ethers = require("ethers");
const { logInfo } = require("../utils/log");

const getContract = (config, wallet) => {
  return new ethers.Contract(config.contractAddress, config.contractAbi, wallet);
};

const deposits = {};

const sendMoneyToWallet = ({config}) => async (receiverAddress, amountToSend, deployerWallet) => {
  logInfo("Sending money to wallet with address: " + receiverAddress + " from deployer waller: " + deployerWallet.address)
  const basicPayments = await getContract(config, deployerWallet)

  logInfo("Signer is " + basicPayments.signer.address)

  amountToSend = await ethers.utils.parseEther(amountToSend).toHexString()
  paymentTx = await basicPayments.sendPayment(receiverAddress, amountToSend)

  logInfo("Transaction succeed! Money sent to wallet " + receiverAddress + "\nTx hash: " + paymentTx['hash'])
  return paymentTx
}

const deposit = ({ config }) => async (senderWallet, amountToSend) => {
  /* basic payments es el smart contract */
  const basicPayments = await getContract(config, senderWallet);
  const tx = await basicPayments.deposit({
    value: await ethers.utils.parseEther(amountToSend).toHexString(),
  });

  /* No se queda esperando a que se mine, sucede asincronicamente */
  tx.wait(1).then(
    receipt => {
      /* Aca chequeamos si se hizo el deposito bien */
      console.log("Transaction mined");
      const firstEvent = receipt && receipt.events && receipt.events[0];
      console.log(firstEvent);
      if (firstEvent && firstEvent.event == "DepositMade") {
        deposits[tx.hash] = {
          senderAddress: firstEvent.args.sender,
          amountSent: firstEvent.args.amount,
        };
      } else {
        console.error(`Payment not created in tx ${tx.hash}`);
      }
    },
    error => {
      const reasonsList = error.results && Object.values(error.results).map(o => o.reason);
      const message = error instanceof Object && "message" in error ? error.message : JSON.stringify(error);
      console.error("reasons List");
      console.error(reasonsList);

      console.error("message");
      console.error(message);
    },
  );
  return tx;
};

const getDepositReceipt = ({}) => async depositTxHash => {
  return deposits[depositTxHash];
};

module.exports = dependencies => ({
  deposit: deposit(dependencies),
  getDepositReceipt: getDepositReceipt(dependencies),
  sendMoneyToWallet: sendMoneyToWallet(dependencies)
});

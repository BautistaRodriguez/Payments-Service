import chai from "chai";
import { waffle, ethers, getNamedAccounts } from "hardhat";
import { fixtureDeployedBasicPayments } from "./common-fixtures";
import { ContractTransaction } from "ethers";
import { BasicPayments } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber } from "@ethersproject/bignumber/lib/bignumber";

const { loadFixture } = waffle;

const { expect } = chai;

type PaymentFunction = (contractWithSigner: BasicPayments, amountToBeSent: BigNumber) => Promise<ContractTransaction>;
const deposit: PaymentFunction = (contractWithSigner, amountToBeSent) => {
  return contractWithSigner.deposit({ value: amountToBeSent });
};

const receiveFallback: PaymentFunction = (contractWithSigner, amountToBeSent) => {
  return contractWithSigner.signer.sendTransaction({
    to: contractWithSigner.address,
    value: BigNumber.from(amountToBeSent).toHexString(),
  });
};

const makeTestsPaymentToContract = (paymentFunction: PaymentFunction, functionName: string) => {
  describe(`BasicPayments - Send payments to contract through ${functionName}`, function () {
    describe(`GIVEN the Smart Contract was deployed`, () => {
      let basicPayments: BasicPayments;
      before(async function () {
        basicPayments = await loadFixture(fixtureDeployedBasicPayments);
      });
      const testPaymentReceiving = (amountToBeSentInEthers: string) => {
        describe(`WHEN a user sends a payment of 3 ethers`, function () {
          let paymentTx: ContractTransaction;
          let sender: SignerWithAddress;
          let amountToBeSentPreviously: BigNumber;
          const amountToBeSent = ethers.utils.parseEther(amountToBeSentInEthers);
          before(async function () {
            const { sender: senderAddress } = await getNamedAccounts();
            sender = await ethers.getSigner(senderAddress);
            amountToBeSentPreviously = await basicPayments.sentPayments(sender.address);
            paymentTx = await paymentFunction(basicPayments.connect(sender), amountToBeSent);
          });
          it(`THEN the sender decreases its balance in ${amountToBeSentInEthers} ethers`, async function () {
            return expect(paymentTx).to.changeEtherBalance(sender, amountToBeSent.mul(-1));
          });

          it(`THEN the contract increases its balance in ${amountToBeSentInEthers} ethers`, async function () {
            return expect(paymentTx).to.changeEtherBalance(basicPayments, amountToBeSent);
          });

          it(`THEN the contract emits a DepositMade event`, async function () {
            return expect(paymentTx).to.emit(basicPayments, "DepositMade").withArgs(sender.address, amountToBeSent);
          });

          it(`THEN the contract marks that the user has sent the funds`, async function () {
            return expect(await basicPayments.sentPayments(sender.address)).to.be.eq(
              amountToBeSentPreviously.add(amountToBeSent),
            );
          });
        });
      };

      testPaymentReceiving("3");
      testPaymentReceiving("5");
      testPaymentReceiving("100");
      testPaymentReceiving("0.0001");

      describe(`WHEN a user sends a payment of 0 ethers`, function () {
        let paymentTx: Promise<ContractTransaction>;
        let sender: SignerWithAddress;
        const amountToBeSentInEthers = "0";
        const amountToBeSent = ethers.utils.parseEther(amountToBeSentInEthers);
        it(`THEN the tx fails`, async function () {
          const { sender: senderAddress } = await getNamedAccounts();
          sender = await ethers.getSigner(senderAddress);
          paymentTx = paymentFunction(basicPayments.connect(sender), amountToBeSent);
          return expect(paymentTx).to.be.revertedWith("did not send any value");
        });
      });
    });
  });
};

makeTestsPaymentToContract(receiveFallback, "receiveFallback");
makeTestsPaymentToContract(deposit, "deposit");

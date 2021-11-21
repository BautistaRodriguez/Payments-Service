import chai from "chai";
import { waffle, ethers, getNamedAccounts } from "hardhat";
import { fixtureDepositMade } from "./common-fixtures";
import { ContractTransaction } from "ethers";
import { BasicPayments } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const { loadFixture } = waffle;

const { expect } = chai;

describe(`BasicPayments - Send payments from contract`, function () {
  const amountToBeReceivedInEthers = "3";
  const amountReceived = ethers.utils.parseEther(amountToBeReceivedInEthers);
  const fixture = fixtureDepositMade(amountReceived);
  const testSendPayment = (amountToBeSentInEthers: string) => {
    const amountToBeSent = ethers.utils.parseEther(amountToBeSentInEthers);
    describe(`GIVEN the Smart Contract was deployed and ${amountToBeReceivedInEthers} ethers were sent`, () => {
      let paymentTx: ContractTransaction;
      let basicPayments: BasicPayments;
      beforeEach(async function () {
        ({ basicPayments } = await loadFixture(fixture));
      });
      describe(`WHEN the owner makes a payment that spends ${amountToBeSentInEthers} ether`, function () {
        let sender: SignerWithAddress;
        let receiver: SignerWithAddress;
        beforeEach(async function () {
          const { sender: senderAddress, receiver: receiverAddress } = await getNamedAccounts();
          sender = await ethers.getSigner(senderAddress);
          receiver = await ethers.getSigner(receiverAddress);
          paymentTx = await basicPayments.sendPayment(receiverAddress, amountToBeSent);
        });
        it(`THEN the contract decreases its balance in ${amountToBeReceivedInEthers} ethers`, function () {
          return expect(paymentTx).to.changeEtherBalance(basicPayments, amountToBeSent.mul(-1));
        });
        it(`THEN the owner keeps the same balance`, function () {
          return expect(paymentTx).to.changeEtherBalance(sender, 0);
        });
        it(`THEN the receiver increases its balance in ${amountToBeReceivedInEthers} ethers`, function () {
          return expect(paymentTx).to.changeEtherBalance(receiver, amountToBeSent);
        });
        it(`THEN a PaymentMade event is emited`, function () {
          return expect(paymentTx).to.emit(basicPayments, "PaymentMade").withArgs(receiver.address, amountToBeSent);
        });
      });
    });
  };

  testSendPayment(amountToBeReceivedInEthers);
  testSendPayment("1");
  testSendPayment("0.0001");

  describe(`GIVEN the Smart Contract was deployed and ${amountToBeReceivedInEthers} ethers were sent`, () => {
    let basicPayments: BasicPayments;
    beforeEach(async function () {
      ({ basicPayments } = await loadFixture(fixture));
    });
    describe(`WHEN a payment is tried to be made with 0 ethers`, function () {
      let paymentTx: Promise<ContractTransaction>;
      const amountToBeSentInEthers = "0";
      const amountToBeSent = ethers.utils.parseEther(amountToBeSentInEthers);
      it(`THEN the tx fails`, async function () {
        const { receiver: receiverAddress } = await getNamedAccounts();
        paymentTx = basicPayments.sendPayment(receiverAddress, amountToBeSent);
        return expect(paymentTx).to.be.revertedWith("cannot send 0 weis");
      });
    });
  });
  describe(`GIVEN the Smart Contract was deployed and ${amountToBeReceivedInEthers} ethers were sent`, () => {
    let basicPayments: BasicPayments;
    beforeEach(async function () {
      ({ basicPayments } = await loadFixture(fixture));
    });
    describe(`WHEN a payment is tried to be made with ${amountReceived
      .add(1)
      .toString()} weis, just above the limit`, function () {
      let paymentTx: Promise<ContractTransaction>;
      const amountToBeSent = amountReceived.add(1);
      it(`THEN the tx fails`, async function () {
        const { receiver: receiverAddress } = await getNamedAccounts();
        paymentTx = basicPayments.sendPayment(receiverAddress, amountToBeSent);
        return expect(paymentTx).to.be.revertedWith("not enough balance");
      });
    });
  });
  describe(`GIVEN the Smart Contract was deployed and ${amountToBeReceivedInEthers} ethers were sent`, () => {
    let basicPayments: BasicPayments;
    beforeEach(async function () {
      ({ basicPayments } = await loadFixture(fixture));
    });
    describe(`WHEN a payment is tried to be made by a non owner signer`, function () {
      let paymentTx: Promise<ContractTransaction>;
      let sender: SignerWithAddress;
      const amountToBeSent = amountReceived.add(1);
      it(`THEN the tx fails`, async function () {
        const { sender: senderAddress, receiver: receiverAddress } = await getNamedAccounts();
        sender = await ethers.getSigner(senderAddress);
        paymentTx = basicPayments.connect(sender).sendPayment(receiverAddress, amountToBeSent);
        return expect(paymentTx).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});

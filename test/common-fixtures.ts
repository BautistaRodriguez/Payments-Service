import { ethers, waffle, getNamedAccounts, deployments } from "hardhat";
import { Wallet, Transaction, BigNumberish } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockProvider } from "ethereum-waffle";
import { BasicPayments } from "../typechain";
const { loadFixture } = waffle;

export async function fixtureDeployedBasicPayments(): Promise<BasicPayments> {
  await deployments.fixture();
  const { deployer } = await getNamedAccounts();
  const basicPayments = <unknown>await ethers.getContract("BasicPayments", deployer);
  return basicPayments as BasicPayments;
}

export function fixtureDepositMade(amountToBeSent: BigNumberish) {
  return async function fixtureProjectCreated(
    _w: Wallet[],
    _p: MockProvider,
  ): Promise<{
    paymentTx: Transaction;
    basicPayments: BasicPayments;
    deployer: SignerWithAddress;
    sender: SignerWithAddress;
  }> {
    const { deployer: deployerAddress, sender: senderAddress } = await getNamedAccounts();
    const deployer = await ethers.getSigner(deployerAddress);
    const sender = await ethers.getSigner(senderAddress);
    const basicPayments = await loadFixture(fixtureDeployedBasicPayments);
    const paymentTx = <Transaction>await basicPayments.deposit({ value: amountToBeSent });
    return {
      paymentTx,
      basicPayments,
      deployer,
      sender,
    };
  };
}

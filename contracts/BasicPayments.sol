// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
    @title BasicPayments Contract
    @author Taller de programacion 2 - FIUBA - Ayudantes
    @notice This contract allows you to track payments made to it
    @dev This is an academic contract made for didactic purposes. DO NOT USE THIS IN PRODUCTION
 */
contract BasicPayments is Ownable {
    using SafeMath for uint256;

    event PaymentMade(address indexed receiver, uint256 amount);

    event DepositMade(address indexed sender, uint256 amount);

    /**
        @notice Mapping of payments sent to an address
     */
    mapping(address => uint256) public sentPayments;

    /**
        @notice Function to receive payments
        Emits DepositMade with the sender and the amount as a parameter
        Fails if value sent is 0
        @dev it calls an internal function that does this entirely
     */

    function deposit() external payable {
        _deposit(msg.sender, msg.value);
    }

    /**
        @notice Sends the specified amount to the specified address
        Emits PaymentMade with the receiver and the amount as a parameter
        Fails if value sent is greater than the balance the contract has
        Fails if not called by the owner
        @dev updates sentPayments mapping
        @param receiver Address that will receive the payment
        @param amount Amount to be sent
     */
     /*Onlyowner hace que esta funcion solo se pueda usar desde el que deployo el contrato */
    function sendPayment(address payable receiver, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "not enough balance");
        require(amount > 0, "cannot send 0 weis");
        emit PaymentMade(receiver, amount);
        (bool success, ) = receiver.call{ value: amount }("");
        require(success, "payment failed");
    }


    /**
        @notice fallback function: acts in the same way that deposit does
     */
    receive() external payable {
        _deposit(msg.sender, msg.value);
    }

    /**
        @notice Function to receive payments
        Emits DepositMade with the sender and the amount as a parameter
        Fails if value sent is 0
        @dev it calls an internal function that does this entirely
     */
    function _deposit(address sender, uint256 amount) internal {
        require(amount > 0, "did not send any value");
        sentPayments[sender] = sentPayments[sender].add(amount);
        emit DepositMade(sender, amount);
    }
}

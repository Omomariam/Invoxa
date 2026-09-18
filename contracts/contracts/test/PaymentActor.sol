// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IInvoxa {
    function createInvoice(address, string calldata, uint256, uint256, string calldata) external returns (uint256);
    function payInvoice(uint256) external payable;
    function cancelInvoice(uint256) external;
}

contract PaymentActor {
    IInvoxa public immutable invoxa;
    bool public reject;
    bool public attack;
    bool public reentrySucceeded;
    constructor(address target) { invoxa = IInvoxa(target); }
    function configure(bool rejection, bool reentry) external { reject = rejection; attack = reentry; }
    function issue(address client, uint256 amount, uint256 due) external { invoxa.createInvoice(client, "Test", amount, due, "TEST"); }
    function pay(uint256 id) external payable { invoxa.payInvoice{value: msg.value}(id); }
    receive() external payable {
        require(!reject, "Recipient rejected transfer");
        if (attack) {
            (reentrySucceeded,) = address(invoxa).call(abi.encodeCall(IInvoxa.payInvoice, (0)));
        }
    }
}

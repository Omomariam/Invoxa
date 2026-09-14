import { expect } from "chai";
import { ethers } from "hardhat";
import { Invoxa } from "../typechain-types";

describe("Invoxa", function () {
  let invoxa: Invoxa;
  let owner: any;
  let client: any;
  let other: any;

  beforeEach(async function () {
    [owner, client, other] = await ethers.getSigners();

    const InvoxaContract = await ethers.getContractFactory("Invoxa");
    invoxa = await InvoxaContract.deploy();
    await invoxa.waitForDeployment();
  });

  describe("Invoice Creation", function () {
    it("Should create an invoice", async function () {
      const amount = ethers.parseEther("10");
      const dueDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

      const tx = await invoxa.createInvoice(
        client.address,
        "Development Services",
        amount,
        dueDate,
        "INV-001"
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      const totalInvoices = await invoxa.getTotalInvoices();
      expect(totalInvoices).to.equal(1);
    });

    it("Should revert if client address is zero", async function () {
      const amount = ethers.parseEther("10");
      const dueDate = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        invoxa.createInvoice(
          ethers.ZeroAddress,
          "Development Services",
          amount,
          dueDate,
          "INV-001"
        )
      ).to.be.revertedWith("Invalid client address");
    });

    it("Should revert if amount is zero", async function () {
      const dueDate = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        invoxa.createInvoice(
          client.address,
          "Development Services",
          0,
          dueDate,
          "INV-001"
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Invoice Payment", function () {
    let invoiceId: number;
    let amount: any;

    beforeEach(async function () {
      amount = ethers.parseEther("10");
      const dueDate = Math.floor(Date.now() / 1000) + 86400;

      const tx = await invoxa.createInvoice(
        client.address,
        "Development Services",
        amount,
        dueDate,
        "INV-001"
      );

      await tx.wait();
      invoiceId = 0;
    });

    it("Should pay an invoice", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);

      await invoxa.connect(client).payInvoice(invoiceId, { value: amount });

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should revert if not enough payment", async function () {
      const insufficientAmount = ethers.parseEther("5");

      await expect(
        invoxa.connect(client).payInvoice(invoiceId, { value: insufficientAmount })
      ).to.be.revertedWith("Insufficient payment amount");
    });
  });

  describe("Invoice Cancellation", function () {
    let invoiceId: number;

    beforeEach(async function () {
      const amount = ethers.parseEther("10");
      const dueDate = Math.floor(Date.now() / 1000) + 86400;

      const tx = await invoxa.createInvoice(
        client.address,
        "Development Services",
        amount,
        dueDate,
        "INV-001"
      );

      await tx.wait();
      invoiceId = 0;
    });

    it("Should cancel an invoice", async function () {
      await invoxa.cancelInvoice(invoiceId);

      const invoice = await invoxa.getInvoice(invoiceId);
      expect(invoice.status).to.equal(2); // Cancelled status
    });

    it("Should revert if not issuer", async function () {
      await expect(
        invoxa.connect(client).cancelInvoice(invoiceId)
      ).to.be.revertedWith("Only issuer can cancel");
    });
  });
});

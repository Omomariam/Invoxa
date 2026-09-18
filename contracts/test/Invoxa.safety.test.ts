import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('Invoxa mainnet safety', () => {
  async function setup() {
    const [issuer, client, outsider] = await ethers.getSigners();
    const invoxa = await (await ethers.getContractFactory('Invoxa')).deploy();
    const amount = ethers.parseEther('1');
    const due = await time.latest() + 86400;
    await invoxa.createInvoice(client.address, 'Public description', amount, due, 'INV');
    return { invoxa, issuer, client, outsider, amount, due };
  }
  it('rejects unknown IDs including read and overdue queries', async () => {
    const { invoxa, client, amount } = await setup();
    await expect(invoxa.getInvoice(1)).revertedWith('Invoice does not exist');
    await expect(invoxa.isOverdue(1)).revertedWith('Invoice does not exist');
    await expect(invoxa.cancelInvoice(1)).revertedWith('Invoice does not exist');
    await expect(invoxa.connect(client).payInvoice(1, { value: amount })).revertedWith('Invoice does not exist');
  });
  it('rejects wrong payer and duplicate settlement, then rejects cancellation', async () => {
    const { invoxa, client, outsider, amount } = await setup();
    await expect(invoxa.connect(outsider).payInvoice(0, { value: amount })).revertedWith('Only client can pay');
    await invoxa.connect(client).payInvoice(0, { value: amount });
    await expect(invoxa.connect(client).payInvoice(0, { value: amount })).revertedWith('Invoice is not pending');
    await expect(invoxa.cancelInvoice(0)).revertedWith('Only pending invoices can be cancelled');
  });
  it('prevents payment after cancellation', async () => {
    const { invoxa, client, amount } = await setup();
    await invoxa.cancelInvoice(0);
    await expect(invoxa.connect(client).payInvoice(0, { value: amount })).revertedWith('Invoice is not pending');
  });
  it('forwards exactly the invoice amount and refunds excess', async () => {
    const { invoxa, issuer, client, amount } = await setup();
    await expect(invoxa.connect(client).payInvoice(0, { value: amount * 2n })).changeEtherBalances([issuer, client, invoxa], [amount, -amount, 0]);
    expect((await invoxa.getInvoice(0)).status).equal(1);
  });
  it('uses chain time for overdue and validates creation', async () => {
    const { invoxa, client, amount, due } = await setup();
    await expect(invoxa.createInvoice(client.address, '', amount, due, 'INV')).revertedWith('Description cannot be empty');
    await expect(invoxa.createInvoice(client.address, 'Test', amount, await time.latest(), 'INV')).revertedWith('Due date must be in the future');
    await time.increaseTo(due + 1);
    expect(await invoxa.isOverdue(0)).equal(true);
    await invoxa.cancelInvoice(0);
    expect(await invoxa.isOverdue(0)).equal(false);
  });
  it('restricts withdrawal and supports ownership transfer', async () => {
    const { invoxa, issuer, outsider, amount } = await setup();
    await issuer.sendTransaction({ to: await invoxa.getAddress(), value: amount });
    await expect(invoxa.connect(outsider).withdraw()).revertedWithCustomError(invoxa, 'OwnableUnauthorizedAccount');
    await invoxa.transferOwnership(outsider.address);
    await expect(invoxa.withdraw()).revertedWithCustomError(invoxa, 'OwnableUnauthorizedAccount');
    await expect(invoxa.connect(outsider).withdraw()).changeEtherBalances([invoxa, outsider], [-amount, amount]);
  });
  it('rolls settlement back when issuer rejects payment', async () => {
    const { invoxa, client, amount, due } = await setup();
    const actor = await (await ethers.getContractFactory('PaymentActor')).deploy(await invoxa.getAddress());
    await actor.issue(client.address, amount, due);
    await actor.configure(true, false);
    await expect(invoxa.connect(client).payInvoice(1, { value: amount })).revertedWith('Payment transfer failed');
    expect((await invoxa.getInvoice(1)).status).equal(0);
  });
  it('rolls settlement back when client rejects an excess refund', async () => {
    const { invoxa, amount, due } = await setup();
    const actor = await (await ethers.getContractFactory('PaymentActor')).deploy(await invoxa.getAddress());
    await invoxa.createInvoice(await actor.getAddress(), 'Test', amount, due, 'INV');
    await actor.configure(true, false);
    await expect(actor.pay(1, { value: amount * 2n })).revertedWith('Refund failed');
    expect((await invoxa.getInvoice(1)).status).equal(0);
  });
  it('rejects reentrant payment from an issuer callback', async () => {
    const { invoxa, client, amount, due } = await setup();
    const actor = await (await ethers.getContractFactory('PaymentActor')).deploy(await invoxa.getAddress());
    await actor.issue(client.address, amount, due);
    await actor.configure(false, true);
    await invoxa.connect(client).payInvoice(1, { value: amount });
    expect(await actor.reentrySucceeded()).equal(false);
    expect((await invoxa.getInvoice(1)).status).equal(1);
  });
});

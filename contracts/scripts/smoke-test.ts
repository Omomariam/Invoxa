import { ethers, network } from 'hardhat';
import { readFileSync, writeFileSync } from 'fs';

async function main() {
  const chainId =
    network.name === 'botchain-mainnet'
      ? '677'
      : network.name === 'botchain-testnet'
        ? '968'
        : null;
  if (!chainId || String((await ethers.provider.getNetwork()).chainId) !== chainId)
    throw new Error('Select a matching BOT Chain network.');
  const filename = process.env.SMOKE_DEPLOYMENT_RECORD;
  if (
    !filename ||
    !new RegExp(`^deployments[\\\\/]${chainId}[\\\\/]0x[a-fA-F0-9]{64}\\.json$`).test(filename)
  )
    throw new Error('Set SMOKE_DEPLOYMENT_RECORD to the deployment JSON.');
  const record = JSON.parse(readFileSync(filename, 'utf8'));
  if (record.chainId !== chainId || !ethers.isAddress(record.address))
    throw new Error('Invalid deployment record.');
  const [issuer] = await ethers.getSigners();
  const client = ethers.Wallet.createRandom().connect(ethers.provider);
  // Preserve mainnet recovery access in an ignored local environment file.
  if (chainId === '677')
    writeFileSync(
      `.env.smoke.${client.address}.local`,
      `SMOKE_CLIENT_PRIVATE_KEY=${client.privateKey}\n`,
      { flag: 'wx', mode: 0o600 }
    );
  try {
    const funding = await issuer.sendTransaction({
      to: client.address,
      value: ethers.parseEther('0.02'),
    });
    await funding.wait(2);
    const invoxa = await ethers.getContractAt('Invoxa', record.address, issuer);
    const block = await ethers.provider.getBlock('latest');
    if (!block) throw new Error('Cannot read chain timestamp.');
    const id = await invoxa.getTotalInvoices();
    const amount = ethers.parseEther('0.001');
    const creation = await invoxa.createInvoice(
      client.address,
      'Invoxa release rehearsal - public test data',
      amount,
      block.timestamp + 86400,
      'REHEARSAL'
    );
    await creation.wait(2);
    const issuerBefore = await ethers.provider.getBalance(issuer.address);
    const payment = await invoxa.connect(client).payInvoice(id, { value: amount });
    await payment.wait(2);
    const paid = await invoxa.getInvoice(id);
    const issuerAfter = await ethers.provider.getBalance(issuer.address);
    if (paid.status !== 1n || issuerAfter - issuerBefore !== amount)
      throw new Error('Payment/state/balance verification failed.');
    const cancelledId = await invoxa.getTotalInvoices();
    const second = await invoxa.createInvoice(
      client.address,
      'Cancellation rehearsal',
      amount,
      block.timestamp + 86400,
      'REHEARSAL-CANCEL'
    );
    await second.wait(2);
    const cancellation = await invoxa.cancelInvoice(cancelledId);
    await cancellation.wait(2);
    if ((await invoxa.getInvoice(cancelledId)).status !== 2n)
      throw new Error('Cancellation verification failed.');
    const report = {
      chainId: Number(chainId),
      contract: record.address,
      issuer: issuer.address,
      client: client.address,
      invoiceId: id.toString(),
      amount: amount.toString(),
      creation: creation.hash,
      payment: payment.hash,
      cancelledInvoiceId: cancelledId.toString(),
      cancellation: cancellation.hash,
    };
    writeFileSync(filename.replace('.json', '.smoke.json'), JSON.stringify(report, null, 2), {
      flag: 'wx',
    });
    console.log('Rehearsal passed:', JSON.stringify(report, null, 2));
  } finally {
    // Return unused funding to the issuer.
    const balance = await ethers.provider.getBalance(client.address);
    const fee = (await ethers.provider.getFeeData()).gasPrice;
    if (fee && balance > 21000n * fee)
      await (
        await client.sendTransaction({
          to: issuer.address,
          value: balance - 21000n * fee,
          gasLimit: 21000n,
          gasPrice: fee,
        })
      ).wait(2);
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

// Read-only live mainnet validation. Run explicitly after configuring a deployment.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');

const directory = path.resolve(__dirname, '../../contracts/deployments/677');
const files = fs.readdirSync(directory).filter(name => name.endsWith('.smoke.json'));
if (!files.length) throw new Error('Run a mainnet rehearsal and retain its report first.');
const smoke = JSON.parse(fs.readFileSync(path.join(directory, files.at(-1)), 'utf8'));
const deployment = JSON.parse(fs.readFileSync(path.join(directory, files.at(-1).replace('.smoke.json', '.json')), 'utf8'));
Object.assign(process.env, { NEXT_PUBLIC_BOT_NETWORK: 'mainnet', NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET: smoke.contract, NEXT_PUBLIC_DEPLOYMENT_BLOCK_MAINNET: String(deployment.deploymentBlock), NEXT_PUBLIC_BOT_MAINNET_RPC: 'https://rpc.botchain.ai' });

require.extensions['.ts'] = (loaded, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  loaded._compile(output, filename);
};
const { readInvoice, readAccountInvoices, readInvoiceEvents } = require('../src/utils/invoices.ts');

test('fresh client reads the settled invoice and cancelled invoice from mainnet', { timeout: 60000 }, async () => {
  const paid = await readInvoice(smoke.invoiceId);
  assert.equal(paid.status, 'paid');
  assert.equal(paid.amount, smoke.amount);
  assert.equal(paid.clientAddress.toLowerCase(), smoke.client.toLowerCase());
  assert.equal(paid.chainId, 677);
  assert.equal((await readInvoice(smoke.cancelledInvoiceId)).status, 'cancelled');
});
test('unknown invoice IDs are rejected rather than returning default fields', { timeout: 60000 }, async () => {
  await assert.rejects(readInvoice('999999999999'), /Invoice does not exist/);
});
test('chain-loaded account history includes both confirmed rehearsal invoices', { timeout: 60000 }, async () => {
  const invoices = await readAccountInvoices(smoke.issuer);
  assert.ok(invoices.some(invoice => invoice.onChainId === smoke.invoiceId && invoice.status === 'paid'));
  assert.ok(invoices.some(invoice => invoice.onChainId === smoke.cancelledInvoiceId && invoice.status === 'cancelled'));
});
test('bounded event lookup resolves creation and payment proofs', { timeout: 60000 }, async () => {
  const result = await readInvoiceEvents(smoke.invoiceId);
  assert.equal(result.creationHash, smoke.creation);
  assert.equal(result.paymentHash, smoke.payment);
});

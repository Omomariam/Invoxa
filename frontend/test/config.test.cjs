const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');

function load(relative, environment = {}) {
  const filename = path.resolve(__dirname, '../src/utils', relative);
  const before = { ...process.env };
  for (const key of Object.keys(process.env)) if (key.startsWith('NEXT_PUBLIC_')) delete process.env[key];
  Object.assign(process.env, { NODE_ENV: 'development', ...environment });
  try {
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = Module._nodeModulePaths(path.dirname(filename));
    loaded._compile(output, filename);
    return loaded.exports;
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in before)) delete process.env[key];
    Object.assign(process.env, before);
  }
}
const address = '0x1111111111111111111111111111111111111111';

test('mainnet never uses a configured testnet contract as a fallback', () => {
  const config = load('chains.ts', { NEXT_PUBLIC_BOT_NETWORK: 'mainnet', NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET: address });
  assert.equal(config.DEFAULT_CHAIN.id, 677);
  assert.equal(config.CONTRACT_ADDRESS, '');
  assert.match(config.CONFIG_ERROR, /valid invoice contract/);
});
test('production requires an explicit blockchain selection', () => {
  assert.match(load('chains.ts', { NODE_ENV: 'production' }).CONFIG_ERROR, /explicitly/);
});
test('invalid network and zero-address configuration block transactions', () => {
  assert.match(load('chains.ts', { NEXT_PUBLIC_BOT_NETWORK: 'typo' }).CONFIG_ERROR, /mainnet or testnet/);
  assert.match(load('chains.ts', { NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET: '0x' + '0'.repeat(40) }).CONFIG_ERROR, /valid/);
});
test('invoice zero has a portable network and contract identity', () => {
  const config = load('chains.ts', { NEXT_PUBLIC_BOT_NETWORK: 'mainnet', NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET: address, NEXT_PUBLIC_BOT_MAINNET_RPC: 'https://example.com/rpc' });
  assert.equal(config.CONFIG_ERROR, null);
  assert.equal(config.invoiceUrl('0'), `/invoice/677/${address}/0`);
  assert.equal(config.DEFAULT_CHAIN.rpcUrls.default.http[0], 'https://example.com/rpc');
});
test('amount parsing preserves 18 decimal precision and rejects ambiguous values', () => {
  const { parseAmount } = load('formatting.ts');
  assert.equal(parseAmount('1.000000000000000001'), '1000000000000000001');
  assert.equal(parseAmount('0.000000000000000001'), '1');
  for (const amount of ['1e3', '-1', 'NaN', '1.0000000000000000001', '1.2.3']) assert.throws(() => parseAmount(amount));
});
test('paid and cancelled invoices never become overdue', () => {
  const { isOverdue } = load('formatting.ts');
  assert.equal(isOverdue(1, 'pending'), true);
  assert.equal(isOverdue(1, 'cancelled'), false);
  assert.equal(isOverdue(1, 'paid'), false);
});

test('shared links cannot authorize another contract or chain', () => {
  const config = load('chains.ts', { NEXT_PUBLIC_BOT_NETWORK: 'mainnet', NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET: address });
  assert.equal(config.isApprovedInvoice('677', address), true);
  assert.equal(config.isApprovedInvoice('968', address), false);
  assert.equal(config.isApprovedInvoice('677', '0x2222222222222222222222222222222222222222'), false);
});

import { createPublicClient, http, parseAbi } from 'viem';
import { CONFIG_ERROR, CONTRACT_ADDRESS, DEFAULT_CHAIN, DEPLOYMENT_BLOCK, invoiceIdentity } from './chains';
import { Invoice } from './types';

export const INVOICE_ABI = parseAbi([
  'event InvoiceCreated(uint256 indexed invoiceId, address indexed issuer, address indexed client, uint256 amount, uint256 dueDate, string invoiceNumber)',
  'event InvoicePaid(uint256 indexed invoiceId, address indexed paidBy, uint256 amount, uint256 timestamp)',
  'function createInvoice(address client, string description, uint256 amount, uint256 dueDate, string invoiceNumber) returns (uint256)',
  'function payInvoice(uint256 invoiceId) payable',
  'function cancelInvoice(uint256 invoiceId)',
  'function getInvoice(uint256 invoiceId) view returns (address issuer, address client, string description, uint256 amount, uint256 dueDate, uint8 status, string invoiceNumber, uint256 createdAt, uint256 paidAt)',
  'function getTotalInvoices() view returns (uint256)',
  'function getIssuerInvoices(address issuer) view returns (uint256[])',
  'function getClientInvoices(address client) view returns (uint256[])',
]);
export const invoiceClient = createPublicClient({ chain: DEFAULT_CHAIN, transport: http(DEFAULT_CHAIN.rpcUrls.default.http[0], { timeout: 20000 }) });
export const contract = { address: CONTRACT_ADDRESS as `0x${string}`, abi: INVOICE_ABI };

export async function validateDeployment() {
  if (CONFIG_ERROR) throw new Error(CONFIG_ERROR);
  if (await invoiceClient.getChainId() !== DEFAULT_CHAIN.id) throw new Error('RPC returned an unexpected chain.');
  const code = await invoiceClient.getBytecode({ address: contract.address });
  if (!code || code === '0x') throw new Error('No invoice contract exists at the configured address.');
}

export async function readInvoice(id: string): Promise<Invoice> {
  if (!/^\d+$/.test(id)) throw new Error('Invalid invoice ID.');
  await validateDeployment();
  const invoiceId = BigInt(id);
  const total = await invoiceClient.readContract({ ...contract, functionName: 'getTotalInvoices' });
  if (invoiceId >= total) throw new Error('Invoice does not exist.');
  const [issuer, client, description, amount, dueDate, status, invoiceNumber, createdAt, paidAt] = await invoiceClient.readContract({ ...contract, functionName: 'getInvoice', args: [invoiceId] });
  return { id: invoiceIdentity(invoiceId.toString()), onChainId: invoiceId.toString(), chainId: DEFAULT_CHAIN.id, contractAddress: CONTRACT_ADDRESS, issuerAddress: issuer, clientAddress: client, description, amount: amount.toString(), dueDate: Number(dueDate), status: status === 1 ? 'paid' : status === 2 ? 'cancelled' : 'pending', invoiceNumber, createdAt: Number(createdAt), paidAt: paidAt ? Number(paidAt) : undefined };
}

export async function readAccountInvoices(account: `0x${string}`) {
  await validateDeployment();
  const [issued, received] = await Promise.all([
    invoiceClient.readContract({ ...contract, functionName: 'getIssuerInvoices', args: [account] }),
    invoiceClient.readContract({ ...contract, functionName: 'getClientInvoices', args: [account] }),
  ]);
  const ids = [...new Set([...issued, ...received].map(String))];
  const invoices: Invoice[] = [];
  for (let offset = 0; offset < ids.length; offset += 10) invoices.push(...await Promise.all(ids.slice(offset, offset + 10).map(readInvoice)));
  return invoices.sort((a, b) => b.createdAt - a.createdAt);
}

// Each click scans at most 20 chunks; callers may continue from the returned cursor.
export async function readInvoiceEvents(id: string, cursor?: bigint) {
  if (DEPLOYMENT_BLOCK === null) throw new Error('Set the deployment block to look up historical transaction links.');
  const head = await invoiceClient.getBlockNumber();
  let from = cursor ?? DEPLOYMENT_BLOCK;
  let creationHash: `0x${string}` | undefined;
  let paymentHash: `0x${string}` | undefined;
  for (let chunk = 0; chunk < 20 && from <= head; chunk++) {
    const to = from + 1999n < head ? from + 1999n : head;
    const [created, paid] = await Promise.all([
      invoiceClient.getContractEvents({ ...contract, eventName: 'InvoiceCreated', args: { invoiceId: BigInt(id) }, fromBlock: from, toBlock: to }),
      invoiceClient.getContractEvents({ ...contract, eventName: 'InvoicePaid', args: { invoiceId: BigInt(id) }, fromBlock: from, toBlock: to }),
    ]);
    creationHash = created[0]?.transactionHash ?? creationHash;
    paymentHash = paid[0]?.transactionHash ?? paymentHash;
    from = to + 1n;
  }
  return { creationHash, paymentHash, next: from <= head ? from : undefined };
}

import { Invoxa } from '../typechain-types';
import { ethers } from 'hardhat';

// Helper function to get contract instance
export async function getInvoxaContract(): Promise<Invoxa> {
  const deploymentAddresses = require('../deployment-addresses.json');
  const invoxa = await ethers.getContractAt(
    'Invoxa',
    deploymentAddresses.invoxa
  );
  return invoxa as Invoxa;
}

// Helper function to create test invoice
export async function createTestInvoice(
  contract: Invoxa,
  issuer: any,
  client: string,
  amount: bigint = ethers.parseEther('10')
) {
  const dueDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

  const tx = await contract
    .connect(issuer)
    .createInvoice(client, 'Test Invoice', amount, dueDate, 'TEST-001');

  return tx;
}

// Helper function to pay invoice
export async function payInvoice(
  contract: Invoxa,
  payer: any,
  invoiceId: number,
  amount: bigint
) {
  const tx = await contract.connect(payer).payInvoice(invoiceId, { value: amount });
  return tx;
}

// Helper to format wei to ether
export function formatEther(value: bigint): string {
  return ethers.formatEther(value);
}

// Helper to parse ether to wei
export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}

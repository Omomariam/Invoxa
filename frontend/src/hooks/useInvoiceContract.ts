import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseAbi, encodeFunctionData } from 'viem';

// Invoice ABI - will be imported from contract artifacts
const INVOICE_ABI = parseAbi([
  'function createInvoice(address client, string memory description, uint256 amount, uint256 dueDate, string memory invoiceNumber) external',
  'function payInvoice(uint256 invoiceId) external payable',
  'function getInvoice(uint256 invoiceId) external view returns (address, string, uint256, uint256, bool, string, uint256)',
  'function getInvoiceCount() external view returns (uint256)',
]);

export const useInvoiceContract = (contractAddress: string | undefined) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvoice = useCallback(
    async (clientAddress: string, description: string, amount: string, dueDate: number, invoiceNumber: string) => {
      if (!contractAddress || !walletClient || !address) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: INVOICE_ABI,
          functionName: 'createInvoice',
          args: [clientAddress, description, BigInt(amount), BigInt(dueDate), invoiceNumber],
          account: address,
        });

        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create invoice';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, walletClient, address]
  );

  const payInvoice = useCallback(
    async (invoiceId: number, amount: string) => {
      if (!contractAddress || !walletClient || !address) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: INVOICE_ABI,
          functionName: 'payInvoice',
          args: [BigInt(invoiceId)],
          account: address,
          value: BigInt(amount),
        });

        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to pay invoice';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, walletClient, address]
  );

  return { createInvoice, payInvoice, loading, error };
};

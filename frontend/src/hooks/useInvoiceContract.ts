import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { decodeEventLog, parseAbi } from 'viem';

export const INVOICE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET || '0xd09b24bF543aBB020466e290f1103dF7D8c2B8Ce';

// ABI matching contracts/contracts/Invoxa.sol exactly
export const INVOICE_ABI = parseAbi([
  'event InvoiceCreated(uint256 indexed invoiceId, address indexed issuer, address indexed client, uint256 amount, uint256 dueDate, string invoiceNumber)',
  'function createInvoice(address _client, string memory _description, uint256 _amount, uint256 _dueDate, string memory _invoiceNumber) external returns (uint256)',
  'function payInvoice(uint256 _invoiceId) external payable',
  'function cancelInvoice(uint256 _invoiceId) external',
  'function getInvoice(uint256 _invoiceId) external view returns (address issuer, address client, string memory description, uint256 amount, uint256 dueDate, uint8 status, string memory invoiceNumber, uint256 createdAt, uint256 paidAt)',
  'function getTotalInvoices() external view returns (uint256)',
  'function getIssuerInvoices(address _issuer) external view returns (uint256[])',
  'function getClientInvoices(address _client) external view returns (uint256[])',
  'function isOverdue(uint256 _invoiceId) external view returns (bool)',
]);

export const useInvoiceContract = (contractAddress?: string) => {
  const addressToUse = contractAddress || INVOICE_CONTRACT_ADDRESS;
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(null);

  const createInvoiceOnChain = useCallback(
    async (
      clientAddress: string,
      description: string,
      amountWei: string,
      dueDateTimestamp: number,
      invoiceNumber: string
    ) => {
      if (!walletClient || !publicClient || !address) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setLoading(true);
        setError(null);
        setTransactionHash(null);

        const hash = await walletClient.writeContract({
          address: addressToUse as `0x${string}`,
          abi: INVOICE_ABI,
          functionName: 'createInvoice',
          args: [
            clientAddress as `0x${string}`,
            description,
            BigInt(amountWei),
            BigInt(dueDateTimestamp),
            invoiceNumber,
          ],
          account: address,
        });
        setTransactionHash(hash);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== 'success') {
          throw new Error('The invoice transaction reverted.');
        }

        const invoiceLog = receipt.logs.find((log: { address: string; data: `0x${string}`; topics: readonly `0x${string}`[] }) => {
          if (log.address.toLowerCase() !== addressToUse.toLowerCase()) return false;
          try {
            return decodeEventLog({ abi: INVOICE_ABI, eventName: 'InvoiceCreated', data: log.data, topics: log.topics }).eventName === 'InvoiceCreated';
          } catch {
            return false;
          }
        });

        if (!invoiceLog) throw new Error('Invoice confirmation was received, but its on-chain ID could not be read.');

        const decoded = decodeEventLog({ abi: INVOICE_ABI, eventName: 'InvoiceCreated', data: invoiceLog.data, topics: invoiceLog.topics });
        const invoiceId = decoded.args.invoiceId;
        if (typeof invoiceId !== 'bigint') throw new Error('The contract returned an invalid invoice ID.');

        return { hash, invoiceId, blockNumber: receipt.blockNumber };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create invoice on-chain';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addressToUse, walletClient, publicClient, address]
  );

  const payInvoiceOnChain = useCallback(
    async (invoiceId: number | bigint, amountWei: string) => {
      if (!walletClient || !address) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const hash = await walletClient.writeContract({
          address: addressToUse as `0x${string}`,
          abi: INVOICE_ABI,
          functionName: 'payInvoice',
          args: [BigInt(invoiceId)],
          account: address,
          value: BigInt(amountWei),
        });

        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to pay invoice on-chain';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addressToUse, walletClient, address]
  );

  const cancelInvoiceOnChain = useCallback(
    async (invoiceId: number | bigint) => {
      if (!walletClient || !address) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const hash = await walletClient.writeContract({
          address: addressToUse as `0x${string}`,
          abi: INVOICE_ABI,
          functionName: 'cancelInvoice',
          args: [BigInt(invoiceId)],
          account: address,
        });

        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel invoice';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addressToUse, walletClient, address]
  );

  return {
    createInvoiceOnChain,
    payInvoiceOnChain,
    cancelInvoiceOnChain,
    loading,
    error,
    contractAddress: addressToUse,
    transactionHash,
  };
};

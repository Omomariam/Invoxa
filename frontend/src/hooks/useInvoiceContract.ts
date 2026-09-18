import { useCallback, useRef, useState } from 'react';
import { useConnection, useConfig } from 'wagmi';
import { getWalletClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, DEFAULT_CHAIN } from '@/utils/chains';
import { invoiceClient, validateDeployment, readInvoice, INVOICE_ABI } from '@/utils/invoices';
import { decodeEventLog } from 'viem';

export const INVOICE_CONTRACT_ADDRESS = CONTRACT_ADDRESS;

export { INVOICE_ABI } from '@/utils/invoices';

export const useInvoiceContract = (contractAddress?: string) => {
  const addressToUse = contractAddress || INVOICE_CONTRACT_ADDRESS;
  const { address } = useConnection();
  const config = useConfig();
  const publicClient = invoiceClient;
  const busy = useRef(false);
  const connectedWallet = useCallback(async () => {
    if (addressToUse.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) throw new Error('Unapproved invoice contract.');
    await validateDeployment();
    const wallet = await getWalletClient(config, { chainId: DEFAULT_CHAIN.id });
    if (!wallet || await wallet.getChainId() !== DEFAULT_CHAIN.id) throw new Error(`Switch your wallet to ${DEFAULT_CHAIN.name}.`);
    if (wallet.account.address.toLowerCase() !== address?.toLowerCase()) throw new Error('Wallet account changed. Please try again.');
    return wallet;
  }, [addressToUse, address, config]);
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
      if (!address) {
        setError('Wallet not connected');
        return null;
      }

      if (busy.current) return null;
      busy.current = true;
      try {
        setLoading(true);
        setError(null);
        setTransactionHash(null);

        const walletClient = await connectedWallet();
        const { request } = await publicClient.simulateContract({
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
          account: walletClient.account,
          chain: DEFAULT_CHAIN,
        });
        const hash = await walletClient.writeContract(request);
        setTransactionHash(hash);

        const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 2, timeout: 120000 });
        if (receipt.status !== 'success') {
          throw new Error('The invoice transaction reverted.');
        }

        const invoiceLog = receipt.logs.find((log) => {
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

        setTransactionHash(receipt.transactionHash);
        return { hash: receipt.transactionHash, invoiceId, blockNumber: receipt.blockNumber };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create invoice on-chain';
        setError(message);
        return null;
      } finally {
        busy.current = false;
        setLoading(false);
      }
    },
    [addressToUse, address, connectedWallet, publicClient]
  );

  const payInvoiceOnChain = useCallback(
    async (invoiceId: number | bigint) => {
      if (!address) {
        setError('Wallet not connected');
        return null;
      }

      if (busy.current) return null;
      busy.current = true;
      try {
        setLoading(true);
        setError(null);
        setTransactionHash(null);

        const walletClient = await connectedWallet();
        const { request } = await publicClient.simulateContract({
          address: addressToUse as `0x${string}`,
          abi: INVOICE_ABI,
          functionName: 'payInvoice',
          args: [BigInt(invoiceId)],
          account: walletClient.account,
          chain: DEFAULT_CHAIN,
          value: BigInt((await readInvoice(invoiceId.toString())).amount),
        });
        const hash = await walletClient.writeContract(request);

        setTransactionHash(hash);
        const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 2, timeout: 120000 });
        if (receipt.status !== 'success') throw new Error('Transaction reverted.');
        const settled = await readInvoice(invoiceId.toString());
        if (settled.status !== 'paid') throw new Error('The transaction confirmed without settling this invoice. Refresh its contract status before retrying.');
        setTransactionHash(receipt.transactionHash);
        return receipt.transactionHash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to pay invoice on-chain';
        setError(message);
        return null;
      } finally {
        busy.current = false;
        setLoading(false);
      }
    },
    [addressToUse, address, connectedWallet, publicClient]
  );

  const cancelInvoiceOnChain = useCallback(
    async (invoiceId: number | bigint) => {
      if (!address) {
        setError('Wallet not connected');
        return null;
      }

      if (busy.current) return null;
      busy.current = true;
      try {
        setLoading(true);
        setError(null);
        setTransactionHash(null);

        const walletClient = await connectedWallet();
        const { request } = await publicClient.simulateContract({
          address: addressToUse as `0x${string}`,
          abi: INVOICE_ABI,
          functionName: 'cancelInvoice',
          args: [BigInt(invoiceId)],
          account: walletClient.account,
          chain: DEFAULT_CHAIN,
        });
        const hash = await walletClient.writeContract(request);

        setTransactionHash(hash);
        const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 2, timeout: 120000 });
        if (receipt.status !== 'success') throw new Error('Transaction reverted.');
        if ((await readInvoice(invoiceId.toString())).status !== 'cancelled') throw new Error('This invoice was not cancelled. Refresh its contract status.');
        setTransactionHash(receipt.transactionHash);
        return receipt.transactionHash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel invoice';
        setError(message);
        return null;
      } finally {
        busy.current = false;
        setLoading(false);
      }
    },
    [addressToUse, address, connectedWallet, publicClient]
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

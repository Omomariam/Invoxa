'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useConnection } from 'wagmi';
import { readAccountInvoices } from '@/utils/invoices';
import { CONTRACT_ADDRESS, DEFAULT_CHAIN } from '@/utils/chains';

export function useAccountInvoices() {
  const { address } = useConnection();
  const query = useQuery({
    queryKey: ['account-invoices', DEFAULT_CHAIN.id, CONTRACT_ADDRESS.toLowerCase(), address?.toLowerCase()],
    queryFn: () => readAccountInvoices(address!),
    enabled: !!address,
    refetchInterval: 30000,
  });
  useEffect(() => {
    if (!address || !query.data) return;
    try { localStorage.setItem(`invoxa-cache:${DEFAULT_CHAIN.id}:${CONTRACT_ADDRESS.toLowerCase()}:${address.toLowerCase()}`, JSON.stringify(query.data)); } catch { /* Cache is optional. */ }
  }, [address, query.data]);
  const invoices = address ? query.data || [] : [];
  return {
    invoices,
    loading: query.isFetching,
    error: query.error?.message || null,
    getPaidInvoices: () => invoices.filter(i => i.status === 'paid'),
    getPendingInvoices: () => invoices.filter(i => i.status === 'pending'),
    getOverdueInvoices: () => invoices.filter(i => i.status === 'pending' && i.dueDate * 1000 < Date.now()),
  };
}

// BOT Chain Network Configuration
export const BOT_CHAIN_NETWORKS = {
  testnet: {
    id: 968,
    name: 'BOT Chain Testnet',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    rpcUrls: {
      default: { http: [process.env.NEXT_PUBLIC_BOT_TESTNET_RPC || 'https://rpc.bohr.life'] },
      public: { http: [process.env.NEXT_PUBLIC_BOT_TESTNET_RPC || 'https://rpc.bohr.life'] },
    },
    blockExplorers: {
      default: { name: 'BlockScout', url: 'https://scan.bohr.life' },
    },
    testnet: true,
  },
  mainnet: {
    id: 677,
    name: 'BOT Chain Mainnet',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    rpcUrls: {
      default: { http: [process.env.NEXT_PUBLIC_BOT_MAINNET_RPC || 'https://rpc.botchain.ai'] },
      public: { http: [process.env.NEXT_PUBLIC_BOT_MAINNET_RPC || 'https://rpc.botchain.ai'] },
    },
    blockExplorers: {
      default: { name: 'BlockScout', url: 'https://scan.botchain.ai' },
    },
    testnet: false,
  },
};

export const ERC4337_BUNDLER = {
  testnet: 'https://bundler.bohr.life/rpc',
  mainnet: 'https://bundler.botchain.ai/rpc',
};

const requestedNetwork = process.env.NEXT_PUBLIC_BOT_NETWORK || 'testnet';
export const NETWORK_ERROR = !['mainnet', 'testnet'].includes(requestedNetwork)
  ? 'Set NEXT_PUBLIC_BOT_NETWORK to mainnet or testnet.'
  : process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_BOT_NETWORK
    ? 'Set NEXT_PUBLIC_BOT_NETWORK explicitly before building for production.' : null;
export const ACTIVE_NETWORK = requestedNetwork === 'mainnet' ? 'mainnet' : 'testnet';
export const DEFAULT_CHAIN = { ...BOT_CHAIN_NETWORKS[ACTIVE_NETWORK], network: `bot-${ACTIVE_NETWORK}` };
export const CONTRACT_ADDRESS = ACTIVE_NETWORK === 'mainnet'
  ? process.env.NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET || ''
  : process.env.NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET || '';
export const CONFIG_ERROR = NETWORK_ERROR || (!/^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS) || /^0x0{40}$/.test(CONTRACT_ADDRESS)
  ? `Set a valid invoice contract address for ${ACTIVE_NETWORK}.` : null);
const block = ACTIVE_NETWORK === 'mainnet' ? process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK_MAINNET : process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK_TESTNET;
export const DEPLOYMENT_BLOCK = block && /^\d+$/.test(block) ? BigInt(block) : null;
export const invoiceIdentity = (id: string) => `${DEFAULT_CHAIN.id}/${CONTRACT_ADDRESS.toLowerCase()}/${id}`;
export const invoiceUrl = (id: string) => `/invoice/${invoiceIdentity(id)}`;

export const isApprovedInvoice = (chainId: string, address: string) => !CONFIG_ERROR && chainId === String(DEFAULT_CHAIN.id) && address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase();

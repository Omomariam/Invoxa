// BOT Chain Network Configuration
export const BOT_CHAIN_NETWORKS = {
  testnet: {
    id: 968,
    name: 'BOT Chain Testnet',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.bohr.life'] },
      public: { http: ['https://rpc.bohr.life'] },
    },
    blockExplorers: {
      default: { name: 'BlockScout', url: 'https://scan.bohr.life' },
    },
    testnet: true,
  },
  mainnet: {
    id: 677,
    name: 'BOT Chain',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.botchain.ai'] },
      public: { http: ['https://rpc.botchain.ai'] },
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

export const DEFAULT_CHAIN = BOT_CHAIN_NETWORKS.testnet;

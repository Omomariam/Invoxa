# Invoxa Deployment Guide

## Current Status

✅ **Frontend**: Complete (Next.js 14, TypeScript, Tailwind, wagmi)  
✅ **Smart Contract**: Complete & Compiled (Solidity 0.8.20, Hardhat)  
✅ **Dependencies**: Installed  
⏳ **Deployment**: Ready (requires testnet tokens)

## Quick Start

### Step 1: Fund Your Testnet Account

The deployment account needs BOT tokens for gas fees.

**Account Address:**
```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Get Testnet Tokens:**
1. Visit: https://faucet.botchain.ai
2. Paste your account address
3. Request testnet BOT tokens
4. Wait for confirmation (usually 1-2 minutes)

**Alternative - Use Your Own Account:**
If you have your own account with testnet BOT tokens:
1. Edit `contracts/.env`
2. Replace the PRIVATE_KEY with your account's private key (with 0x prefix)
3. Save the file

### Step 2: Deploy to Testnet

Once your account is funded:

```bash
# From the project root or contracts directory
cd contracts
npm run deploy:testnet
```

This will:
- Compile the Invoxa.sol contract
- Deploy to BOT Chain Testnet (Chain 968)
- Save deployment address to `contracts/deployment-addresses.json`
- Display the contract address in the terminal

### Step 3: Verify Contract on BlockScout

After deployment, you can verify your contract source code for transparency:

```bash
npm run verify:testnet -- <DEPLOYED_CONTRACT_ADDRESS>
```

**Note:** BlockScout verification requires the API key in `.env`. Contact BlockScout support for an API key.

### Step 4: Update Frontend Configuration

After deployment, update the frontend environment:

1. Copy the deployed contract address from terminal or `contracts/deployment-addresses.json`
2. Create `frontend/.env.local` from the template:
   ```bash
   # Copy from example
   cp frontend/.env.local.example frontend/.env.local
   ```
3. Edit `frontend/.env.local`:
   ```
   NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET=0x<YOUR_DEPLOYED_ADDRESS>
   ```

### Step 5: Start Frontend Dev Server

```bash
cd frontend
npm install --legacy-peer-deps  # If not already done
npm run dev
```

The app will be available at: http://localhost:3000

## Network Configuration

### BOT Chain Testnet
- **Chain ID:** 968
- **RPC:** https://rpc.bohr.life
- **Explorer:** https://scan.bohr.life
- **Faucet:** https://faucet.botchain.ai
- **Type:** EVM-Compatible

### BOT Chain Mainnet
- **Chain ID:** 677
- **RPC:** https://rpc.botchain.ai
- **Explorer:** https://scan.botchain.ai
- **Type:** EVM-Compatible

## Project Structure

```
invoxa/
├── contracts/              # Hardhat project
│   ├── contracts/
│   │   └── Invoxa.sol     # Main contract
│   ├── scripts/
│   │   └── deploy.ts      # Deployment script
│   ├── test/
│   │   └── Invoxa.test.ts # Test suite
│   ├── .env               # Private keys & RPC URLs
│   └── deployment-addresses.json  # Saved addresses
│
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # Pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utilities & types
│   ├── .env.local        # Frontend config
│   └── .env.local.example # Template
│
└── docs/                 # Documentation
```

## Key Environment Variables

### contracts/.env
```
PRIVATE_KEY=
TESTNET_RPC=https://rpc.bohr.life
MAINNET_RPC=https://rpc.botchain.ai
BLOCKSCOUT_API_KEY=your_api_key
```

### frontend/.env.local
```
NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET=0x...
NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET=0x...
```

## Troubleshooting

### "insufficient funds for gas"
→ Get testnet tokens from faucet: https://faucet.botchain.ai

### "Node.js v23 not supported by Hardhat"
→ Warning only, deployment still works. Consider using Node.js 18-20 LTS if issues occur.

### "Contract not found" during compilation
→ Run `npm install @openzeppelin/contracts` in contracts/

### Frontend won't connect to contract
→ Verify `NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET` is set correctly in `frontend/.env.local`

## Smart Contract Features

The Invoxa contract includes:

- **Invoice Management**: Create, pay, and cancel invoices
- **Payment Tracking**: Record and retrieve payment history
- **Status Management**: Pending, Paid, Cancelled states
- **Reentrancy Protection**: Using OpenZeppelin's ReentrancyGuard
- **Event Logging**: Full event emissions for off-chain tracking
- **Access Control**: Issuer and client permission controls

## Frontend Features

The Invoxa app includes:

- **Dashboard**: Overview of issued, paid, and pending invoices
- **Create Invoice**: Form-based invoice creation with validation
- **Invoice Details**: View invoice info, QR code, and payment link
- **Payment Receipts**: Track payment confirmations
- **Invoice History**: Browse all invoices by status
- **Wallet Connection**: MetaMask/WalletConnect integration
- **Export**: Download invoices as receipts

## Next Steps

1. ✅ Fund your testnet account
2. ✅ Deploy contract to testnet
3. ✅ Verify contract on BlockScout (optional)
4. ✅ Update frontend .env.local
5. ✅ Start frontend dev server
6. ✅ Test wallet connection
7. ✅ Create test invoices
8. ✅ Test payments

## Support

For issues or questions:
- BOT Chain Docs: https://docs.botchain.ai
- Hardhat Docs: https://hardhat.org
- OpenZeppelin Docs: https://docs.openzeppelin.com

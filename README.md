# Invoxa

A simple crypto invoicing application for freelancers, developers, creators, and businesses to generate invoices payable in BOT on the BOT Chain blockchain.

**Tagline:** "Invoice. Get paid. Prove it."

## Project Structure

```
Invoxa/
├── frontend/                 # Next.js 14 + TypeScript UI
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── public/          # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.local.example
├── contracts/               # Hardhat smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   ├── hardhat.config.ts
│   ├── package.json
│   └── .env.example
├── Acunetix BOTChain Integration Guide.md
└── README.md
```

## Core Features

✅ **Wallet Connection** - Connect with your BOT Chain wallet
✅ **Create Invoice** - Generate invoices with custom details
✅ **Invoice Management** - Track invoice status and payments
✅ **Payment Tracking** - Automatic payment detection on-chain
✅ **Invoice History** - View all issued and paid invoices
✅ **Payment Receipt** - Blockchain-verified payment proofs
✅ **QR Code** - Generate QR codes for easy sharing
✅ **Shareable URL** - Share invoice links with clients
✅ **Dashboard** - View statistics and recent invoices

## Smart Contract Features

- **Invoice Registration** - Create and manage invoices on-chain
- **Payment Tracking** - Record and verify payments
- **Invoice Status** - Track invoice lifecycle (pending, paid, cancelled)
- **Payment Events** - Emit events for payment notifications
- **Reentrancy Protection** - Secure payment handling
- **Owner Functions** - Admin withdrawal capabilities

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: wagmi + viem
- **State Management**: Zustand
- **UI Components**: Lucide React icons

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Network**: BOT Chain (Mainnet: 677, Testnet: 968)
- **Libraries**: OpenZeppelin Contracts v5
- **Verification**: BlockScout

## Theme

- **Background**: #F7F9FC
- **Surface**: #FFFFFF
- **Primary**: #2563EB (Blue)
- **Secondary**: #10B981 (Green)

## Setup Instructions

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Update environment variables**
   - Add your contract addresses after deployment
   - Configure RPC URLs if needed

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Smart Contract Setup

1. **Navigate to contracts directory**
   ```bash
   cd contracts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Update environment variables**
   - Add your `PRIVATE_KEY` for deployment
   - Configure RPC URLs
   - Add BlockScout API key for verification

5. **Compile contracts**
   ```bash
   npm run compile
   ```

6. **Run tests**
   ```bash
   npm run test
   ```

7. **Deploy to testnet**
   ```bash
   npm run deploy:testnet
   ```

8. **Verify contracts**
   ```bash
   npm run verify:testnet -- <CONTRACT_ADDRESS>
   ```

## BOT Chain Configuration

### Testnet (Chain ID: 968)
- **RPC**: https://rpc.bohr.life
- **Explorer**: https://scan.bohr.life
- **Faucet**: https://faucet.botchain.ai
- **Bundler**: https://bundler.bohr.life/rpc

### Mainnet (Chain ID: 677)
- **RPC**: https://rpc.botchain.ai
- **Explorer**: https://scan.botchain.ai
- **Bundler**: https://bundler.botchain.ai/rpc

## Important Addresses

- **WBOT Token**: 0xD5452816194a3784dBa983426cCe7c122F4abd30
- **USDT Token**: 0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C

## API References

- **BOT Price API**: https://api.coinstore.com/api/v1/ticker/price;symbol=BOTUSDT
- **WBOT Price API**: https://dex-wallet.botchain.ai/api/graph/price?token=0xD5452816194a3784dBa983426cCe7c122F4abd30

## Security

All core contracts are professionally audited by CertiK:
- [BOT Chain Audit Report](https://www.botchain.ai/docs/Chain.pdf)
- [BOT DEX Audit Report](https://dex.botchain.ai/docs/Dex-Audit-Report.pdf)
- [BOT Bridge Audit Report](https://bridge.botchain.ai/docs/Bridge-Audit-Report.pdf)

## Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make changes to frontend or contracts**

3. **Test changes**
   ```bash
   # Frontend
   cd frontend && npm run lint

   # Contracts
   cd contracts && npm run test
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/feature-name
   ```

## Future Enhancements

- [ ] ERC-4337 Account Abstraction support
- [ ] Multi-signature invoice approval
- [ ] Invoice templates
- [ ] Recurring invoices
- [ ] Invoice search and filtering
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Payment reminders
- [ ] Dispute resolution system
- [ ] Cross-chain payment support

## Resources

- [BOT Chain Official Website](https://www.botchain.ai)
- [BOT Chain Developer Docs](https://dev-docs.botchain.ai/docs/Developers/quick-guide/)
- [BOT Chain GitHub](https://github.com/BOTChain-bot)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [wagmi Documentation](https://wagmi.sh)
- [Solidity Documentation](https://docs.soliditylang.org)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For assistance during integration, please contact the BOT Chain team through their official channels.

---

**Built with ❤️ for the BOT Chain ecosystem**

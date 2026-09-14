# Invoxa Development Setup Guide

Complete guide to set up and develop the Invoxa on-chain invoicing application.

## Prerequisites

### System Requirements
- **Node.js**: 18.17.0 or later
- **npm**: 9.0.0 or later (or yarn/pnpm)
- **Git**: For version control
- **A Web3 Wallet**: For BOT Chain interaction (Bitget Wallet or TokenPocket recommended)

### BOT Chain Wallet Setup

1. **Install Wallet Extension**
   - Download [Bitget Wallet](https://web3.bitget.com/) or [TokenPocket](https://www.tokenpocket.pro)

2. **Add BOT Chain to Your Wallet**
   - **Testnet**:
     - Chain ID: 968
     - RPC: https://rpc.bohr.life
     - Explorer: https://scan.bohr.life
   - **Mainnet**:
     - Chain ID: 677
     - RPC: https://rpc.botchain.ai
     - Explorer: https://scan.botchain.ai

3. **Get Testnet BOT**
   - Visit [Faucet](https://faucet.botchain.ai)
   - Request test BOT tokens

## Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/invoxa.git
cd invoxa
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

### 3. Smart Contract Setup (in another terminal)
```bash
cd contracts
npm install
cp .env.example .env
npm run compile
```

## Detailed Setup

### Frontend Setup

#### Installation
```bash
cd frontend
npm install
```

#### Environment Configuration
```bash
cp .env.local.example .env.local
```

Update `.env.local`:
```env
# BOT Chain RPC URLs
NEXT_PUBLIC_BOT_TESTNET_RPC=https://rpc.bohr.life
NEXT_PUBLIC_BOT_MAINNET_RPC=https://rpc.botchain.ai

# Contract Addresses (after deployment)
NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET=0x...
NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET=0x...

# Application
NEXT_PUBLIC_APP_NAME=Invoxa
NEXT_PUBLIC_ENVIRONMENT=development
```

#### Development Server
```bash
npm run dev
```

Access at http://localhost:3000

#### Build for Production
```bash
npm run build
npm start
```

#### Code Quality
```bash
npm run lint          # Check for lint issues
npm run format        # Format code with Prettier
```

### Smart Contracts Setup

#### Installation
```bash
cd contracts
npm install
```

#### Environment Configuration
```bash
cp .env.example .env
```

Update `.env`:
```env
# Private key for deployment (KEEP SECURE!)
PRIVATE_KEY=0x...

# RPC URLs
BOT_TESTNET_RPC=https://rpc.bohr.life
BOT_MAINNET_RPC=https://rpc.botchain.ai

# BlockScout API key (for verification)
BLOCKSCOUT_API_KEY=

# Optional: Gas reporting
REPORT_GAS=false
```

#### Compilation
```bash
npm run compile
```

#### Testing
```bash
# Run tests
npm run test

# Run with coverage
npm run coverage

# Generate gas report
npm run gas-report
```

#### Deployment

##### Testnet Deployment
```bash
npm run deploy:testnet
```

This will:
1. Compile contracts
2. Deploy to BOT Chain Testnet (Chain ID: 968)
3. Save deployment address to `deployment-addresses.json`

##### Mainnet Deployment
```bash
npm run deploy:mainnet
```

#### Contract Verification

After deployment, verify on BlockScout:

```bash
npm run verify:testnet -- <CONTRACT_ADDRESS>
```

Example:
```bash
npm run verify:testnet -- 0x1234567890123456789012345678901234567890
```

## Development Workflow

### Creating a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Frontend: Edit files in `frontend/src/`
   - Contracts: Edit files in `contracts/contracts/`

3. **Test changes**
   ```bash
   # Frontend
   cd frontend && npm run lint

   # Contracts
   cd contracts && npm run test
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

5. **Push to remote**
   ```bash
   git push origin feature/my-feature
   ```

### Frontend Development Tips

- Use TypeScript for type safety
- Follow Tailwind CSS utilities
- Use zustand for state management
- Implement error boundaries for better UX
- Test with wagmi hooks for wallet interactions

### Contract Development Tips

- Write comprehensive tests for all functions
- Use OpenZeppelin audited contracts
- Check gas usage with `npm run gas-report`
- Verify contracts on BlockScout after deployment
- Use descriptive event names
- Implement reentrancy protection

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (`npm run test`)
- [ ] Code linted (`npm run lint`)
- [ ] Environment variables configured
- [ ] Private key secured and backed up
- [ ] Contract verified on testnet first

### Testnet Deployment
- [ ] Deploy contract to testnet
- [ ] Verify contract on BlockScout
- [ ] Update `.env.local` with testnet address
- [ ] Test all frontend features
- [ ] Check gas usage

### Mainnet Deployment
- [ ] All testnet testing complete
- [ ] Security audit completed
- [ ] Final contract review
- [ ] Deploy to mainnet
- [ ] Verify on BlockScout
- [ ] Update documentation
- [ ] Monitor contract for issues

## Troubleshooting

### Common Issues

#### 1. Wallet Connection Issues
```
Error: Could not find BOT Chain network
```

**Solution:**
- Add BOT Chain to wallet manually
- Check Chain ID (Testnet: 968, Mainnet: 677)
- Ensure RPC URL is correct
- Refresh the page

#### 2. Contract Deployment Fails
```
Error: Insufficient funds
```

**Solution:**
- Get testnet BOT from [faucet](https://faucet.botchain.ai)
- Check private key in `.env`
- Verify RPC URL connectivity

#### 3. Transaction Fails
```
Error: Transaction reverted
```

**Solution:**
- Check contract parameters
- Verify amount is sufficient
- Ensure client address is valid
- Review contract logic

#### 4. Port Already in Use
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Kill process using port 3000
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## Development Tools

### VS Code Extensions
- **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
- **Solidity** - Juan Blanco (juanblanco.solidity)
- **Prettier - Code formatter** - esbenp.prettier-vscode
- **Thunder Client** - rangav.vscode-thunder-client

### Useful Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Build production
npm run lint             # Check code quality
npm run format           # Format code

# Contracts
npm run compile          # Compile contracts
npm run test             # Run tests
npm run deploy:testnet   # Deploy to testnet
npm run verify:testnet   # Verify on testnet
```

## Resources

### BOT Chain
- [Official Website](https://www.botchain.ai)
- [Developer Docs](https://dev-docs.botchain.ai)
- [GitHub Organization](https://github.com/BOTChain-bot)
- [Testnet Faucet](https://faucet.botchain.ai)
- [Block Explorer](https://scan.botchain.ai)

### Development Frameworks
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org)

### Web3 Tools
- [wagmi Documentation](https://wagmi.sh)
- [viem Documentation](https://viem.sh)
- [OpenZeppelin Docs](https://docs.openzeppelin.com)

## Getting Help

1. **Check Documentation**: Read README files in each folder
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Ask in Community**: Reach out on BOT Chain Discord
4. **Create Issue**: Document the problem and steps to reproduce

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

---

**Happy coding! 🚀**

# Invoxa Frontend

A modern web3 invoicing application built with Next.js 14, TypeScript, and Tailwind CSS.

## Overview

The Invoxa frontend provides a user-friendly interface for:
- Connecting to BOT Chain wallets
- Creating and managing invoices
- Tracking payment status
- Viewing invoice history
- Sharing invoices with clients

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Dashboard/Home
│   │   ├── create/            # Create invoice page
│   │   ├── history/           # Invoice history
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── Header.tsx         # Navigation header
│   │   └── InvoiceCard.tsx    # Invoice display component
│   ├── hooks/                 # Custom React hooks
│   │   ├── useInvoiceContract.ts  # Contract interaction
│   │   └── useInvoiceStore.ts     # State management
│   ├── utils/                 # Utility functions
│   │   ├── chains.ts          # BOT Chain configuration
│   │   ├── formatting.ts      # Format helpers
│   │   └── types.ts           # TypeScript types
│   └── public/                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local
```

## Key Features

### 1. Dashboard
- Overview of invoice statistics
- Recent invoice list
- Quick stats (total paid, pending, overdue)
- Navigation to create or view invoices

### 2. Create Invoice
- Form to generate new invoices
- Input validation
- Date picker for due dates
- Address validation
- Amount input with BOT denomination

### 3. Invoice History
- View all created invoices
- Filter by status
- Search functionality
- Sort options

### 4. Invoice Detail
- Complete invoice information
- QR code generation
- Payment link
- Share functionality
- Payment receipt display

## Technology Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library

### Web3 Integration
- **wagmi** - React hooks for Ethereum
- **viem** - Lightweight Ethereum library
- **ethers.js** - For contract interactions (optional)

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management

## Environment Configuration

Create a `.env.local` file based on `.env.local.example`:

```env
# BOT Chain RPC URLs
NEXT_PUBLIC_BOT_TESTNET_RPC=https://rpc.bohr.life
NEXT_PUBLIC_BOT_MAINNET_RPC=https://rpc.botchain.ai

# Contract Addresses (after deployment)
NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET=0x...
NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET=0x...

# Application Settings
NEXT_PUBLIC_APP_NAME=Invoxa
NEXT_PUBLIC_ENVIRONMENT=development
```

## Development

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

### Code Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Components

### Header
Sticky header with:
- Invoxa logo and branding
- Navigation menu
- Wallet connection status
- Address display

### InvoiceCard
Reusable card component showing:
- Invoice number and description
- Client address
- Amount and status
- Due date and creation date
- Action buttons (View, Export)

## Hooks

### useInvoiceContract
Handles smart contract interactions:
- Creating invoices
- Paying invoices
- Loading states
- Error handling

### useInvoiceStore
Zustand store for invoice state:
- Store invoices locally
- Filter by status
- Add/update/delete invoices
- Payment receipts

## Utilities

### Formatting
- `formatAddress()` - Shorten wallet addresses
- `formatAmount()` - Format BOT amounts
- `parseAmount()` - Parse user input to wei
- `formatDate()` - Format timestamps
- `isOverdue()` - Check invoice status
- `isValidAddress()` - Validate Ethereum addresses

### Chain Configuration
- BOT Chain Testnet (968)
- BOT Chain Mainnet (677)
- RPC URLs and explorers
- ERC-4337 bundler endpoints

## Wallet Integration

The application uses wagmi with custom BOT Chain configuration:

```typescript
const config = createConfig({
  chains: [BOT_CHAIN_NETWORKS.testnet],
  transports: {
    [BOT_CHAIN_NETWORKS.testnet.id]: http(RPC_URL)
  }
})
```

## Color Scheme

```css
--background: #F7F9FC
--surface: #FFFFFF
--primary: #2563EB
--secondary: #10B981
```

## Future Enhancements

- [ ] QR code generation and display
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Advanced filtering and search
- [ ] Invoice templates
- [ ] Recurring invoices
- [ ] Multi-currency support
- [ ] Payment reminders
- [ ] Dispute resolution UI
- [ ] Mobile app

## Performance Optimization

- Image optimization with Next.js
- CSS-in-JS with Tailwind
- Code splitting with dynamic imports
- Lazy loading of components
- Optimized bundle size

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## API Integration

### Smart Contract Interaction
- Read invoice data from blockchain
- Submit transactions for invoice creation/payment
- Listen to contract events

### Price APIs
- BOT/USDT price from CoinStore
- WBOT price from DEX Wallet API

## Troubleshooting

### Wallet Connection Issues
- Ensure BOT Chain is added to your wallet
- Use testnet for development
- Check RPC URL configuration

### Contract Interaction Errors
- Verify contract address in environment variables
- Check wallet has sufficient balance
- Ensure correct network is selected

### Styling Issues
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Check the BOT Chain documentation
2. Review contract deployment logs
3. Test with testnet first
4. Contact support channels

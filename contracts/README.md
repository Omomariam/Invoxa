# Invoxa Smart Contracts

Smart contracts for the Invoxa on-chain invoicing application on BOT Chain.

## Overview

The `Invoxa` contract manages the complete lifecycle of invoices:
- Creating and registering invoices
- Tracking payments
- Managing invoice status
- Recording payment receipts
- Handling payment transfers

## Contract Structure

### Key Functions

#### Invoice Creation
```solidity
function createInvoice(
    address _client,
    string memory _description,
    uint256 _amount,
    uint256 _dueDate,
    string memory _invoiceNumber
) external nonReentrant returns (uint256)
```

Creates a new invoice on the blockchain.

#### Payment
```solidity
function payInvoice(uint256 _invoiceId) external payable nonReentrant
```

Allows a client to pay an invoice and transfers funds to the issuer.

#### Cancellation
```solidity
function cancelInvoice(uint256 _invoiceId) external
```

Allows the issuer to cancel a pending invoice.

### Read Functions

- `getInvoice()` - Get complete invoice details
- `getTotalInvoices()` - Get total invoice count
- `getIssuerInvoices()` - Get all invoices issued by an address
- `getClientInvoices()` - Get all invoices for a client
- `getPaymentHistory()` - Get payment history for an invoice
- `isOverdue()` - Check if invoice is overdue

### Events

- `InvoiceCreated` - Emitted when a new invoice is created
- `InvoicePaid` - Emitted when an invoice is paid
- `InvoiceCancelled` - Emitted when an invoice is cancelled
- `PaymentReceived` - Emitted when payment is received

## Testing

Run the test suite:

```bash
npm run test
```

Generate gas report:

```bash
npm run gas-report
```

## Deployment

### Testnet Deployment

```bash
npm run deploy:testnet
```

### Mainnet Deployment

```bash
npm run deploy:mainnet
```

### Verification

After deployment, verify your contract on BlockScout:

```bash
npm run verify:testnet -- <CONTRACT_ADDRESS>
```

## Contract Addresses

After deployment, contract addresses will be saved to `deployment-addresses.json`.

Update the frontend `.env.local` file with the deployed contract addresses:

```
NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET=0x...
NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET=0x...
```

## Security Considerations

1. **Reentrancy Protection** - Uses `nonReentrant` modifier on state-changing functions
2. **Access Control** - Only invoice issuer can cancel invoices
3. **Input Validation** - All inputs are validated before processing
4. **Safe Transfers** - Uses low-level call with proper error handling
5. **Refund Handling** - Excess payments are refunded to the payer

## Gas Optimization

The contract is optimized for gas efficiency:
- Uses OpenZeppelin's `Counters` for efficient ID management
- Minimizes storage operations
- Efficient mapping structure for lookups
- Optimized event emissions

## Future Improvements

- [ ] Implement invoice escrow
- [ ] Add batch payment processing
- [ ] Implement invoice financing
- [ ] Add dispute resolution
- [ ] Multi-signature approval
- [ ] Automated payment reminders via chainlink
- [ ] Integration with other payment tokens

## License

MIT License - See LICENSE file for details

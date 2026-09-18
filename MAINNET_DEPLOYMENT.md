# Invoxa mainnet release

## Current deployment

- Mainnet contract: [`0x5B5D14C50138053c6D9AA2ee38e17B3AB8d402D0`](https://scan.botchain.ai/address/0x5B5D14C50138053c6D9AA2ee38e17B3AB8d402D0#code).
- Deployment block: `23679278`; owner: `0x757e39550f2669bE84c1F1F642669727212F3bE3`.
- Deployment transaction: `0x30ec708d2bfa545f160122b8ad566a175fc2b777c28917c8f9b74cad3f70d0e1`.
- Published explorer source matches the retained release source; runtime bytecode and ownership checks passed.
- Mainnet and testnet rehearsals passed with a separate client: invoice 0 is paid, invoice 1 is cancelled. Reports and build artifacts are in `contracts/deployments/<chain-id>/`.
- Local frontend configuration selects mainnet. Copy the committed `frontend/.env.production.example` values into the hosting build environment.
- Website publication still requires hosting account access. Follow [HOSTING_SETUP.md](HOSTING_SETUP.md).

## Requirements

Use Node.js 22 LTS and the committed lockfiles. Prepare a private production deployer with native BOT, a separate issuer/client pair for smoke tests, and a Next.js host with HTTPS. Never fund or deploy with the public Hardhat development accounts referenced in old documentation.

BOT mainnet uses chain ID 677, RPC `https://rpc.botchain.ai`, and explorer `https://scan.botchain.ai`. See the [official network guide](https://www.botchain.ai/en/help-center/docs/getting-started/add-bot-chain-metamask/).

## Contract checks and deployment

In `contracts`, run `npm ci`, `npm run compile`, and `npm test`. The compiler targets Paris explicitly to avoid assuming newer chain opcodes. Configure private `PRIVATE_KEY`, `BOT_MAINNET_RPC`, and optional `BLOCKSCOUT_API_KEY`. `DEPLOYMENT_GAS_BUFFER_PERCENT` defaults to 30.

Run `npm run preflight:mainnet`. This command never broadcasts: it validates chain/signer and reports native BOT balance, estimated gas, and buffered deployment budget. Budget additional BOT for smoke-test transactions and the invoice amount. Any failed check blocks deployment.

Run `npm run deploy:mainnet` only after the testnet rehearsal passes. The same preflight runs immediately before broadcasting. Deployment waits for two confirmations, records the transaction/address/block/compiler settings and source/build artifacts under `contracts/deployments/677`, and checks bytecode and ownership. Existing address files are not overwritten.

Run `npm run verify:mainnet -- <ADDRESS>` with the recorded address. The configured explorer API must support the installed verification plugin. If it does not, use the explorer's manual Standard JSON verification with the retained build input and exact compiler version. Verification is a release requirement; a deployment record is not proof of verified source. The [Blockscout verification documentation](https://docs.blockscout.com/for-users/verifying-a-smart-contract/hardhat-verification-plugin) explains the explorer workflow. An optional dummy API key is configured for instances that do not require a key.

The constructor makes the deployer owner. If ownership will move to another admin/multisig, confirm that transaction and record the final owner before release. No automatic ownership transfer is performed.

## Frontend build

Set these in the hosting build environment before `npm run build`:

```dotenv
NEXT_PUBLIC_BOT_NETWORK=mainnet
NEXT_PUBLIC_BOT_MAINNET_RPC=https://rpc.botchain.ai
NEXT_PUBLIC_INVOICE_CONTRACT_MAINNET=<recorded-address>
NEXT_PUBLIC_DEPLOYMENT_BLOCK_MAINNET=<recorded-deployment-block>
NEXT_PUBLIC_ENVIRONMENT=production
```

In `frontend`, run `npm ci`, `npm test`, `npm run type-check`, `npm run lint`, and `npm run build`. Deploy an HTTPS preview first. Changing public environment variables requires rebuilding. Missing/invalid network or contract settings block transactions. The current flow uses injected wallets and native BOT; it does not require bundlers, paymasters, or WalletConnect.

Invoices use `/invoice/<chain-id>/<approved-contract>/<invoice-id>` links and are read from the configured contract. Legacy browser entries remain in their original localStorage key and are never reinterpreted as production invoices. Account history refreshes from chain every 30 seconds. Cached data is isolated by chain, contract, and account; it is not settlement evidence. Event lookups require a deployment block and search bounded chunks with a continuation button.

## Release smoke test

Create invoice ID 0 if this is a fresh deployment. Open the shared link in a fresh browser, connect the named client, pay a small invoice, and confirm the issuer receives the amount. Check status after reload and the explorer receipt. Test issuer cancellation on a separate invoice and confirm cancelled invoices cannot be paid. Reject a signature and network switch; neither may produce a paid status. Check account switching and nested-route refreshes before promoting the production domain.

Descriptions and invoice numbers are public blockchain data. Ecosystem audit reports do not audit Invoxa. Dependencies must receive a separate vulnerability review before public release; do not equate successful installation with security review.

## Recovery

Retain the previous frontend build and all deployment records. Disable submissions and restore the last validated build when needed. The contract has no upgrade or pause mechanism; frontend rollback cannot undo payments. A replacement contract needs a new deployment plus explicit access to invoices on the old contract.

The historical root `deploy.ps1`/`deploy.bat` wrappers and `contracts/scripts/helpers.ts` use the earlier testnet/address-file workflow. Use the explicit network commands and versioned records above for this release. A mainnet smoke-client recovery key was retained in an ignored local `contracts/.env.smoke.<address>.local` file; it must remain private. Unused rehearsal funding was returned to the issuer.

Validation completed under Node.js 22: 19 contract/preflight tests, 7 frontend regression tests, 4 read-only mainnet integration tests, TypeScript checks, lint, and a warning-free production build. All main app routes returned HTTP 200 locally. Fresh Chrome rendered the mainnet paid invoice without browser invoice storage or wallet connection. Frontend audit and contract production-dependency audit report zero known vulnerabilities; the older development-toolchain advisories remain outside those production audit results.

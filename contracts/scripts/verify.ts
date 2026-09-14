import { exec } from "child_process";
import { writeFileSync } from "fs";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const CONTRACT_ADDRESS = "0xd09b24bF543aBB020466e290f1103dF7D8c2B8Ce";
const NETWORK = "botchain-testnet";
const CONTRACT_NAME = "Invoxa";

async function verifyContract() {
  console.log("🔍 Verifying Invoxa Contract on BlockScout...\n");
  console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`Network: ${NETWORK}`);
  console.log(`Explorer: https://scan.bohr.life\n`);

  try {
    // Try API-based verification first
    console.log("📡 Attempting API verification...");
    const { stdout } = await execAsync(
      `npx hardhat verify --network ${NETWORK} ${CONTRACT_ADDRESS}`
    );
    console.log("✅ Contract verified successfully!\n");
    console.log(stdout);
  } catch (error: any) {
    console.log(
      "⚠️  API verification failed. Attempting alternative verification...\n"
    );

    // Flatten contract for manual verification
    try {
      console.log("📋 Flattening contract source code...");
      await execAsync(
        `npx hardhat flatten contracts/contracts/Invoxa.sol > flattened-invoxa.sol`
      );
      console.log("✅ Contract flattened to: flattened-invoxa.sol\n");

      // Create manual verification instructions
      const instructions = `
# Manual Verification Instructions for Invoxa Contract

## Contract Information
- **Address:** ${CONTRACT_ADDRESS}
- **Network:** BOT Chain Testnet (Chain 968)
- **Explorer:** https://scan.bohr.life
- **Contract Name:** ${CONTRACT_NAME}
- **Compiler Version:** v0.8.20+commit.a677c57c
- **Optimization:** Yes (200 runs)

## Steps to Verify on BlockScout:

1. Visit: https://scan.bohr.life/address/${CONTRACT_ADDRESS}
2. Click the "Code" tab
3. Click "Verify & Publish" button
4. Select verification method: "Source Code"
5. Fill in the following details:
   - **Contract Address:** ${CONTRACT_ADDRESS}
   - **Contract Name:** ${CONTRACT_NAME}
   - **Compiler Version:** v0.8.20+commit.a677c57c
   - **Optimization:** Enabled (200 runs)
   - **Source Code:** Copy from flattened-invoxa.sol
   - **License Type:** MIT
6. Click "Verify & Publish"

## Alternative: Using Hardhat Verify Plugin

If you have a BlockScout API key:
1. Add to contracts/.env:
   \`\`\`
   BLOCKSCOUT_API_KEY=your_api_key_here
   \`\`\`

2. Run:
   \`\`\`bash
   npm run verify:testnet -- ${CONTRACT_ADDRESS}
   \`\`\`

## Flattened Contract

The flattened source code is in: flattened-invoxa.sol

This file contains all contract code and dependencies merged into a single file, ready for BlockScout verification.

## Verification Status

- Contract Address: ${CONTRACT_ADDRESS}
- Network: BOT Chain Testnet (Chain 968)
- Current Status: ⏳ Pending Manual Verification
- Explorer: https://scan.bohr.life/address/${CONTRACT_ADDRESS}

Once verified, the contract source will be visible on BlockScout for all to see.
`;

      writeFileSync("VERIFICATION_INSTRUCTIONS.md", instructions);
      console.log("✅ Verification instructions saved to: VERIFICATION_INSTRUCTIONS.md\n");

      console.log("═══════════════════════════════════════════════════════════════");
      console.log("📝 MANUAL VERIFICATION REQUIRED");
      console.log("═══════════════════════════════════════════════════════════════\n");

      console.log("To manually verify your contract on BlockScout:\n");
      console.log("1. Visit: https://scan.bohr.life/address/" + CONTRACT_ADDRESS);
      console.log("2. Click 'Code' tab → 'Verify & Publish'");
      console.log("3. Copy flattened source from: flattened-invoxa.sol");
      console.log("4. Use compiler: v0.8.20");
      console.log("5. Enable optimization (200 runs)\n");

      console.log("Files created:");
      console.log("  ✓ flattened-invoxa.sol (contract source for BlockScout)");
      console.log("  ✓ VERIFICATION_INSTRUCTIONS.md (detailed instructions)\n");

      console.log("Contract is already deployed and functional!");
      console.log("Verification is optional and improves transparency.\n");
    } catch (flattenError: any) {
      console.error("❌ Error flattening contract:", flattenError.message);
      console.log("\nContract is deployed but verification needs API key.");
      console.log("To verify later, get a BlockScout API key and add to .env");
    }
  }
}

verifyContract().catch(console.error);

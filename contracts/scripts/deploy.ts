import { HardhatUserConfig } from "hardhat/config";
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Invoxa contract...");

  const Invoxa = await ethers.getContractFactory("Invoxa");
  const invoxa = await Invoxa.deploy();

  await invoxa.waitForDeployment();

  const address = await invoxa.getAddress();
  console.log("Invoxa deployed to:", address);

  // Save deployment address
  const fs = require("fs");
  const deploymentAddresses = {
    invoxa: address,
  };

  fs.writeFileSync(
    "./deployment-addresses.json",
    JSON.stringify(deploymentAddresses, null, 2)
  );

  console.log("Deployment addresses saved to deployment-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

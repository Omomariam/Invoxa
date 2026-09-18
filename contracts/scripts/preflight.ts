import { ethers, network } from 'hardhat';

export function validateSigner(address: string, chainId: bigint) {
  if (!ethers.isAddress(address) || address === ethers.ZeroAddress)
    throw new Error('Invalid deployer address.');
  if (chainId !== 677n) return;
  for (let i = 0; i < 100; i++) {
    const development = ethers.HDNodeWallet.fromPhrase(
      'test test test test test test test test test test test junk',
      undefined,
      `m/44'/60'/0'/0/${i}`
    );
    if (development.address.toLowerCase() === address.toLowerCase())
      throw new Error('Public development accounts cannot deploy to mainnet.');
  }
}

export function deploymentBudget(gas: bigint, fee: bigint, balance: bigint, buffer: number) {
  if (gas <= 0n || fee <= 0n) throw new Error('Invalid deployment fee estimate.');
  if (!Number.isSafeInteger(buffer) || buffer < 0 || buffer > 500)
    throw new Error('Invalid gas buffer percentage.');
  const gasLimit = (gas * BigInt(100 + buffer) + 99n) / 100n;
  const budget = gasLimit * fee;
  if (balance < budget)
    throw new Error('Insufficient native BOT for the buffered deployment budget.');
  return { gasLimit, budget };
}

export async function preflight() {
  const expected =
    network.name === 'botchain-mainnet'
      ? 677n
      : network.name === 'botchain-testnet'
        ? 968n
        : 31337n;
  const chain = await ethers.provider.getNetwork();
  if (chain.chainId !== expected)
    throw new Error('RPC chain ID does not match deployment network.');
  const [signer] = await ethers.getSigners();
  if (!signer) throw new Error('Configure a private deployment signer.');
  const deployer = await signer.getAddress();
  validateSigner(deployer, expected);
  const factory = await ethers.getContractFactory('Invoxa', signer);
  const transaction = await factory.getDeployTransaction();
  const gas = await signer.estimateGas(transaction);
  const fees = await ethers.provider.getFeeData();
  const fee = fees.maxFeePerGas ?? fees.gasPrice;
  if (fee === null || fee <= 0n) throw new Error('RPC did not provide usable fee data.');
  const buffer = Number(process.env.DEPLOYMENT_GAS_BUFFER_PERCENT || '30');
  const balance = await ethers.provider.getBalance(deployer);
  const { gasLimit, budget } = deploymentBudget(gas, fee, balance, buffer);
  console.log(
    JSON.stringify(
      {
        network: network.name,
        chainId: chain.chainId.toString(),
        deployer,
        estimatedGas: gas.toString(),
        gasLimit: gasLimit.toString(),
        feePerGas: fee.toString(),
        budgetBOT: ethers.formatEther(budget),
        balanceBOT: ethers.formatEther(balance),
      },
      null,
      2
    )
  );
  const overrides =
    fees.maxFeePerGas !== null && fees.maxPriorityFeePerGas !== null
      ? {
          gasLimit,
          maxFeePerGas: fees.maxFeePerGas,
          maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
        }
      : { gasLimit, gasPrice: fee };
  return { factory, deployer, chain, overrides };
}

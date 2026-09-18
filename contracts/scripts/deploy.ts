import { artifacts, ethers, network } from 'hardhat';
import { mkdirSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { preflight } from './preflight';

async function main() {
  const { factory, deployer, chain, overrides } = await preflight();
  const contract = await factory.deploy(overrides);
  const transaction = contract.deploymentTransaction();
  if (!transaction) throw new Error('Deployment transaction missing.');
  const receipt = await transaction.wait(2);
  if (!receipt || receipt.status !== 1) throw new Error('Deployment did not succeed.');
  const address = await contract.getAddress();
  const artifact = await artifacts.readArtifact('Invoxa');
  const build = await artifacts.getBuildInfo('contracts/Invoxa.sol:Invoxa');
  const block = await ethers.provider.getBlock(receipt.blockNumber);
  let sourceRevision = 'unavailable';
  let sourceDirty = true;
  try {
    sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    sourceDirty = Boolean(
      execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()
    );
  } catch {
    /* Build input and artifact hashes are retained independently. */
  }
  const record = {
    network: network.name,
    chainId: chain.chainId.toString(),
    address,
    deployer,
    transactionHash: transaction.hash,
    deploymentBlock: receipt.blockNumber,
    timestamp: block?.timestamp,
    sourceRevision,
    sourceDirty,
    artifactHash: ethers.keccak256(artifact.bytecode),
    runtimeHash: ethers.keccak256(artifact.deployedBytecode),
    compiler: build?.solcLongVersion,
    settings: build?.input.settings,
  };
  const directory = `deployments/${chain.chainId}`;
  mkdirSync(directory, { recursive: true });
  writeFileSync(`${directory}/${transaction.hash}.json`, JSON.stringify(record, null, 2), {
    flag: 'wx',
  });
  if (build)
    writeFileSync(`${directory}/${transaction.hash}.build.json`, JSON.stringify(build, null, 2), {
      flag: 'wx',
    });
  const code = await ethers.provider.getCode(address);
  if (ethers.keccak256(code) !== ethers.keccak256(artifact.deployedBytecode))
    throw new Error('Deployed runtime differs from release artifact.');
  if ((await contract.owner()).toLowerCase() !== deployer.toLowerCase())
    throw new Error('Unexpected contract owner.');
  console.log('Confirmed deployment:', address, 'block:', receipt.blockNumber);
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

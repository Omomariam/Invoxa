import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { deploymentBudget, preflight, validateSigner } from '../scripts/preflight';

describe('Deployment preflight', () => {
  it('rejects public development wallets on mainnet', async () => {
    const [signer] = await ethers.getSigners();
    expect(() => validateSigner(signer.address, 677n)).throw('Public development accounts');
    expect(() => validateSigner(signer.address, 968n)).not.throw();
  });
  it('rejects an RPC with the wrong chain before deployment', async () => {
    const original = network.name;
    network.name = 'botchain-mainnet';
    try {
      let error: Error | undefined;
      try { await preflight(); } catch (caught) { error = caught as Error; }
      expect(error?.message).equal('RPC chain ID does not match deployment network.');
    } finally { network.name = original; }
  });
  it('requires enough balance for buffered gas and rejects invalid estimates', () => {
    expect(() => deploymentBudget(100n, 2n, 259n, 30)).throw('Insufficient native BOT');
    expect(deploymentBudget(100n, 2n, 260n, 30)).deep.equal({ gasLimit: 130n, budget: 260n });
    expect(() => deploymentBudget(100n, 0n, 260n, 30)).throw('Invalid deployment fee');
    expect(() => deploymentBudget(100n, 2n, 260n, -1)).throw('Invalid gas buffer');
  });
});

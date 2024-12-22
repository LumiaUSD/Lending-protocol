import { Constants__factory } from './../../../typechain-types/factories/contracts/utils/constants.sol/Constants__factory';
import { ethers, network } from 'hardhat';

const getDeploymentSigners = async (
  ownerAddress: string,
  collateralManagerAddress: string,
  isTestnet: boolean
) => {
  const signers = await ethers.getSigners();

  if (isTestnet) {
    // Impersonate owner and collateral manager addresses for testing
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [ownerAddress]
    });
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [collateralManagerAddress]
    });

    // Set high balance for impersonated accounts
    await network.provider.send('hardhat_setBalance', [
      ownerAddress,
      '0x1000000000000000000000000000000000000000'
    ]);
    await network.provider.send('hardhat_setBalance', [
      collateralManagerAddress,
      '0x1000000000000000000000000000000000000000'
    ]);

    // Get signers for impersonated accounts
    signers[0] = await ethers.getSigner(ownerAddress);
    signers[1] = await ethers.getSigner(collateralManagerAddress);
    return [signers[0], signers[1]];
  }

  const owner = signers.find(
    (signer) => signer.address.toLowerCase() === ownerAddress.toLowerCase()
  );

  const collateralManager = signers[1];

  if (!owner) {
    throw new Error('Owner not equal to signer');
  }

  return [owner, collateralManager];
};

export default getDeploymentSigners;

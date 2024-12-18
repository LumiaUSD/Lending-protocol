import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const stabilityPool = async (
  vaultFactoryAddress: string,
  governanceTokenAddress: string
) => {
  const StabilityPool = await ethers.getContractFactory('StabilityPool');
  const stabilityPool = await StabilityPool.deploy(
    vaultFactoryAddress,
    governanceTokenAddress
  );
  await stabilityPool.waitForDeployment();

  await verify(await stabilityPool.getAddress(), [
    vaultFactoryAddress,
    governanceTokenAddress
  ]);

  return stabilityPool;
};

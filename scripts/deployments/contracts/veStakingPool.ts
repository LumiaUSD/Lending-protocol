import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const veStakingPool = async (
  vaultFactoryAddress: string,
  governanceTokenAddress: string,
  stabilityPoolAddress: string,
  vestingTime: string, // 1800; 30 minutes
  slashingRate: string, // 4000; 40%
  returnForStabilityPool: string // 6000; 60% of the slashing rate
) => {
  const VeStakingPool = await ethers.getContractFactory('veA3AStaking');
  const veStakingPool = await VeStakingPool.deploy(
    vaultFactoryAddress,
    governanceTokenAddress,
    stabilityPoolAddress
  );

  await veStakingPool.waitForDeployment();

  await verify(await veStakingPool.getAddress(), [
    vaultFactoryAddress,
    governanceTokenAddress,
    stabilityPoolAddress
  ]);

  await veStakingPool.setSlashingRate(0, vestingTime, slashingRate);
  await veStakingPool.setSlashingReturnForStabilityPool(returnForStabilityPool);
  return veStakingPool;
};

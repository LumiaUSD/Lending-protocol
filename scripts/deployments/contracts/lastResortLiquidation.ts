import { auctionManager } from './auctionManager';
import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const lastResortLiquidation = async (
  vaultFactoryAddress: string,
  auctionManagerAddress: string
) => {
  const LastResortLiquidation = await ethers.getContractFactory(
    'LastResortLiquidation'
  );
  const lastResortLiquidation = await LastResortLiquidation.deploy();
  await lastResortLiquidation.waitForDeployment();

  await verify(await lastResortLiquidation.getAddress(), []);

  const tx = await lastResortLiquidation.addAllowed(auctionManagerAddress);
  await tx.wait();

  const tx1 = await lastResortLiquidation.setVaultFactory(vaultFactoryAddress);
  await tx1.wait();

  return lastResortLiquidation;
};

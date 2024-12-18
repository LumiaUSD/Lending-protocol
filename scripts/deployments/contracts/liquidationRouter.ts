import { ethers } from 'hardhat';
import { BaseContract } from 'ethers';
import { verify } from '../../utils/verifyContract';

export const liquidationRouter = async () => {
  const LiquidationRouter =
    await ethers.getContractFactory('LiquidationRouter');
  const liquidationRouter = await LiquidationRouter.deploy();
  await liquidationRouter.waitForDeployment();

  await verify(await liquidationRouter.getAddress(), []);
  return liquidationRouter;
};

export const setLiquidationRouter = async (
  liquidationRouter: BaseContract,
  vaultFactoryAddress: string,
  auctionManagerAddress: string,
  lastResortLiquidationAddress: string
) => {
  // @ts-ignore
  const tx1 = await liquidationRouter.setVaultFactory(vaultFactoryAddress);
  await tx1.wait();
  // @ts-ignore
  const tx2 = await liquidationRouter.setAuctionManager(auctionManagerAddress);
  await tx2.wait();
  // @ts-ignore
  const tx3 = await liquidationRouter.setLastResortLiquidation(
    lastResortLiquidationAddress
  );
  await tx3.wait();

  console.log(' *LiquidationRouter has been set correctly! ');
};

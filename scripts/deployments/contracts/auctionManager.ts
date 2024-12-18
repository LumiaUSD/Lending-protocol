import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const auctionManager = async (vaultFactoryAddress: string) => {
  const AuctionManager = await ethers.getContractFactory('AuctionManager');
  const auctionManager = await AuctionManager.deploy(vaultFactoryAddress);
  await auctionManager.waitForDeployment();

  await verify(await auctionManager.getAddress(), [vaultFactoryAddress]);

  return auctionManager;
};

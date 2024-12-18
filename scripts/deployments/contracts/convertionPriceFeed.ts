import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const convertionPriceFeed = async (
  stablePriceFeedAddress: string,
  stableAddress: string
) => {
  const ConvertionPriceFeed =
    await ethers.getContractFactory('ChainlinkPriceFeed');
  const convertionPriceFeed = await ConvertionPriceFeed.deploy(
    stablePriceFeedAddress,
    stableAddress
  );

  await convertionPriceFeed.waitForDeployment();
  await verify(await convertionPriceFeed.getAddress(), [
    stablePriceFeedAddress,
    stableAddress
  ]);

  return convertionPriceFeed;
};

import { ethers } from 'hardhat';
import { verify } from '../../../utils/verifyContract';

export const mockConvertedPriceFeedV2 = async (
  tokenAddress: string,
  fakePrice: string
) => {
  const MockConvertedPriceFeedV2 = await ethers.getContractFactory(
    'MockConvertedPriceFeedV2'
  );
  const mockConvertedPriceFeedV2 = await MockConvertedPriceFeedV2.deploy(
    tokenAddress,
    fakePrice
  );

  await mockConvertedPriceFeedV2.waitForDeployment();
  await verify(await mockConvertedPriceFeedV2.getAddress(), [
    tokenAddress,
    fakePrice
  ]);

  console.log(
    `MockConvertedPriceFeedV2 for ${tokenAddress} is deployed to ${mockConvertedPriceFeedV2.target}`
  );

  return mockConvertedPriceFeedV2;
};

const tokenAddress = '';
const fakePrice = '';
// mockConvertedPriceFeedV2(tokenAddress, fakePrice);

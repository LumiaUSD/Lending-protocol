import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const governanceToken = async (governanceTokenAddress: string) => {
  if (!governanceTokenAddress) {
    const governanceToken = await (
      await ethers.getContractFactory('A3A')
    ).deploy();
    await verify(await governanceToken.getAddress(), []);
    return governanceToken;
  }

  return await ethers.getContractAt('A3A', governanceTokenAddress);
};

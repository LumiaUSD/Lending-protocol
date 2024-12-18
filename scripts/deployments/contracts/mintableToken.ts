import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const mintableToken = async (name: string, symbol: string) => {
  const MintableToken = await ethers.getContractFactory('MintableToken');
  const mintableToken = await MintableToken.deploy(name, symbol);
  await mintableToken.waitForDeployment();
  await verify(await mintableToken.getAddress(), [name, symbol]);
  return mintableToken;
};

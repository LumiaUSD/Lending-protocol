import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const surgeHelper = async () => {
  const [owner] = await ethers.getSigners();

  const SurgeHelper = await ethers.getContractFactory('SurgeHelper', owner);
  const helper = await SurgeHelper.deploy();
  await helper.waitForDeployment();

  await verify(await helper.getAddress(), []);

  console.log('Deployed to: ', helper.target);
};

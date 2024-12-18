import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const vaultFactoryHelper = async () => {
  const VaultFactoryHelper = await ethers.getContractFactory(
    'VaultFactoryHelperV2'
  );
  const vaultFactoryHelper = await VaultFactoryHelper.deploy();
  await vaultFactoryHelper.waitForDeployment();

  await verify(await vaultFactoryHelper.getAddress(), []);
  return vaultFactoryHelper;
};

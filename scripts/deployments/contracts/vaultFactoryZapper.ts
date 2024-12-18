import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const vaultFactoryZapper = async (vaultFactoryAddress: string) => {
  const VaultFactoryZapper =
    await ethers.getContractFactory('VaultFactoryZapper');
  const vaultFactoryZapper =
    await VaultFactoryZapper.deploy(vaultFactoryAddress);
  await vaultFactoryZapper.waitForDeployment();

  await verify(await vaultFactoryZapper.getAddress(), [vaultFactoryAddress]);

  return vaultFactoryZapper;
};

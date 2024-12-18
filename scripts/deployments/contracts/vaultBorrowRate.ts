import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const vaultBorrowRate = async () => {
  const VaultBorrowRate = await ethers.getContractFactory('VaultBorrowRate');
  const vaultBorrowRate = await VaultBorrowRate.deploy();
  await vaultBorrowRate.waitForDeployment();

  await verify(await vaultBorrowRate.getAddress(), []);

  return vaultBorrowRate;
};

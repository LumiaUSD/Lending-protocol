import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const smartVaultDeployer = async (
  VaultExtraSettingsAddress: string,
  SmartVaultProxyAddress: string
) => {
  const SmartVaultDeployer =
    await ethers.getContractFactory('SmartVaultDeployer');
  const smartVaultDeployer = await SmartVaultDeployer.deploy(
    VaultExtraSettingsAddress,
    SmartVaultProxyAddress
  );
  await smartVaultDeployer.waitForDeployment();

  await verify(await smartVaultDeployer.getAddress(), [
    VaultExtraSettingsAddress,
    SmartVaultProxyAddress
  ]);
  return smartVaultDeployer;
};

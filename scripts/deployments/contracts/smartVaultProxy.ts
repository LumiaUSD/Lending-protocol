import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const smartVaultProxy = async (
  rewardFee: string,
  rewardFeeCollectorAddress: string
) => {
  const SmartVaultProxy = await ethers.getContractFactory('SmartVaultProxy');
  const smartVaultProxy = await SmartVaultProxy.deploy(rewardFee);
  await smartVaultProxy.waitForDeployment();

  await verify(await smartVaultProxy.getAddress(), [rewardFee]);

  const tx = await smartVaultProxy.setRewardCollector(
    rewardFeeCollectorAddress
  );
  await tx.wait();
  return smartVaultProxy;
};

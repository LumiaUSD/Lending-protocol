import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

export const vaultExtraSettings = async (
  redemptionKickback: string,
  maxRedeemablePercentage: string
) => {
  const VaultExtraSettings =
    await ethers.getContractFactory('VaultExtraSettings');
  const vaultExtraSettings = await VaultExtraSettings.deploy();
  await vaultExtraSettings.waitForDeployment();

  await verify(await vaultExtraSettings.getAddress(), []);

  const tx1 = await vaultExtraSettings.setMaxRedeemablePercentage(
    0,
    ethers.parseEther(maxRedeemablePercentage)
  );
  await tx1.wait();
  console.log(`Max Redeemable Percentage set to ${maxRedeemablePercentage}`);

  const tx2 = await vaultExtraSettings.setRedemptionKickback(
    ethers.parseEther(redemptionKickback)
  );
  await tx2.wait();
  console.log(`Redemption Kick Back set to ${redemptionKickback}`);

  return vaultExtraSettings;
};

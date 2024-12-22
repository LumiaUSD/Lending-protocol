import { ethers } from 'hardhat';
import { BaseContract } from 'ethers';
import { verify } from '../../utils/verifyContract';

export const vaultFactory = async (
  debtCeiling: string,
  maxDebtPerWindow: string,
  mintableTokenOwner: BaseContract,
  nativeWTokenAddress: string,
  tokenToPriceFeedAddress: string,
  vaultDeployerAddress: string,
  liquidationRouterAddress: string,
  vaultBorrowRateAddres: string,
  borrowFeeRecipient: string,
  redemptionFeeRecipient: string,
  redemptionFee: string
) => {
  const VaultFactory = await ethers.getContractFactory('VaultFactory');
  const vaultFactory = await VaultFactory.deploy(
    await mintableTokenOwner.getAddress(),
    nativeWTokenAddress,
    tokenToPriceFeedAddress,
    vaultDeployerAddress,
    liquidationRouterAddress,
    vaultBorrowRateAddres,
    borrowFeeRecipient,
    redemptionFeeRecipient
  );
  await vaultFactory.waitForDeployment();

  await verify(await vaultFactory.getAddress(), [
    await mintableTokenOwner.getAddress(),
    nativeWTokenAddress,
    tokenToPriceFeedAddress,
    vaultDeployerAddress,
    liquidationRouterAddress,
    vaultBorrowRateAddres,
    borrowFeeRecipient,
    redemptionFeeRecipient
  ]);

  // * Set debt ceiling - How much EURO3 can be minted in total
  const tx = await vaultFactory.setDebtCeiling(ethers.parseEther(debtCeiling));
  await tx.wait();

  // * Set max debt per window - How much EURO3 can be minted in total per window of time
  const tx2 = await vaultFactory.setMaxDebtPerWindow(
    ethers.parseEther(maxDebtPerWindow)
  );
  await tx2.wait();

  // * Set redemption fee to charge - How much EURO3 will be charged when a vault is redeemed.
  const tx3 = await vaultFactory.setRedemptionRate(redemptionFee);
  await tx3.wait();

  // * Set vaultFactory as minter
  // @ts-ignore
  const tx4 = await mintableTokenOwner.addMinter(
    await vaultFactory.getAddress()
  );
  await tx4.wait();

  return vaultFactory;
};

import { ethers } from 'hardhat';
import { Vault } from '../../typechain-types';

export type CollateralComposition = {
  address: string;
  amount: bigint;
  symbol: string;
  decimals: bigint;
  price: bigint;
  amountInStable: bigint;
};

export type VaultInfo = {
  name: string;
  healthFactor: bigint;
  debt: bigint;
  borrowable: bigint;
  borrowRate: bigint;
  borrowRateHuman: string;
  collaterals: CollateralComposition[];
  vault: Vault;
};
export default async function getVaultInfo(
  vaultAddress: string,
  showDetails: boolean = false
) {
  const vault = await ethers.getContractAt('Vault', vaultAddress);
  const factory = await ethers.getContractAt(
    'VaultFactory',
    await vault.factory()
  );
  const borrowRate = await ethers.getContractAt(
    'VaultBorrowRate',
    await factory.borrowRate()
  );

  const tokenToPriceFeed = await ethers.getContractAt(
    'TokenToPriceFeed',
    await factory.priceFeed()
  );

  const healthFactor = await vault.healthFactor(true);
  const debt = await vault.debt();
  const collateralsLength = await vault.collateralsLength();
  const collaterals = [];

  const borrowable = (await vault.borrowable())[1];
  const version = await vault.VERSION();
  const borrowRateValue = await borrowRate.getBorrowRate(vault.target);
  const borrowRateHuman = ethers.formatEther(borrowRateValue);
  const name = await vault.name();

  if (showDetails) {
    console.log(`\t- Vault: ${vaultAddress} ${version}`);
    console.log(`\t- HalthFactor: ${ethers.formatEther(healthFactor)}`);
    console.log(`\t- Debt: ${ethers.formatEther(debt)}`);
    console.log(`\t- Left to borrow: ${ethers.formatEther(borrowable)}`);
    console.log(`\t- Borrow rate: ${ethers.formatEther(borrowRateValue)}`);
  }
  for (let i = 0; i < collateralsLength; i++) {
    const collateral = await vault.collateralAt(i);
    const amount = await vault.collateral(collateral);
    const token = await ethers.getContractAt('IERC20Metadata', collateral);
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const price = await tokenToPriceFeed.tokenPrice(collateral);
    const amountInStable = (amount * price) / ethers.parseEther('1');

    if (showDetails) {
      console.log(`\t- ${symbol} (${collateral})`);
      console.log(
        `\t\t- Amount: ${ethers.formatEther(amount)} (${ethers.formatEther(amountInStable)} in stable)`
      );
      console.log(`\t\t- Price: ${ethers.formatEther(price)}`);
    }

    collaterals.push({
      address: collateral,
      amount,
      symbol,
      decimals,
      price,
      amountInStable
    });
  }

  if (showDetails) {
    console.log(`\t_________________________________________________________`);
    console.log('\n');
  }

  return {
    name,
    healthFactor,
    debt,
    borrowable,
    borrowRate: borrowRateValue,
    borrowRateHuman,
    collaterals,
    vault
  };
}

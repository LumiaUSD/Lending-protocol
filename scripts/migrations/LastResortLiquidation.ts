import { lastResortLiquidation } from '../deployments/contracts/lastResortLiquidation';

const migrateToNewLastResortLiquidationVersion = async (
  vaultFactoryAddres: string,
  auctionManagerAddress: string,
  ownerProxyAddress: string
) => {
  const newVersion = await lastResortLiquidation(
    vaultFactoryAddres,
    auctionManagerAddress
  );

  const updateOwner = await newVersion.transferOwnership(ownerProxyAddress);
  await updateOwner.wait();
  console.log('New Version deployed to: ', newVersion.target);
  console.info(
    `\n - IMPORTANT: Don't forget to add Allow ownerProxy to claim collateral`,
    `  {
      target: lastResortLiquidation, // contract target
      signature: '0x1f1088a0', // withdrawCollateral(address,uint256,address)
      addresses: [depegWatchDog] // Liquidates + claims lastResortLiquidation collateral too
    }`
  );

  //   todo! Update LastResortLiquidation Address in LiquidationRouter.
  //   todo! Give permissions in ownerProxy where needed for lastResortLiquidator all chains (Remove old ones if possible).
  //   todo! Update address everywhere in all microservices (API + Liquidator).
  //   todo! Update all the docs.
};

const vaultFactoryAddress = ''; // lumiaMainnet
const auctionManagerAddress = ''; // lumiaMainnet
const ownerProxyAddress = ''; // lumiaMainnet
// migrateToNewLastResortLiquidationVersion(
//   vaultFactoryAddress,
//   auctionManagerAddress,
//   ownerProxyAddressAddress
// );

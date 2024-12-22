//* Todo:
// * Decide if stakingPool should be vested (slashing) or not

import deployments from './contracts/index';
import getDeploymentSigners from './utils/getDeploymentSigners';
import whitelistCollateralsPriceFeeds from '../collaterals/whitelistCollateralsPriceFeeds';
import deploymentConfig from './config/index';

type TChainName = 'lumia';

const chainName: TChainName = 'lumia' as TChainName;

const deployProtocol = async (isTestnet: boolean, logData: boolean) => {
  const walletsWithPermissions = deploymentConfig.lumia.walletsWithPermissions;
  const config = deploymentConfig.lumia.config;

  const [owner, collateralManager] = await getDeploymentSigners(
    walletsWithPermissions.owner,
    walletsWithPermissions.collateralManager,
    isTestnet
  );

  const mintableToken = await deployments.mintableToken(
    config.mintableTokenMetadata.name,
    config.mintableTokenMetadata.symbol
  );
  const mintableTokenOwner =
    await deployments.mintableTokenOwner(mintableToken);
  const tokenToPriceFeed = await deployments.tokenToPriceFeed();
  const vaultExtraSettings = await deployments.vaultExtraSettings(
    config.redemptions.redemptionKickback,
    config.redemptions.redeemablePercentage
  );
  const smartVaultProxy = await deployments.smartVaultProxy(
    config.fees.rewardFee,
    walletsWithPermissions.feeRecipient
  );

  const smartVaultDeployer = await deployments.smartVaultDeployer(
    await vaultExtraSettings.getAddress(),
    await smartVaultProxy.getAddress()
  );
  const liquidationRouter = await deployments.liquidationRouter();
  const vaultBorrowRate = await deployments.vaultBorrowRate();
  const vaultFactory = await deployments.vaultFactory(
    config.vaultFactory.debtCeiling,
    config.vaultFactory.maxDebtPerWindow,
    mintableTokenOwner,
    config.core.nativeWToken,
    // @ts-ignore
    await tokenToPriceFeed.getAddress(),
    await smartVaultDeployer.getAddress(),
    await liquidationRouter.getAddress(),
    await vaultBorrowRate.getAddress(),
    config.fees.borrowingFeeReceiver,
    config.fees.redeemingFeeReceiver,
    config.fees.redemptionFee
  );
  const auctionManager = await deployments.auctionManager(
    await vaultFactory.getAddress()
  );
  const lastResortLiquidation = await deployments.lastResortLiquidation(
    await vaultFactory.getAddress(),
    await auctionManager.getAddress()
  );

  const vaultFactoryZapper = await deployments.vaultFactoryZapper(
    await vaultFactory.getAddress()
  );
  const vaultFactoryHelper = await deployments.vaultFactoryHelper();

  await deployments.setLiquidationRouter(
    liquidationRouter,
    await vaultFactory.getAddress(),
    await auctionManager.getAddress(),
    await lastResortLiquidation.getAddress()
  );

  const ownerProxy = await deployments.ownerProxy(
    walletsWithPermissions.owner,
    // @ts-ignore
    tokenToPriceFeed,
    vaultFactory,
    smartVaultProxy,
    liquidationRouter,
    mintableTokenOwner,
    vaultExtraSettings,
    vaultFactoryZapper,
    auctionManager,
    lastResortLiquidation,
    walletsWithPermissions
  );

  // * Oracles + whitelisting deployment and set up
  let priceFeeds;

  // * Flow to just whitelist new collaterals without converted price feed
  priceFeeds = await whitelistCollateralsPriceFeeds(
    owner,
    // @ts-ignore
    await tokenToPriceFeed.getAddress(),
    await ownerProxy.getAddress(),
    await vaultFactory.getAddress(),
    chainName,
    isTestnet //! change to false for production deployment
  );

  //* Logging all addresses and parameters
  if (logData) {
    console.log('\n===== Deployment Parameters =====');
    console.log(`CHAIN: ${chainName}`);
    console.log(`Stable is USD: ${config.core.stableIsUSD}`);
    console.log(`superOwnerAddress Address: ${walletsWithPermissions.owner}`);
    console.log(`Native WToken Address: ${config.core.nativeWToken}`);
    console.log('VaultFactory: ');
    console.log(
      `  - Debt Ceiling (Stable limit to mint): ${Number(config.vaultFactory.debtCeiling)} `
    );
    console.log(
      `  - Max debt per window (Stable limit to mint per window): ${Number(config.vaultFactory.maxDebtPerWindow)}`
    );
    console.log('Smart Vault Proxy: ');
    console.log(`  - Reward Fee: ${Number(config.fees.rewardFee) / 100} %`);

    console.log('\n===== Deployment Tokens Addresses =====');
    console.log(
      `  - Mintable Token Address: ${await mintableToken.getAddress()}`
    );

    console.log('\n===== Deployment Protocol Addresses =====');
    console.log(
      `Mintable Token Owner Address: ${await mintableTokenOwner.getAddress()}`
    );
    console.log(
      // @ts-ignore
      `Token to Price Feed Address: ${await tokenToPriceFeed.getAddress()}`
    );
    console.log(
      `Vault Extra Settings Address: ${await vaultExtraSettings.getAddress()}`
    );
    console.log(
      `Smart Vault Proxy Address: ${await smartVaultProxy.getAddress()}`
    );
    console.log(
      `Smart Vault Deployer Address: ${await smartVaultDeployer.getAddress()}`
    );
    console.log(
      `Liquidation Router Address: ${await liquidationRouter.getAddress()}`
    );
    console.log(
      `Vault Borrow Rate Address: ${await vaultBorrowRate.getAddress()}`
    );
    console.log(`Vault Factory Address: ${await vaultFactory.getAddress()}`);
    console.log(
      `Vault Factory Zapper Address: ${await vaultFactoryZapper.getAddress()}`
    );
    console.log(
      `Vault Factory Helper Address: ${await vaultFactoryHelper.getAddress()}`
    );
    console.log(
      `Auction Manager Address: ${await auctionManager.getAddress()}`
    );
    console.log(
      `Last Resort Liquidation Address: ${await lastResortLiquidation.getAddress()}`
    );
    console.log(`Owner Proxy Address: ${await ownerProxy.getAddress()}\n`);
  }

  return {
    superOwnerAddress: walletsWithPermissions.owner,
    walletsWithPermissions,
    owner,
    collateralManager,
    nativeWToken: config.core.nativeWToken,
    rewardFee: config.fees.rewardFee,
    mintableToken,
    mintableTokenOwner,
    tokenToPriceFeed,
    vaultExtraSettings,
    smartVaultProxy,
    smartVaultDeployer,
    liquidationRouter,
    vaultBorrowRate,
    vaultFactory,
    vaultFactoryZapper,
    vaultFactoryHelper,
    ownerProxy,
    priceFeeds,
    auctionManager,
    lastResortLiquidation
  };
};

export default deployProtocol;

// ! Uncomment to deploy protocol to production - Not needed for tests
// deployProtocol(false, true).catch((error) => {
//   console.log(error);
// });

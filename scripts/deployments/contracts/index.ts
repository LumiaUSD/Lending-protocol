import { smartVaultDeployer } from './smartVaultDeployer';
import { liquidationRouter, setLiquidationRouter } from './liquidationRouter';
import { mintableToken } from './mintableToken';
import { mintableTokenOwner } from './mintableTokenOwner';
import { smartVaultProxy } from './smartVaultProxy';
import { tokenToPriceFeed } from './tokenToPriceFeed';
import { vaultBorrowRate } from './vaultBorrowRate';
import { vaultExtraSettings } from './vaultExtraSettings';
import { vaultFactory } from './vaultFactory';
import { vaultFactoryHelper } from './vaultFactoryHelper';
import { vaultFactoryZapper } from './vaultFactoryZapper';
import { governanceToken } from './governanceToken';
import { ownerProxy } from './ownerProxy';
import { convertionPriceFeed } from './convertionPriceFeed';
import { auctionManager } from './auctionManager';
import { lastResortLiquidation } from './lastResortLiquidation';

const deployments = {
  governanceToken,
  smartVaultDeployer,
  liquidationRouter,
  mintableToken,
  mintableTokenOwner,
  smartVaultProxy,
  tokenToPriceFeed,
  vaultBorrowRate,
  vaultExtraSettings,
  vaultFactory,
  vaultFactoryHelper,
  vaultFactoryZapper,
  ownerProxy,
  convertionPriceFeed,
  auctionManager,
  lastResortLiquidation,
  setLiquidationRouter
};

export default deployments;

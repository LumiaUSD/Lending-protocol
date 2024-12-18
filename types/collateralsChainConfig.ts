import { TokenToPriceFeed } from './../typechain-types/contracts/TokenToPriceFeed';
import { CollateralConfig } from './collateralConfig';

export type CollateralChainConfig = {
  nativeWrapped: string;
  collateralTokens: CollateralConfig[];
  CollateralToWhitelist: CollateralConfig[];
};

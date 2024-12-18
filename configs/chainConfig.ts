import { CollateralChainConfig } from '../types/collateralsChainConfig';

export const getChainConfig = (networkName: string) => {
  const collaterals = require(`./collaterals/${networkName}`);
  const addresses = require(`./addresses/${networkName}`);
  return {
    collaterals: collaterals as CollateralChainConfig,
    addresses: addresses as any
  };
};

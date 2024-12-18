import { CollateralConfig } from '../../types/collateralConfig';
import { CollateralChainConfig } from '../../types/collateralsChainConfig';
import lumiaDataRaw from './data/lumia.json';

const lumiaData: CollateralConfig[] = (lumiaDataRaw as any[]).map((item) => ({
  ...item,
  collateralCap: Number(item.collateralCap),
  associated_token: item.associated_token ?? '',
  oracleRate: item.oracleRate ?? '',
  priceFeed: item.priceFeed ?? '',
  convertedPriceFeed: item.convertedPriceFeed ?? ''
}));

const config: CollateralChainConfig = {
  nativeWrapped: '',
  collateralTokens: lumiaData as CollateralConfig[], // ensure lumia Data is of type CollateralConfig[]
  CollateralToWhitelist: [
    {
      tokenName: 'Wrapped Lumia',
      address: '0xE891B5EE2F52E312038710b761EC165792AD25B1',
      mcr: 225,
      mlr: 150,
      variableFee: '0',
      decimals: 18,
      collateralCap: '150000000000000000000000',
      oracle: '0x57a73b7A4Cf18CAD77FbBB4D75651d945090272F',
      oracleType: 'API3MarketPriceFeed',
      oracleRate: '1'
    }
  ]
};

export default config;

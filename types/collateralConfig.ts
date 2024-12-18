export type CollateralConfig = {
  tokenName: string;
  address: string;
  associated_token?: string; // corrected spelling
  mcr: number;
  mlr: number;
  variableFee: string;
  decimals: number;
  oracle: string;
  oracleRate: string;
  oracleType:
    | 'ChainlinkPriceFeed'
    | 'stChainlinkPriceFeed'
    | 'RatePriceFeed'
    | 'CTokenPriceFeed'
    | 'API3MarketPriceFeed';
  collateralCap: string;
  fixedPrice?: number;
  priceFeed?: string;
  convertedPriceFeed?: string;
};

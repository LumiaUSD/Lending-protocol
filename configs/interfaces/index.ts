export interface Auction {
  originalDebt: string;
  lowestDebtToAuction: string;
  highestDebtToAuction: string;
  collateralsLength: number;
  collateral: string[];
  collateralAmount: string[];
  collateralValue: string;
  auctionStartTime: number;
  auctionEndTime: number;
  auctionEnded: boolean;
  txHashes: string[];
}

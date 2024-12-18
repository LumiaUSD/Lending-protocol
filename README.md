# Lumia Lending Protocol - luUSD

> [!NOTE]
> This repository contains the core smart contracts for the Lumia Lending Protocol, forked from the 3A DAO Borrowing Protocol.

A fork of the 3A DAO lending protocol, customized for Lumia to enable LUMIA token holders to use their tokens as collateral for borrowing luUSD stablecoin.

## Key Features

- **Collateralized Lending**: Users can deposit LUMIA tokens as collateral to borrow luUSD
- **Multiple Collateral Support**: While optimized for LUMIA, the protocol also can supports other collateral types like wETH
- **Liquidation Protection**: Implements a Dutch Auction system for liquidations with a Last Resort mechanism
- **Price Feeds**: Uses API3 Market Price Feeds for secure collateral valuation
- **Smart Contract Security**: Inherits 3A DAO's battle-tested smart contract architecture

## Technical Details

- Built on EVM compatible chains
- Uses Hardhat for development and testing
- Includes comprehensive testing suite and deployment scripts

### Deployment Configuration

#### Core Addresses

- **Owner**: `0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12`
- **Liquidator**: `0x9d1F06EBEF1cBC1313a0a03D789E29F676CbcCD8`
- **Collateral Manager**: `0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12`
- **Fee Recipient**: `0x3059afF4B95B60b37F764a287B43e4f140344917`

#### Protocol Configuration

- **Native Wrapped Token**: `0xE891B5EE2F52E312038710b761EC165792AD25B1`
- **Price Feed (LUMIA/USD)**: `0x57a73b7A4Cf18CAD77FbBB4D75651d945090272F`
- **Stable Currency**: USD

#### Token Details

- **Name**: Lumia USD
- **Symbol**: luUSD

#### Vault Parameters

- **Debt Ceiling**: 100,000 luUSD
- **Max Debt Per Window**: 100,000 luUSD

#### Fee Structure

- **Borrowing Fee Receiver**: `0x3059afF4B95B60b37F764a287B43e4f140344917`
- **Redeeming Fee Receiver**: `0x3059afF4B95B60b37F764a287B43e4f140344917`
- **Reward Fee**: 0%
- **Redemption Fee**: 0.5%

#### Redemption Parameters

- **Redemption Kickback**: 0%
- **Redeemable Percentage**: 100%

### Collaterals

#### LUMIA & wLUMIA

- Minimum Collateral Ratio (MCR): 225%
- Minimum Liquidation Ratio (MLR): 150%
- Variable&/borrowing Fee: 0%
- Collateral Cap: 150M tokens

## Running Main Protocol Tests

```bash
npx hardhat test
```

## Deploying

```bash
npx hardhat run scripts/deployments/deployProtocol.ts --network lumiaMainnet
```

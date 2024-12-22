# Lumia Lending Protocol - rwaUSD

> [!NOTE]
> This repository contains the core smart contracts for the Lumia Lending Protocol, forked from the 3A DAO Borrowing Protocol.

A fork of the 3A DAO lending protocol, customized for Lumia to enable LUMIA token holders to use their tokens as collateral for borrowing rwaUSD stablecoin.

## Key Features

- **Collateralized Lending**: Users can deposit LUMIA tokens as collateral to borrow rwaUSD
- **Multiple Collateral Support**: While optimized for LUMIA, the protocol also can supports other collateral types like wETH
- **Liquidation Protection**: Implements a Dutch Auction system for liquidations with a Last Resort mechanism
- **Price Feeds**: Uses API3 Market Price Feeds for secure collateral valuation
- **Smart Contract Security**: Inherits 3A DAO's battle-tested smart contract architecture

## Technical Details

- Built on EVM compatible chains
- Uses Hardhat for development and testing
- Includes comprehensive testing suite and deployment scripts

## Deployment Details

### Core Contracts

| Contract                          | Address                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Mintable Token Lumia USD - rwaUSD | [0xDf6b509693B431BD289CBC442F4B78ddaCb2A1E0](https://explorer.lumia.org/address/0xDf6b509693B431BD289CBC442F4B78ddaCb2A1E0) |
| Mintable Token Owner              | [0x482EaBBA837170DaaE5De9AB288c5003EEC93C1a](https://explorer.lumia.org/address/0x482EaBBA837170DaaE5De9AB288c5003EEC93C1a) |
| Token To Price Feed               | [0x489d04f2AF0a423d4031Aa14a7De3677AEC5dfA0](https://explorer.lumia.org/address/0x489d04f2AF0a423d4031Aa14a7De3677AEC5dfA0) |
| Vault Extra Settings              | [0x00e011427F547cEc271558b60D1973DC6F51f81](https://explorer.lumia.org/address/0x00e011427F547cEc271558b60D1973DC6F51f81)   |
| Smart Vault Proxy                 | [0xdb6ee8d804Df3d93Ae92c02aB2fB377b5d9bA2B0](https://explorer.lumia.org/address/0xdb6ee8d804Df3d93Ae92c02aB2fB377b5d9bA2B0) |
| Smart Vault Deployer              | [0x25873c3d82dE1eD069B02feDA958eE9D3A5E69B4](https://explorer.lumia.org/address/0x25873c3d82dE1eD069B02feDA958eE9D3A5E69B4) |
| Liquidation Router                | [0x7Ea6031dD3AF19D61772E2Ec2E2177dD958d8F78](https://explorer.lumia.org/address/0x7Ea6031dD3AF19D61772E2Ec2E2177dD958d8F78) |
| Vault Borrow Rate                 | [0x64b8ddcFEd7b752A8BD18a2c1af22f9383C6bB33](https://explorer.lumia.org/address/0x64b8ddcFEd7b752A8BD18a2c1af22f9383C6bB33) |
| Vault Factory                     | [0xF2C2691Ea8937f5Dbf07E6FF69F40d80AFD8789C](https://explorer.lumia.org/address/0xF2C2691Ea8937f5Dbf07E6FF69F40d80AFD8789C) |
| Vault Factory Zapper              | [0x8A4C3Bc98dB9A2c8a1DaEF7695ee572624688C3](https://explorer.lumia.org/address/0x8A4C3Bc98dB9A2c8a1DaEF7695ee572624688C3)   |
| Vault Factory Helper v2           | [0x38ccdf424Bf32E6756C5b607c898A83A885B6915](https://explorer.lumia.org/address/0x38ccdf424Bf32E6756C5b607c898A83A885B6915) |
| Auction Manager                   | [0xCAE7cf522D37b05AF6038E6c98441A2F50154EA5](https://explorer.lumia.org/address/0xCAE7cf522D37b05AF6038E6c98441A2F50154EA5) |
| Last Resort Liquidation           | [0x5D815141ec1a483743798dc5Da26436E889850D](https://explorer.lumia.org/address/0x5D815141ec1a483743798dc5Da26436E889850D)   |
| Owner Proxy                       | [0xAF8164dEe8743B1D1Ec8130E15EE9Da70a79482d](https://explorer.lumia.org/address/0xAF8164dEe8743B1D1Ec8130E15EE9Da70a79482d) |
| Wrapped Lumia - WLUMIA            | [0xE891B5EE2F52E312038710b761EC165792AD25B1](https://explorer.lumia.org/address/0xE891B5EE2F52E312038710b761EC165792AD25B1) |

### Price Feeds (Adapters)

| Feed                | Address                                                                                                                     | Type                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| wLUMIA - Price Feed | [0x58504c4eE9f9e9cf7b17988817fddFa9934E76d4](https://explorer.lumia.org/address/0x58504c4eE9f9e9cf7b17988817fddFa9934E76d4) | API3MarketPriceFeed |

### Roles

| Role               | Address                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Owner              | [0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12](https://explorer.lumia.org/address/0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12) |
| Collateral Manager | [0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12](https://explorer.lumia.org/address/0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12) |
| Liquidator         | [0x9d1F06EBEF1cBC1313a0a03D789E29F676CbcCD8](https://explorer.lumia.org/address/0x9d1F06EBEF1cBC1313a0a03D789E29F676CbcCD8) |
| Fee Recipient      | [0x3059afF4B95B60b37F764a287B43e4f140344917](https://explorer.lumia.org/address/0x3059afF4B95B60b37F764a287B43e4f140344917) |

### OwnerProxy Permissions Matrix

#### Method Signatures and Authorized Addresses

| Method Signature | Function Name         | Authorized Address                                                                                                          |
| ---------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 0xbb991f11       | setTokenPriceFeed     | [0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12](https://explorer.lumia.org/address/0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12) |
| 0x3d913818       | setCollateralCapacity | [0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12](https://explorer.lumia.org/address/0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12) |
| 0x3cf57c61       | setMaxTokensPerVault  | [0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12](https://explorer.lumia.org/address/0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12) |
| 0x1f1088a0       | withdrawCollateral    | [0x9d1F06EBEF1cBC1313a0a03D789E29F676CbcCD8](https://explorer.lumia.org/address/0x9d1F06EBEF1cBC1313a0a03D789E29F676CbcCD8) |

> [!NOTE]
> The Owner set in the OwnerProxy.sol can call any method of the protocol via `executeOwner()

## Protocol Configuration

### Core Parameters

| Parameter              | Value                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Native Wrapped Token   | [0xE891B5EE2F52E312038710b761EC165792AD25B1](https://explorer.lumia.org/address/0xE891B5EE2F52E312038710b761EC165792AD25B1) |
| Price Feed (LUMIA/USD) | [0x57a73b7A4Cf18CAD77FbBB4D75651d945090272F](https://explorer.lumia.org/address/0x57a73b7A4Cf18CAD77FbBB4D75651d945090272F) |
| Stable Currency        | USD                                                                                                                         |

### Vault Parameters

| Parameter           | Value          |
| ------------------- | -------------- |
| Debt Ceiling        | 100,000 rwaUSD |
| Max Debt Per Window | 100,000 rwaUSD |

### Fee Structure

| Parameter              | Value                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Borrowing Fee Receiver | [0x3059afF4B95B60b37F764a287B43e4f140344917](https://explorer.lumia.org/address/0x3059afF4B95B60b37F764a287B43e4f140344917) |
| Redeeming Fee Receiver | [0x3059afF4B95B60b37F764a287B43e4f140344917](https://explorer.lumia.org/address/0x3059afF4B95B60b37F764a287B43e4f140344917) |
| Reward Fee             | 0%                                                                                                                          |
| Redemption Fee         | 0.5%                                                                                                                        |

### Redemption Parameters

| Parameter             | Value |
| --------------------- | ----- |
| Redemption Kickback   | 0%    |
| Redeemable Percentage | 100%  |

### Collaterals

#### LUMIA & wLUMIA Parameters

| Parameter                       | Value       |
| ------------------------------- | ----------- |
| Minimum Collateral Ratio (MCR)  | 225%        |
| Minimum Liquidation Ratio (MLR) | 150%        |
| Variable Borrowing Fee          | 0%          |
| Collateral Cap                  | 150K tokens |

## Running Main Protocol Tests

```bash
npx hardhat test
```

## Deploying & Set Up the whole protocol

```bash
npx hardhat run scripts/deployments/deployProtocol.ts --network lumiaMainnet
```

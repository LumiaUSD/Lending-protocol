const deploymentConfig = {
  lumia: {
    walletsWithPermissions: {
      owner: '0x0848BfaF6c5E893dD46B040867E10D8979CC8927', //! Future Owner Wallet to transfer:'0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12',
      liquidator: '0x9d1F06EBEF1cBC1313a0a03D789E29F676CbcCD8',
      collateralManager: '0x7d37aD1f3c4D3538359c976aBa7ef42D941d2C12',
      feeRecipient: '0x3059afF4B95B60b37F764a287B43e4f140344917'
    },
    config: {
      core: {
        nativeWToken: '0xE891B5EE2F52E312038710b761EC165792AD25B1', //! Modify native token. eg: wETH - Ethereum
        priceFeedStableAddress: '0x57a73b7A4Cf18CAD77FbBB4D75651d945090272F', //! LUMIA/USD Market API3
        stableIsUSD: true //! Toggle in case the stableCoin is in USD or in any other currency
      },
      mintableTokenMetadata: {
        name: 'Lumia USD',
        symbol: 'luUSD'
      },
      vaultFactory: {
        debtCeiling: '100000', //! 100K luUSD in total can be minted
        maxDebtPerWindow: '100000' //! 100K luUSD in total can be minted per window, which is the maximum debt ceiling set
      },
      fees: {
        borrowingFeeReceiver: '0x3059afF4B95B60b37F764a287B43e4f140344917', // ! Treasury for fees generated for borrowing new debt
        redeemingFeeReceiver: '0x3059afF4B95B60b37F764a287B43e4f140344917', // ! Treasury for fees generated for redeeming a vault
        rewardFee: '0', //! Commission for third-party token rewards from vault deposits: 1 = 0.01% (eg: Mendi rewards)
        redemptionFee: '5000000000000000' // 0.5% with 18 decimals
      },
      redemptions: {
        redemptionKickback: '0', //! % kept to the redeemer. 0.01 equals to 1%.
        redeemablePercentage: '1' //! max redeemable % to redeem at once. 0.3 equals to 30%.
      }
    }
  }
};

export default deploymentConfig;

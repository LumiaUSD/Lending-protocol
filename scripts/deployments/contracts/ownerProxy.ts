import { ethers } from 'hardhat';
import { BaseContract } from 'ethers';
import { verify } from '../../utils/verifyContract';

type TWalletsWithPermissions = {
  owner: string;
  hypernativeGuardian: string;
  depegWatchDog: string;
  liquidator: string;
  collateralManager: string;
  feeRecipient: string;
};

export const ownerProxy = async (
  superOwnerAddress: string,
  tokenToPriceFeed: BaseContract,
  vaultFactory: BaseContract,
  smartVaultProxy: BaseContract,
  liquidationRouter: BaseContract,
  mintableTokenOwner: BaseContract,
  vaultExtraSettings: BaseContract,
  vaultFactoryZapper: BaseContract,
  auctionManager: BaseContract,
  lastResortLiquidation: BaseContract,
  walletsWithPermissions: TWalletsWithPermissions
) => {
  const ownerProxyPermissions = [
    {
      target: tokenToPriceFeed.target, // contract target
      signature: '0xbb991f11', // setTokenPriceFeed(address,address,uint256,uint256,uint256,uint256)
      addresses: [walletsWithPermissions.collateralManager]
    },
    // {
    //   target: vaultFactory.target, // contract target
    //   signature: '0x0b3392d8', // setMaxDebtPerWindow(uint256)
    //   addresses: [
    //   ]
    // },
    // {
    //   target: vaultFactory.target, // contract target
    //   signature: '0xb1511cc9', // setDebtCeiling(uint256)
    //   addresses: [
    //   ]
    // },
    {
      target: vaultFactory.target, // contract target
      signature: '0x3d913818', // setCollateralCapacity(vaultFactory.target,uint256)
      addresses: [walletsWithPermissions.collateralManager]
    },
    // {
    //   target: vaultFactory.target, // contract target
    //   signature: '0xf2fde38b', // transferOwnership(address)
    //   addresses: []
    // },
    // {
    //   target: vaultFactory.target, // contract target
    //   signature: '0xa3320222', // setRedemptionHealthFactorLimit(uint256)
    //   addresses: []
    // },
    // {
    //   target: vaultFactory.target, // contract target
    //   signature: '0xa74dd4c4', // setDebtWindowSize(uint256)
    //   addresses: []
    // },
    {
      target: vaultFactory.target, // contract target
      signature: '0x3cf57c61', // setMaxTokensPerVault
      addresses: [walletsWithPermissions.collateralManager]
    },
    {
      target: lastResortLiquidation.target, // contract target
      signature: '0x1f1088a0', // withdrawCollateral(address,uint256,address)
      addresses: [walletsWithPermissions.liquidator] // Liquidates + claims lastResortLiquidation collateral too
    }
  ];
  const OwnerProxy = await ethers.getContractFactory('OwnerProxy');
  const ownerProxy = await OwnerProxy.deploy();
  await ownerProxy.waitForDeployment();
  await verify(await ownerProxy.getAddress(), []);
  // * Whitelist new methods to execute to different addresses in owner Proxy
  for (let i = 0; i < ownerProxyPermissions.length; i++) {
    console.log(`Signature ${ownerProxyPermissions[i].signature} added for :`);
    for (let j = 0; j < ownerProxyPermissions[i].addresses.length; j++) {
      console.log(`  - ${ownerProxyPermissions[i].addresses[j]}`);
      const tx = await ownerProxy.addPermission(
        ownerProxyPermissions[i].addresses[j],
        ownerProxyPermissions[i].target,
        ownerProxyPermissions[i].signature
      );
      await tx.wait();
    }
  }

  // *Change ownership to ownerProxy
  const ownerProxyAddress = await ownerProxy.getAddress();
  const contracts = [
    tokenToPriceFeed,
    vaultFactory,
    smartVaultProxy,
    liquidationRouter,
    mintableTokenOwner,
    vaultExtraSettings,
    vaultFactoryZapper,
    auctionManager,
    lastResortLiquidation
  ];

  for (const contract of contracts) {
    // @ts-ignore
    const tx = await contract.transferOwnership(ownerProxyAddress);
    await tx.wait();
  }

  //* Transfer owner to hardwallet
  const tx = await ownerProxy.transferOwnership(superOwnerAddress);
  await tx.wait();
  return ownerProxy;
};

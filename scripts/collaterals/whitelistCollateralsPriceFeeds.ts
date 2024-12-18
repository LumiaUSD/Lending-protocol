import { ownerProxy } from './../deployments/contracts/ownerProxy';
import { ethers, network } from 'hardhat';
import { Signer } from 'ethers';
import configLumia from '../../configs/collaterals/lumia';
import { verify } from '../utils/verifyContract';

//* This function deploys a Chainlink Price Feed in USD.
async function whitelistCollateralsPriceFeeds(
  owner: Signer,
  tokenToPriceFeedAddress: string,
  ownerProxyAddress: string,
  vaultFactoryAddress: string,
  chainName: string,
  isTestnet: boolean
) {
  console.log('Chain:', chainName);
  let config;

  if (chainName == 'lumia') {
    config = configLumia;
  } else {
    throw new Error('invalid chain');
  }

  console.log('Collaterals to whitelist: ', config.CollateralToWhitelist);
  // return;
  if (config.CollateralToWhitelist.length == 0) {
    console.log('No new collaterals to whitelist');
    return [];
  }

  // 1. Deploy new Data Price Feed for new collateral
  const deployedFeeds: string[] = [];

  for (const collateralToken of config.CollateralToWhitelist) {
    let priceFeed = await ethers.getContractFactory(
      collateralToken.oracleType, //! Price feeds Types: ChainlinkPriceFeed, stChainlinkPriceFee, RatePriceFeed, CTokenPriceFeed or API3MarketPriceFeed
      owner
    );
    console.log(
      `[!] Deploying ${collateralToken.oracleType} Oracle for ${collateralToken.tokenName}`
    );
    let deployedContract: any;
    if (collateralToken.oracleType === 'ChainlinkPriceFeed') {
      deployedContract = await priceFeed.deploy(
        collateralToken.oracle,
        collateralToken.address
      );
      await deployedContract.waitForDeployment();
      if (!isTestnet) {
        await verify(deployedContract.target, [
          collateralToken.oracle,
          collateralToken.address
        ]);
      }
    } else if (
      collateralToken.oracleType === 'stChainlinkPriceFeed' ||
      collateralToken.oracleType === 'RatePriceFeed'
    ) {
      deployedContract = await priceFeed.deploy(
        collateralToken.oracle,
        collateralToken.oracleRate,
        collateralToken.address
      );
      await deployedContract.waitForDeployment();

      if (!isTestnet)
        await verify(deployedContract.target, [
          collateralToken.oracle,
          collateralToken.oracleRate!,
          collateralToken.address
        ]);
    } else if (collateralToken.oracleType === 'CTokenPriceFeed') {
      deployedContract = await priceFeed.deploy(
        collateralToken.oracle,
        collateralToken.oracleRate,
        collateralToken.associated_token
      );
      if (!isTestnet) await deployedContract.waitForDeployment();

      if (!isTestnet)
        await verify(deployedContract.target, [
          collateralToken.oracle,
          collateralToken.oracleRate!,
          collateralToken.address
        ]);
    } else if (collateralToken.oracleType === 'API3MarketPriceFeed') {
      deployedContract = await priceFeed.deploy(
        collateralToken.oracle,
        collateralToken.address
      );
      if (!isTestnet) await deployedContract.waitForDeployment();

      if (!isTestnet) {
        await verify(deployedContract.address, [
          collateralToken.oracle,
          collateralToken.address
        ]);
      }
    } else {
      console.log('Invalid oracle type: ', collateralToken.oracleType);
    }
    deployedFeeds.push(deployedContract.target);

    console.log(
      'Price in USD: ',
      Number(ethers.formatEther(await deployedContract.price()))
    );
  }

  // 2. Set Collateral Capacity in Vault Factory
  const ownerProxy = await ethers.getContractAt(
    'OwnerProxy',
    ownerProxyAddress,
    owner
  );

  for (let i = 0; i < config.CollateralToWhitelist.length; i++) {
    console.log(
      `[!] Setting max capacity in Vault Factory for ${config.CollateralToWhitelist[i].tokenName}`
    );

    const types = ['address', 'uint256'];
    const encoder = ethers.AbiCoder.defaultAbiCoder();
    const encodedParams = encoder.encode(types, [
      config.CollateralToWhitelist[i].address,
      config.CollateralToWhitelist[i].collateralCap
    ]);

    const setCollateralCap = await ownerProxy.executeOwner(
      vaultFactoryAddress,
      'setCollateralCapacity(address,uint256)',
      encodedParams
    );
    if (!isTestnet) await setCollateralCap.wait(2);
  }

  console.log('\n');

  // const TokenToPriceFeed = await ethers.getContractAt(
  //   'TokenToPriceFeed',
  //   tokenToPriceFeedAddress,
  //   collateralManager  // );

  // 4. Set new collateral in Token To Price Fee
  for (let i = 0; i < config.CollateralToWhitelist.length; i++) {
    console.log(
      `[!] Setting ${config.CollateralToWhitelist[i].tokenName} as collateral`
    );

    // * Option A (Owner (EOA) is the owner of tokenToPriceFeed)
    // const setTokenPriceFeed = await TokenToPriceFeed.setTokenPriceFeed(
    //   config.CollateralToWhitelist[i].address,
    //   deployedFeeds[i],
    //   config.CollateralToWhitelist[i].mcr,
    //   config.CollateralToWhitelist[i].mlr,
    //   config.CollateralToWhitelist[i].variableFee,
    //   config.CollateralToWhitelist[i].decimals
    // );

    // * Option B (OwnerProxy as owner for tokenToPriceFeed)
    const types = [
      'address',
      'address',
      'uint256',
      'uint256',
      'uint256',
      'uint256'
    ];
    const encoder = ethers.AbiCoder.defaultAbiCoder();
    const encodedParams = encoder.encode(types, [
      config.CollateralToWhitelist[i].address,
      deployedFeeds[i],
      config.CollateralToWhitelist[i].mcr,
      config.CollateralToWhitelist[i].mlr,
      config.CollateralToWhitelist[i].variableFee,
      config.CollateralToWhitelist[i].decimals
    ]);

    const setTokenPriceFeed = await ownerProxy.executeOwner(
      tokenToPriceFeedAddress,
      'setTokenPriceFeed(address,address,uint256,uint256,uint256,uint256)',
      encodedParams
    );
    if (!isTestnet) await setTokenPriceFeed.wait(2);
  }

  console.log('-----------------------------------');
  return deployedFeeds;
}

export default whitelistCollateralsPriceFeeds;

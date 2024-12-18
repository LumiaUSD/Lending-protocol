import { ethers, network } from 'hardhat';
import { Signer } from 'ethers';
import configLumia from '../../configs/collaterals/lumia';
import addessesLumia from '../../configs/addresses/lumia.json';

//* This function deploys whitelists collaterals using mockup priceFeeds
async function mockUpWhitelistCollateralsPriceFeeds(
  collateralManager: Signer,
  tokenToPriceFeedAddress: string,
  ownerProxyAddress: string,
  vaultFactoryAddress: string,
  chainName: string,
  isTestnet: boolean
) {
  console.log('Chain:', chainName);
  let config;

  if (chainName == 'lumiaMainnet') {
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
  // 2. Set Collateral Capacity in Vault Factory
  const ownerProxy = await ethers.getContractAt(
    'OwnerProxy',
    ownerProxyAddress,
    collateralManager
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

    const setCollateralCap = await ownerProxy.execute(
      vaultFactoryAddress,
      'setCollateralCapacity(address,uint256)',
      encodedParams
    );
    if (!isTestnet) await setCollateralCap.wait(1);
  }

  console.log('\n');

  // const TokenToPriceFeed = await ethers.getContractAt(
  //   'TokenToPriceFeed',
  //   tokenToPriceFeedAddress,
  //   collateralManager  // );

  // 4. Set new collateral in Token To Price Fee
  for (let i = 0; i < config.CollateralToWhitelist.length; i++) {
    deployedFeeds.push(config.CollateralToWhitelist[i].priceFeed!);
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
      config.CollateralToWhitelist[i].priceFeed,
      config.CollateralToWhitelist[i].mcr,
      config.CollateralToWhitelist[i].mlr,
      config.CollateralToWhitelist[i].variableFee,
      config.CollateralToWhitelist[i].decimals
    ]);

    const setTokenPriceFeed = await ownerProxy.execute(
      tokenToPriceFeedAddress,
      'setTokenPriceFeed(address,address,uint256,uint256,uint256,uint256)',
      encodedParams
    );
    if (!isTestnet) await setTokenPriceFeed.wait(1);
  }

  console.log('-----------------------------------');
  return deployedFeeds;
}

export default mockUpWhitelistCollateralsPriceFeeds;

async function main(chain: string, isTestnet: boolean) {
  const [collateralManager] = await ethers.getSigners();

  let addresses;
  if (chain == 'lumiaMainnet') {
    addresses = addessesLumia;
  } else throw 'Wrong Chain';

  await mockUpWhitelistCollateralsPriceFeeds(
    collateralManager,
    addresses?.tokenToPriceFeed!,
    addresses?.ownerProxy!,
    addresses?.vaultFactory!,
    chain,
    isTestnet
  );
}

const isTestnet = false;
const chainName = 'lumiaMainnet';
// main(chainName, isTestnet);

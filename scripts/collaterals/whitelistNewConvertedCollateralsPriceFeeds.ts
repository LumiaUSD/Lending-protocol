import { ethers, network } from 'hardhat';
import { Signer } from 'ethers';
import configLumia from '../../configs/collaterals/lumia';
import { verify } from '../utils/verifyContract';

//* This function deploys a Chainlink Price Feed, also a ConvertedPriceFeed to convert the value from USD to EUR by setting the Chainlink Price Feed and finally sets the collateral on the TokenToPriceFeed contract.
async function whitelistNewConvertedCollateralsPriceFeeds(
  collateralManager: Signer,
  tokenToPriceFeedAddress: string,
  ownerProxyAddress: string,
  vaultFactoryAddress: string,
  convertionPriceFeedAddress: string, // EUR/USDC
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

  for (const collateralToken of config.CollateralToWhitelist) {
    let priceFeed = await ethers.getContractFactory(
      collateralToken.oracleType, //! Price feeds Types: ChainlinkPriceFeed, stChainlinkPriceFee, RatePriceFeed or CTokenPriceFeed
      collateralManager
    );
    console.log(
      `[!] Deploying Chainlink Price Feed Oracle for ${collateralToken.tokenName}`
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
    } else {
      console.log('Invalid oracle type: ', collateralToken.oracleType);
    }
    deployedFeeds.push(deployedContract.target);

    console.log(
      'Price in USD: ',
      Number(ethers.formatEther(await deployedContract.price()))
    );
  }
  // console.log('Deployed Feeds: ');
  // console.log(deployedFeeds);
  // console.log('\n');
  // 2. Deploy the ConvertedPriceFeed (Token USD Price to EURO)
  const deployedConvertedPriceFeed: string[] = [];

  for (let i = 0; i < config.CollateralToWhitelist.length; i++) {
    const convertedPriceFeed = await ethers.getContractFactory(
      'ConvertedPriceFeed',
      collateralManager
    );
    console.log(
      `[!] Deploying ConvertedPriceFeed for ${config.CollateralToWhitelist[i].tokenName}`
    );

    const deployedContract = await convertedPriceFeed.deploy(
      deployedFeeds[i],
      convertionPriceFeedAddress,
      config.CollateralToWhitelist[i].address
    );
    await deployedContract.waitForDeployment();
    console.log(
      'Price in EUR: ',
      Number(ethers.formatEther(await deployedContract.price()))
    );

    if (!isTestnet)
      await verify(deployedContract.target.toString(), [
        deployedFeeds[i],
        convertionPriceFeedAddress,
        config.CollateralToWhitelist[i].address
      ]);
    deployedConvertedPriceFeed.push(deployedContract.target.toString());
  }
  // console.log('Deployed Converted Price Feed: ');
  // console.log(deployedConvertedPriceFeed);

  // console.log('\n');

  // 3. Set Collateral Capacity in Vault Factory
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
    if (!isTestnet) await setCollateralCap.wait(2);
  }

  console.log('\n');

  // const TokenToPriceFeed = await ethers.getContractAt(
  //   'TokenToPriceFeed',
  //   tokenToPriceFeedAddress,
  //   owner
  // );

  // 4. Set new collateral in Token To Price Fee
  for (let i = 0; i < config.CollateralToWhitelist.length; i++) {
    console.log(
      `[!] Setting ${config.CollateralToWhitelist[i].tokenName} as collateral`
    );

    // * Option A (Owner (EOA) is the owner of tokenToPriceFeed)
    // const setTokenPriceFeed = await TokenToPriceFeed.setTokenPriceFeed(
    //   config.CollateralToWhitelist[i].address,
    //   deployedConvertedPriceFeed[i],
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
      deployedConvertedPriceFeed[i],
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
    if (!isTestnet) await setTokenPriceFeed.wait(2);
  }

  console.log('-----------------------------------');
  return deployedConvertedPriceFeed;
}

const isTestnet = false; //* Toggle to test before deployment
const chainName = 'lumiaMainnet';
// whitelistNewCollaterals(chainName, isTestnet);

export default whitelistNewConvertedCollateralsPriceFeeds;

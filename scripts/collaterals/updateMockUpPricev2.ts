import { ethers, network } from 'hardhat';
import { Signer } from 'ethers';

//* This function updates the mockup price for a specific price feed
async function updateMockUpPriceV2(
  collateralManager: Signer,
  priceFeedAddress: string,
  newPrice: string,
  chainName: string
) {
  console.log('Chain:', chainName);

  const MockConvertedPriceFeedV2 = await ethers.getContractAt(
    'MockConvertedPriceFeedV2',
    priceFeedAddress,
    collateralManager
  );

  const priceOld = await MockConvertedPriceFeedV2.price();
  console.log('old Price:', priceOld);

  const updateTx = await MockConvertedPriceFeedV2.updatePrice(newPrice);
  await updateTx.wait(1);

  const priceNew = await MockConvertedPriceFeedV2.price();
  console.log('new Price:', priceNew);
  console.log('-----------------------------------');
  return;
}

export default updateMockUpPriceV2;

async function main(priceFeedAddress: string, newPrice: string, chain: string) {
  const [collateralManager] = await ethers.getSigners();

  await updateMockUpPriceV2(
    collateralManager,
    priceFeedAddress,
    newPrice,
    chain
  );
}

const chainName = 'lumiaMainnet';
const priceFeedAddress = '';
const newPrice = '2000000000000000000'; // 2 USD
main(priceFeedAddress, newPrice, chainName);

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';

describe('- API3MarketPriceFeed', () => {
  const LUMIA_USD_PROXY = '0x57a73b7A4Cf18CAD77FbBB4D75651d945090272F';

  async function deployAPI3PriceFeedFixture() {
    const [owner] = await ethers.getSigners();

    // Set balance directly
    await ethers.provider.send('hardhat_setBalance', [
      owner.address,
      '0x8AC7230489E80000' // 10 ETH in hex
    ]);

    // Deploy a mock ERC20 token (we still need this for testing)
    const MockToken = await ethers.getContractFactory('MockERC20');
    const token = await MockToken.deploy('Mock Token', 'MTK');
    await token.waitForDeployment();

    // Deploy API3MarketPriceFeed with real proxy address
    const API3MarketPriceFeed = await ethers.getContractFactory(
      'API3MarketPriceFeed'
    );
    const api3PriceFeed = await API3MarketPriceFeed.deploy(
      LUMIA_USD_PROXY,
      token.target
    );
    await api3PriceFeed.waitForDeployment();

    return { api3PriceFeed, token, owner };
  }

  it('should initialize with correct values', async () => {
    const { api3PriceFeed, token } = await loadFixture(
      deployAPI3PriceFeedFixture
    );

    expect(await api3PriceFeed.oracle()).to.equal(LUMIA_USD_PROXY);
    expect(await api3PriceFeed.token()).to.equal(token.target);
    expect(await api3PriceFeed.precision()).to.equal(ethers.parseEther('1'));
    expect(await api3PriceFeed.updateThreshold()).to.equal(24 * 60 * 60); // 24 hours
  });

  it('should return valid price from Lumia-USD proxy', async () => {
    const { api3PriceFeed } = await loadFixture(deployAPI3PriceFeedFixture);

    const price = await api3PriceFeed.price();
    console.log('price', price);
    expect(price).to.be.gt(0); // Price should be greater than 0
  });

  it('should emit PriceUpdate event with real price data', async () => {
    const { api3PriceFeed, token } = await loadFixture(
      deployAPI3PriceFeedFixture
    );

    const price = await api3PriceFeed.price();
    await expect(api3PriceFeed.emitPriceSignal())
      .to.emit(api3PriceFeed, 'PriceUpdate')
      .withArgs(token.target, price, price);
  });
});

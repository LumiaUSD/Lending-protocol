import { Signer } from 'ethers';
import { deal } from 'hardhat-deal';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import 'dotenv/config';
import deployProtocol from '../scripts/deployments/deployProtocol';
import { Auction } from '../configs/interfaces/index';
import { setBalance } from '@nomicfoundation/hardhat-network-helpers';

const {
  loadFixture
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');

const encoder = ethers.AbiCoder.defaultAbiCoder();
const logData = true;
const logDeploymentData = false;

describe('- Protocol Deployment & Set Up', function () {
  async function deployAndSetupProtocol() {
    const signers = await ethers.getSigners();

    // Give balance to all the signers
    for (const signer of signers) {
      await setBalance(signer.address, ethers.MaxUint256);
    }

    console.log(
      '\n[+] RUNNING THE DEPLOYMENT FOR THE WHOLE PROTOCOL ON A LUMIA MAINNET FORK\n'
    );
    const deployedContracts = await deployProtocol(true, logDeploymentData);
    const collateralData = await setupVaultsAndCollateral(
      deployedContracts,
      signers
    );
    const Collateral_Depositor = signers[0];
    const Collateral_Depositor2 = signers[1];
    const Collateral_Depositor3 = signers[2];
    const Collateral_Depositor4 = signers[3];
    const SP_Depositor = signers[4];
    const SP_Depositor2 = signers[5];

    return {
      ...deployedContracts,
      ...signers,
      Collateral_Depositor,
      Collateral_Depositor2,
      Collateral_Depositor3,
      Collateral_Depositor4,
      SP_Depositor,
      SP_Depositor2,
      ...collateralData
    };
  }

  async function setupVaultsAndCollateral(
    deployedContracts: any,
    signers: any
  ) {
    const { vaultFactory } = deployedContracts;
    const [
      Collateral_Depositor,
      Collateral_Depositor2,
      Collateral_Depositor3,
      Collateral_Depositor4
    ] = signers;

    const vaults = await Promise.all(
      [
        Collateral_Depositor,
        Collateral_Depositor2,
        Collateral_Depositor3,
        Collateral_Depositor4
      ].map((depositor) =>
        vaultFactory
          .connect(depositor)
          .createVault('YOLO')
          .then((tx: any) => tx.wait())
      )
    );

    const mockUpCollateralData = [
      // * Collaterals that will be deposited on vault 1
      {
        tokenName: 'Paribus Lumia',
        address: '0xDDDc272E8D1a62033DF339d95538281EDB230a54',
        mcr: 120,
        mlr: 110,
        variableFee: '500000000000000000',
        decimals: 8,
        collateralCap: '800000000000000000000000000',
        fakePrice: '575852270000000000' // 0.57585227
      },
      // * Collaterals that will be deposited on vault 2
      {
        tokenName: 'wETH',
        address: '0x5A77f1443D16ee5761d310e38b62f77f726bC71c',
        mcr: 110,
        mlr: 105,
        variableFee: '500000000000000000',
        decimals: 8,
        collateralCap: '10000000000000000000000000',
        fakePrice: '60000000000000000000000' // 60K Fake price to reach max mintable amount
      },
      // * Collaterals that will be deposited on vault 3
      {
        tokenName: 'BLUR',
        address: '0x8cA05a96c76660D3D910e45f075fC7697b41E11a',
        mcr: 120,
        mlr: 110,
        variableFee: '500000000000000000',
        decimals: 18,
        collateralCap: '800000000000000000000000000',
        fakePrice: '575852270000000000' // 0.57585227
      }
    ];

    const users = [
      {
        user: Collateral_Depositor,
        vaultAddress: vaults[0].logs[0].args[0],
        collaterals: [mockUpCollateralData[0].address],
        amountsToDeal: [
          ethers.parseUnits('10000000000', mockUpCollateralData[0].decimals)
        ],
        amountsToDeposit: [
          ethers.parseUnits('10000', mockUpCollateralData[0].decimals)
        ],
        amountToBorrow: '2000'
      },
      {
        user: Collateral_Depositor2,
        vaultAddress: vaults[1].logs[0].args[0],
        collaterals: [mockUpCollateralData[1].address],
        amountsToDeal: [
          ethers.parseUnits('10000000000', mockUpCollateralData[1].decimals)
        ],
        amountsToDeposit: [
          ethers.parseUnits('100', mockUpCollateralData[1].decimals)
        ],
        amountToBorrow: '90000'
      },
      {
        user: Collateral_Depositor3,
        vaultAddress: vaults[2].logs[0].args[0],
        collaterals: [mockUpCollateralData[2].address],
        amountsToDeal: [
          ethers.parseUnits('10000000000', mockUpCollateralData[2].decimals)
        ],
        amountsToDeposit: [
          ethers.parseUnits('10000', mockUpCollateralData[2].decimals)
        ],
        amountToBorrow: '2000'
      },
      {
        user: Collateral_Depositor4,
        vaultAddress: vaults[3].logs[0].args[0],
        collaterals: [
          mockUpCollateralData[0].address,
          mockUpCollateralData[2].address
        ],
        amountsToDeal: [
          ethers.parseUnits('10000000000', mockUpCollateralData[0].decimals),
          ethers.parseUnits('10000000000', mockUpCollateralData[2].decimals)
        ],
        amountsToDeposit: [
          ethers.parseUnits('5000', mockUpCollateralData[0].decimals),
          ethers.parseUnits('10', mockUpCollateralData[2].decimals)
        ],
        amountToBorrow: '1000'
      }
    ];

    return {
      vaults: vaults.map((v) => v.logs[0].args[0]),
      mockUpCollateralData,
      users
    };
  }

  it('Check if all the deployed addresses are valid', async function () {
    const {
      mintableToken,
      mintableTokenOwner,
      tokenToPriceFeed,
      vaultExtraSettings,
      smartVaultProxy,
      smartVaultDeployer,
      liquidationRouter,
      vaultBorrowRate,
      vaultFactory,
      vaultFactoryZapper,
      vaultFactoryHelper,
      ownerProxy
    } = await loadFixture(deployAndSetupProtocol);

    const contracts = [
      mintableToken,
      mintableTokenOwner,
      tokenToPriceFeed,
      vaultExtraSettings,
      smartVaultProxy,
      smartVaultDeployer,
      liquidationRouter,
      vaultBorrowRate,
      vaultFactory,
      vaultFactoryZapper,
      vaultFactoryHelper,
      ownerProxy
    ];

    contracts.forEach((contract) => {
      expect(ethers.isAddress(contract.target)).to.be.true;
    });
  });

  it('Ownership check', async function () {
    const {
      superOwnerAddress,
      mintableToken,
      mintableTokenOwner,
      tokenToPriceFeed,
      vaultExtraSettings,
      smartVaultProxy,
      liquidationRouter,
      vaultFactory,
      vaultFactoryZapper,
      ownerProxy
    } = await loadFixture(deployAndSetupProtocol);

    const contracts = [
      mintableTokenOwner,
      tokenToPriceFeed,
      vaultExtraSettings,
      smartVaultProxy,
      liquidationRouter,
      vaultFactory,
      vaultFactoryZapper
    ];

    await Promise.all(
      contracts.map(async (contract) => {
        const owner = await contract.owner();
        expect(owner).to.be.equal(ownerProxy.target);
      })
    );

    expect(await mintableToken.owner()).to.be.equal(mintableTokenOwner.target);
    expect(await ownerProxy.owner()).to.be.equal(superOwnerAddress);
  });

  it('Collaterals whitelisted + pricing check', async function () {
    const { priceFeeds } = await loadFixture(deployAndSetupProtocol);

    await Promise.all(
      priceFeeds.map(async (priceFeed: any) => {
        const priceFeedContract = await ethers.getContractAt(
          'ConvertedPriceFeed',
          priceFeed
        );
        expect(Number(await priceFeedContract.price())).to.not.be.equal(0);
      })
    );
  });

  it('Vault creation check', async function () {
    const { vaultFactory, Collateral_Depositor, vaults } = await loadFixture(
      deployAndSetupProtocol
    );

    expect(vaults[0]).to.not.be.null;
    expect(vaults[0]).to.not.be.equal(ethers.ZeroAddress);
    expect(await vaultFactory.firstVault()).to.be.equal(vaults[0]);
    expect(await vaultFactory.lastVault()).to.be.equal(vaults[3]);

    await vaultFactory.connect(Collateral_Depositor).createVault('YOLO2');
    expect(await vaultFactory.lastVault()).to.not.be.equal(vaults[3]);
  });

  it('Deposit collateral + Borrow luUSD + Withdrawn + Repay', async function () {
    const {
      vaultFactory,
      Collateral_Depositor,
      vaults,
      mintableToken,
      tokenToPriceFeed,
      priceFeeds
    } = await loadFixture(deployAndSetupProtocol);

    if (priceFeeds.length === 0) {
      console.error('\n 🔴 [!] Not Collaterals added to be whitelisted[!]\n');
      return;
    }

    const priceFeed = await ethers.getContractAt(
      'ChainlinkPriceFeed',
      priceFeeds[0]
    );
    const collateralAddress = await priceFeed.token();
    const amount_collateral = ethers.parseUnits('100', 18);

    await deal(
      collateralAddress,
      await Collateral_Depositor.getAddress(),
      amount_collateral
    );

    const collateral = await ethers.getContractAt('A3A', collateralAddress);
    await collateral
      .connect(Collateral_Depositor)
      .approve(vaultFactory.target, amount_collateral);
    await vaultFactory
      .connect(Collateral_Depositor)
      .addCollateral(vaults[0], collateralAddress, amount_collateral);

    await vaultFactory
      .connect(Collateral_Depositor)
      .addCollateralNative(vaults[0], { value: ethers.parseEther('10') });

    await vaultFactory
      .connect(Collateral_Depositor)
      .removeCollateralNative(
        vaults[0],
        ethers.parseEther('10'),
        await Collateral_Depositor.getAddress()
      );

    const collateralBalance_before = await collateral.balanceOf(
      await Collateral_Depositor.getAddress()
    );

    const vaultContract = await ethers.getContractAt('SmartVault', vaults[0]);

    expect(
      Number(await vaultContract.healthFactor(true)) / 10 ** 18
    ).to.be.greaterThan(100);

    const amountToBorrow = ethers.parseUnits('10', 18);
    await vaultFactory
      .connect(Collateral_Depositor)
      .borrow(
        vaults[0],
        amountToBorrow,
        await Collateral_Depositor.getAddress()
      );

    const collateralPriceFeedData =
      await tokenToPriceFeed.tokens(collateralAddress);
    const feesGenerated =
      ((Number(amountToBorrow) / 10 ** 18) *
        (Number(collateralPriceFeedData.borrowRate) / 10 ** 18)) /
      100;
    const amountToReceiveWithoutFees =
      Number(amountToBorrow) / 10 ** 18 - feesGenerated;

    expect(
      Number(
        await mintableToken.balanceOf(await Collateral_Depositor.getAddress())
      )
    ).to.be.equal(amountToReceiveWithoutFees * 10 ** 18);
    expect(100).to.be.greaterThan(
      Number(await vaultContract.healthFactor(true)) / 10 ** 18
    );

    const totalDebt = await vaultFactory.totalDebt();
    expect(Number(totalDebt)).to.be.equal(Number(amountToBorrow));

    const vaultDebt = await vaultContract.debt();
    expect(Number(vaultDebt) / 10 ** 18).to.be.equal(
      feesGenerated + amountToReceiveWithoutFees
    );

    const amountToWithdraw = ethers.parseUnits('0.001', 18);
    await vaultFactory
      .connect(Collateral_Depositor)
      .removeCollateral(
        vaults[0],
        collateralAddress,
        amountToWithdraw,
        await Collateral_Depositor.getAddress()
      );

    const collateralBalance_after = await collateral.balanceOf(
      await Collateral_Depositor.getAddress()
    );
    expect(Number(collateralBalance_after)).to.be.greaterThan(
      Number(collateralBalance_before)
    );

    await deal(
      mintableToken.target,
      await Collateral_Depositor.getAddress(),
      ethers.parseUnits('1000', 18) + amountToBorrow
    );
    await mintableToken
      .connect(Collateral_Depositor)
      .approve(vaultFactory.target, vaultDebt);
    await vaultFactory
      .connect(Collateral_Depositor)
      .repay(vaults[0], vaultDebt);
    expect(Number(await vaultContract.debt())).to.be.equal(0);
    expect(
      Number(await vaultContract.healthFactor(true)) / 10 ** 18
    ).to.be.greaterThan(1);
  });

  it('Liquidation Dutch Auction - Bid for Auction', async function () {
    const {
      vaultFactory,
      mintableToken,
      Collateral_Depositor2,
      vaults,
      users,
      tokenToPriceFeed,
      ownerProxy,
      collateralManager,
      mockUpCollateralData,
      auctionManager,
      lastResortLiquidation,
      walletsWithPermissions
    } = await loadFixture(deployAndSetupProtocol);

    const { MockConvertedPriceFeeds, MockCollaterals } =
      await createAndDepositMockUpCollaterals(
        mockUpCollateralData,
        users,
        ownerProxy,
        vaultFactory,
        tokenToPriceFeed,
        collateralManager
      );

    const vaultContract = await ethers.getContractAt('SmartVault', vaults[0]);
    expect(
      Number(await vaultContract.healthFactor(true)) / 10 ** 18
    ).to.be.greaterThan(100);

    const amountToBorrow = '40000';
    await vaultFactory
      .connect(users[0].user)
      .borrow(vaults[0], amountToBorrow, await users[0].user.getAddress());
    expect(
      Number(await vaultContract.healthFactor(true)) / 10 ** 18
    ).to.be.greaterThan(1);

    await expect(vaultFactory.liquidate(vaults[0])).to.be.rejected;

    const vaultDebtBefore = await vaultContract.debt();
    expect(vaultDebtBefore).to.be.equal(amountToBorrow);

    // * Remove collateral to see how it behaves when liquidating a vault that before had a collateral
    // A third user is permitted to deposit into a vault not belonging to them.
    await MockCollaterals[1]
      .connect(users[1].user)
      .approve(vaultFactory.target, users[1].amountsToDeposit[0]);
    await vaultFactory
      .connect(users[1].user)
      .addCollateral(
        vaults[0],
        mockUpCollateralData[1].address,
        users[1].amountsToDeposit[0]
      );

    await vaultFactory
      .connect(users[0].user)
      .removeCollateral(
        vaults[0],
        mockUpCollateralData[1].address,
        users[1].amountsToDeposit[0],
        await users[0].user.getAddress()
      );

    // * Decrease price and Liquidation happens
    await MockConvertedPriceFeeds[0].updatePrice('4');

    expect(
      Number(ethers.formatEther(await vaultContract.healthFactor(true)))
    ).to.be.lt(1);
    const collateralBalanceBefore = await MockCollaterals[0].balanceOf(
      vaults[0]
    );
    await vaultFactory.liquidate(vaults[0]);

    const vaultDebtAfter = await vaultContract.debt();
    expect(vaultDebtAfter).to.be.equal(0);

    const collateralBalanceAfter = await MockCollaterals[0].balanceOf(
      vaults[0]
    );
    expect(collateralBalanceBefore).to.be.greaterThan(collateralBalanceAfter);

    expect(await auctionManager.auctionsLength()).to.be.equal(1);

    const auctionData = await auctionManager.auctionInfo(0);

    const fAuctionData: Auction = {
      originalDebt: auctionData[0],
      lowestDebtToAuction: auctionData[1],
      highestDebtToAuction: auctionData[2],
      collateralsLength: Number(auctionData[3]),
      collateral: auctionData[4],
      collateralAmount: auctionData[5],
      collateralValue: await auctionManager.getTotalCollateralValue(0),
      auctionStartTime: Number(auctionData[6]),
      auctionEndTime: Number(auctionData[7]),
      auctionEnded: auctionData[8],
      txHashes: []
    };

    const balanceResortContract_before = await MockCollaterals[0].balanceOf(
      lastResortLiquidation.target
    );

    // * Bid for Auction
    await deal(
      mintableToken.target,
      await Collateral_Depositor2.getAddress(),
      fAuctionData.highestDebtToAuction
    );

    await mintableToken
      .connect(Collateral_Depositor2)
      .approve(auctionManager.target, fAuctionData.highestDebtToAuction);

    const bidderBalance_before = await MockCollaterals[0].balanceOf(
      Collateral_Depositor2.getAddress()
    );
    const mintableBalance = await mintableToken.balanceOf(
      Collateral_Depositor2.getAddress()
    );
    await auctionManager.connect(Collateral_Depositor2).bid(0);

    const balanceResortContract_after = await MockCollaterals[0].balanceOf(
      lastResortLiquidation.target
    );
    const bidderBalance_after = await MockCollaterals[0].balanceOf(
      Collateral_Depositor2
    );
    expect(balanceResortContract_after).to.be.equal(
      balanceResortContract_before
    );
    expect(bidderBalance_after).to.be.greaterThan(bidderBalance_before);

    // *Check that auction is finished and can´t be accessed
    const auctionData_after = await auctionManager.auctionInfo(0);
    const fAuctionData_after: Auction = {
      originalDebt: auctionData_after[0],
      lowestDebtToAuction: auctionData_after[1],
      highestDebtToAuction: auctionData_after[2],
      collateralsLength: Number(auctionData_after[3]),
      collateral: auctionData_after[4],
      collateralAmount: auctionData_after[5],
      collateralValue: await auctionManager.getTotalCollateralValue(0),
      auctionStartTime: Number(auctionData_after[6]),
      auctionEndTime: Number(auctionData_after[7]),
      auctionEnded: auctionData_after[8],
      txHashes: []
    };

    expect(fAuctionData_after.auctionEnded).to.be.equal(true);
    await expect(
      auctionManager.connect(Collateral_Depositor2).bid(0)
    ).to.be.rejectedWith('auction-ended');
  });

  it('Last Resort Liquidation - Repay bad debt', async function () {
    const {
      vaultFactory,
      mintableToken,
      Collateral_Depositor,
      Collateral_Depositor2,
      vaults,
      users,
      tokenToPriceFeed,
      ownerProxy,
      collateralManager,
      mockUpCollateralData,
      auctionManager,
      lastResortLiquidation,
      walletsWithPermissions
    } = await loadFixture(deployAndSetupProtocol);

    const { MockConvertedPriceFeeds, MockCollaterals } =
      await createAndDepositMockUpCollaterals(
        mockUpCollateralData,
        users,
        ownerProxy,
        vaultFactory,
        tokenToPriceFeed,
        collateralManager
      );

    const vaultContract = await ethers.getContractAt('SmartVault', vaults[0]);
    expect(
      Number(await vaultContract.healthFactor(true)) / 10 ** 18
    ).to.be.greaterThan(100);

    const amountToBorrow = '40000';
    await vaultFactory
      .connect(users[0].user)
      .borrow(vaults[0], amountToBorrow, await users[0].user.getAddress());
    expect(
      Number(await vaultContract.healthFactor(true)) / 10 ** 18
    ).to.be.greaterThan(1);

    await expect(vaultFactory.liquidate(vaults[0])).to.be.rejected;

    const vaultDebtBefore = await vaultContract.debt();
    expect(vaultDebtBefore).to.be.equal(amountToBorrow);

    // * Remove collateral to see how it behaves when liquidating a vault that before had a collateral
    // A third user is permitted to deposit into a vault not belonging to them.
    await MockCollaterals[1]
      .connect(users[1].user)
      .approve(vaultFactory.target, users[1].amountsToDeposit[0]);
    await vaultFactory
      .connect(users[1].user)
      .addCollateral(
        vaults[0],
        mockUpCollateralData[1].address,
        users[1].amountsToDeposit[0]
      );

    await vaultFactory
      .connect(users[0].user)
      .removeCollateral(
        vaults[0],
        mockUpCollateralData[1].address,
        users[1].amountsToDeposit[0],
        await users[0].user.getAddress()
      );

    // * Decrease price and Liquidation happens
    await MockConvertedPriceFeeds[0].updatePrice('4');

    expect(
      Number(ethers.formatEther(await vaultContract.healthFactor(true)))
    ).to.be.lt(1);
    const collateralBalanceBefore = await MockCollaterals[0].balanceOf(
      vaults[0]
    );
    await vaultFactory.liquidate(vaults[0]);

    const vaultDebtAfter = await vaultContract.debt();
    expect(vaultDebtAfter).to.be.equal(0);

    const collateralBalanceAfter = await MockCollaterals[0].balanceOf(
      vaults[0]
    );
    expect(collateralBalanceBefore).to.be.greaterThan(collateralBalanceAfter);

    expect(await auctionManager.auctionsLength()).to.be.equal(1);

    // Mine 2 hours of blocks to move the liquidation to LastResortLiquidation
    const currentTimestamp = await network.provider
      .send('eth_getBlockByNumber', ['latest', false])
      .then((block) => block.timestamp);
    await network.provider.send('evm_mine', [currentTimestamp + 7200]);

    const auctionData = await auctionManager.auctionInfo(0);

    const fAuctionData: Auction = {
      originalDebt: auctionData[0],
      lowestDebtToAuction: auctionData[1],
      highestDebtToAuction: auctionData[2],
      collateralsLength: Number(auctionData[3]),
      collateral: auctionData[4],
      collateralAmount: auctionData[5],
      collateralValue: await auctionManager.getTotalCollateralValue(0),
      auctionStartTime: Number(auctionData[6]),
      auctionEndTime: Number(auctionData[7]),
      auctionEnded: auctionData[8],
      txHashes: []
    };

    const balanceResortContract_before = await MockCollaterals[0].balanceOf(
      lastResortLiquidation.target
    );
    // * This should send the collaterals to the LastResortLiquidation as the Auction is finished and no bids are given
    await auctionManager.bid(0);
    const balanceResortContract_after = await MockCollaterals[0].balanceOf(
      lastResortLiquidation.target
    );
    expect(balanceResortContract_after).to.be.greaterThan(
      balanceResortContract_before
    );

    // Impersonate a wallet
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [walletsWithPermissions.liquidator] // EOA Address for selling collaterals in the Market to repay bad debt
    });

    const LastResortManagerEOA = await ethers.getSigner(
      walletsWithPermissions.liquidator
    );
    await network.provider.send('hardhat_setBalance', [
      LastResortManagerEOA.address,
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    ]);

    const balanceLastResortManagerEOA_before =
      await MockCollaterals[0].balanceOf(
        await LastResortManagerEOA.getAddress()
      );
    const encodedParams = encoder.encode(
      ['address', 'uint256', 'address'],
      [
        MockCollaterals[0].target,
        fAuctionData.collateralAmount[0],
        await LastResortManagerEOA.getAddress()
      ]
    );

    await ownerProxy
      .connect(LastResortManagerEOA)
      .execute(
        lastResortLiquidation.target,
        'withdrawCollateral(address,uint256,address)',
        encodedParams
      );

    const balanceLastResortManagerEOA_after =
      await MockCollaterals[0].balanceOf(
        await LastResortManagerEOA.getAddress()
      );

    expect(balanceLastResortManagerEOA_after).to.be.greaterThan(
      balanceLastResortManagerEOA_before
    );

    // * Repay babDebt in luUSD (After selling the collateral)
    await deal(
      mintableToken.target,
      await LastResortManagerEOA.getAddress(),
      fAuctionData.originalDebt
    );

    const badDebt_before = await lastResortLiquidation.badDebt();
    await mintableToken
      .connect(LastResortManagerEOA)
      .approve(lastResortLiquidation.target, fAuctionData.originalDebt);

    await lastResortLiquidation
      .connect(LastResortManagerEOA)
      .repayBadDebt(fAuctionData.originalDebt);

    const badDebt_after = await lastResortLiquidation.badDebt();
    expect(badDebt_before).to.be.equal(fAuctionData.originalDebt);
    expect(badDebt_after).to.be.equal(0);
  });
}).timeout(10000000);

async function createAndDepositMockUpCollaterals(
  mockUpCollateralData: any,
  users: any,
  ownerProxy: any,
  vaultFactory: any,
  tokenToPriceFeed: any,
  collateralManager: Signer
) {
  const MockConvertedPriceFeeds: any[] = [];
  const MockCollaterals: any[] = [];

  await Promise.all(
    mockUpCollateralData.map(async (collateralData: any, index: number) => {
      const MockConvertedPriceFeed = await ethers.getContractFactory(
        'MockConvertedPriceFeedV2'
      );
      const mockConvertedPriceFeed = await MockConvertedPriceFeed.deploy(
        collateralData.address,
        collateralData.fakePrice
      );
      await mockConvertedPriceFeed.waitForDeployment();
      MockConvertedPriceFeeds[index] = mockConvertedPriceFeed; // Store at the correct index

      const setCollateralCap = await ownerProxy
        .connect(collateralManager)
        .execute(
          vaultFactory.target,
          'setCollateralCapacity(address,uint256)',
          encoder.encode(
            ['address', 'uint256'],
            [collateralData.address, collateralData.collateralCap]
          )
        );
      await setCollateralCap.wait();

      const setTokenPriceFeed = await ownerProxy
        .connect(collateralManager)
        .execute(
          tokenToPriceFeed.target,
          'setTokenPriceFeed(address,address,uint256,uint256,uint256,uint256)',
          encoder.encode(
            ['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
            [
              collateralData.address,
              mockConvertedPriceFeed.target,
              collateralData.mcr,
              collateralData.mlr,
              collateralData.variableFee,
              collateralData.decimals
            ]
          )
        );
      await setTokenPriceFeed.wait();

      const collateral = await ethers.getContractAt(
        'ERC20',
        collateralData.address
      );
      MockCollaterals[index] = collateral; // Store at the correct index

      for (let i = 0; i < users.length; i++) {
        const collateralIndex = users[i].collaterals.findIndex(
          (c: string) =>
            c.toUpperCase() === collateralData.address.toUpperCase()
        );
        if (collateralIndex !== -1) {
          await deal(
            collateralData.address,
            await users[i].user.getAddress(),
            users[i].amountsToDeal[collateralIndex]
          );

          await collateral
            .connect(users[i].user)
            .approve(
              vaultFactory.target,
              users[i].amountsToDeal[collateralIndex]
            );

          await vaultFactory
            .connect(users[i].user)
            .addCollateral(
              users[i].vaultAddress,
              collateral.target,
              users[i].amountsToDeposit[collateralIndex]
            );
        }
      }
    })
  );

  return { MockConvertedPriceFeeds, MockCollaterals };
}

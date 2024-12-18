import { ownerProxy } from './../../scripts/deployments/contracts/ownerProxy';
import { getChainConfig } from '../../configs/chainConfig';
import hre, { ethers, ignition } from 'hardhat';
import {
  A3A,
  A3AStaking,
  LiquidationRouter,
  MintableToken,
  OwnerProxy,
  StabilityPool,
  TokenToPriceFeed,
  VaultExtraSettings,
  VaultFactory,
  VaultFactoryHelper,
  VaultFactoryZapper
} from '../../typechain-types';

export type ProtocolFixture = {
  tokenToPriceFeed: TokenToPriceFeed;
  vaultFactory: VaultFactory;
  stabilityPool: StabilityPool;
  mintableToken: MintableToken;
  stakingPool: A3AStaking;
  liquidationRouter: LiquidationRouter;
  governanceToken: A3A;
  vaultFactoryHelper: VaultFactoryHelper;
  vaultFactoryZapper: VaultFactoryZapper;
  vaultExtraSettings: VaultExtraSettings;
  ownerProxy: OwnerProxy;
};
export default async function protocolFixture(chain?: string) {
  if (!chain) {
    chain = process.env.DEFAULT_NETWORK || 'lumiaMainnet';
  }
  const { collaterals, addresses } = getChainConfig(chain);
  const tokenToPriceFeed = (await ethers.getContractAt(
    'TokenToPriceFeed',
    addresses.tokenToPriceFeed
  )) as TokenToPriceFeed;
  const vaultFactory = (await ethers.getContractAt(
    'VaultFactory',
    addresses.vaultFactory
  )) as VaultFactory;
  const stabilityPool = (await ethers.getContractAt(
    'StabilityPool',
    addresses.stabilityPool
  )) as StabilityPool;
  const mintableToken = (await ethers.getContractAt(
    'MintableToken',
    addresses.mintableToken
  )) as MintableToken;
  const stakingPool = (await ethers.getContractAt(
    'A3AStaking',
    addresses.a3aStaking
  )) as A3AStaking;
  const liquidationRouter = (await ethers.getContractAt(
    'LiquidationRouter',
    addresses.liquidationRouter
  )) as LiquidationRouter;
  const governanceToken = (await ethers.getContractAt(
    'A3A',
    addresses.governanceToken
  )) as A3A;
  const vaultFactoryHelper = (await ethers.getContractAt(
    'VaultFactoryHelper',
    addresses.vaultFactoryHelper
  )) as VaultFactoryHelper;
  const vaultFactoryZapper = (await ethers.getContractAt(
    'VaultFactoryZapper',
    addresses.vaultFactoryZapper
  )) as VaultFactoryZapper;
  const vaultExtraSettings = (await ethers.getContractAt(
    'VaultExtraSettings',
    addresses.vaultExtraSettings
  )) as VaultExtraSettings;
  const ownerProxy = (await ethers.getContractAt(
    'OwnerProxy',
    addresses.ownerProxy
  )) as OwnerProxy;

  return {
    tokenToPriceFeed,
    vaultFactory,
    stabilityPool,
    mintableToken,
    stakingPool,
    liquidationRouter,
    governanceToken,
    vaultFactoryHelper,
    vaultFactoryZapper,
    vaultExtraSettings,
    ownerProxy
  } as ProtocolFixture;
}

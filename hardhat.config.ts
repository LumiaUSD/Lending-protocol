import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ignition-ethers';
import '@nomicfoundation/hardhat-verify';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-deal';
import 'hardhat-tracer';
import 'dotenv/config';
import 'hardhat-deal';

const DEFAULT_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // HH default private key

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      },
      {
        version: '0.8.23',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      },
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      },
      {
        version: '0.8.25',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      }
    ]
  },
  etherscan: {
    apiKey: {
      lumiaMainnet: process.env.LUMIA_MAINNET_ETHERSCAN_API_KEY || ''
    },
    customChains: [
      {
        network: 'lumiaMainnet',
        chainId: 994873017,
        urls: {
          apiURL: 'https://explorer.lumia.org/api',
          browserURL: 'https://explorer.lumia.org'
        }
      }
    ]
  },
  ignition: {
    blockPollingInterval: 3_000,
    timeBeforeBumpingFees: 30 * 1_000,
    maxFeeBumps: 30,
    requiredConfirmations: 5
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: {
        url:
          process.env.LUMIA_MAINNET_RPC_URL || 'https://mainnet-rpc.lumia.org',
        enabled: true
      },
      mining: {
        auto: true,
        interval: 0
      }
    },
    lumiaMainnet: {
      chainId: 994873017,
      url: process.env.LUMIA_MAINNET_RPC_URL || 'https://mainnet-rpc.lumia.org',
      accounts: [
        process.env.PRIVATE_KEY || DEFAULT_PRIVATE_KEY,
        process.env.PRIVATE_KEY_COLLATERAL_MANAGER!
      ],
      gas: 2100000,
      gasPrice: 8000000000
    }
  }
};

export default config;

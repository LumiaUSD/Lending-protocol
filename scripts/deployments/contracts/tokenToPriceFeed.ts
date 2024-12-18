import { ethers } from 'hardhat';
import { verify } from '../../utils/verifyContract';

// * Retry added because it fails sometimes in RedBelly Testnet. After second try it works
export const tokenToPriceFeed = async () => {
  let attempts = 0;
  const maxAttempts = 3;
  let tokenToPriceFeed;

  while (attempts < maxAttempts) {
    try {
      const TokenToPriceFeed =
        await ethers.getContractFactory('TokenToPriceFeed');

      tokenToPriceFeed = await TokenToPriceFeed.deploy();
      await tokenToPriceFeed.waitForDeployment();

      await verify(tokenToPriceFeed.target.toString(), []);

      return tokenToPriceFeed;
    } catch (error) {
      console.error(
        `Attempt ${attempts + 1} failed: Error deploying TokenToPriceFeed contract:`,
        error
      );
      attempts++;
      if (attempts === maxAttempts) {
        throw error;
      }
    }
  }
};

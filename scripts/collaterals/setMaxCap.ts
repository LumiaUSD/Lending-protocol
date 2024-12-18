import { ethers, network } from 'hardhat';
import configLumia from '../../configs/collaterals/lumia';
import addressesLumia from '../../configs/addresses/lumia.json';

//* Update Max Capacity for a specific Collateral in Vault Factory.
async function setMaxCap(
  chainName: string,
  isTestnet: boolean,
  collateralAddress: string,
  newCollateralCap: string
) {
  console.log('Chain:', chainName);
  let config;
  let addresses;

  let fNewCollateralCap = ethers.parseEther(newCollateralCap);

  if (chainName == 'lumiaMainnet') {
    addresses = addressesLumia;
    config = configLumia;
  } else {
    throw new Error('invalid chain');
  }

  let collateralManager;
  if (!isTestnet) {
    [collateralManager] = await ethers.getSigners();
  } else {
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [addresses.collateralManager]
    });
    collateralManager = await ethers.getSigner(addresses.collateralManager);
  }

  const ownerProxy = await ethers.getContractAt(
    'OwnerProxy',
    addresses.ownerProxy,
    collateralManager
  );

  console.log(`[!] Updating MaxCapacity in Vault Factory`);
  // Set token collateral Capacity
  const encoder = ethers.AbiCoder.defaultAbiCoder();
  const types = ['address', 'uint256'];
  const encodedParams = encoder.encode(types, [
    collateralAddress,
    fNewCollateralCap
  ]);
  const setCollateralCap = await ownerProxy
    .connect(collateralManager)
    .execute(
      addresses.vaultFactory,
      'setCollateralCapacity(address,uint256)',
      encodedParams
    );

  if (!isTestnet) await setCollateralCap.wait(1);

  console.log('-----------------------------------');
  return;
}

const isTestnet = true; //* Toggle to test before deployment
const chainName = 'lumiaMainnet';
const collateralAddress = '';
const newCollateralCap = '5000000';
// setMaxCap(chainName, isTestnet, collateralAddress, newCollateralCap);

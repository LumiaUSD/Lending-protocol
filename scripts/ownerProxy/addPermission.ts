import { ethers, network } from 'hardhat';
import addressesLumiaMainnet from '../../configs/addresses/lumia.json';

export const addPermission = async (
  caller: string,
  target: string,
  targetSignature: string,
  chainName: string,
  isTestnet: boolean
) => {
  console.log('Chain:', chainName);
  let addresses;

  if (chainName == 'lumiaMainnet') {
    addresses = addressesLumiaMainnet;
  } else {
    throw new Error('invalid chain');
  }

  let owner;
  if (!isTestnet) {
    [owner] = await ethers.getSigners();
  } else {
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [addresses.owner]
    });
    owner = await ethers.getSigner(addresses.owner);
  }

  const proxyOwner = await ethers.getContractAt(
    'OwnerProxy',
    addresses.ownerProxy,
    owner
  );

  const newPermission = await proxyOwner.addPermission(
    caller,
    target,
    targetSignature
  );
  await newPermission.wait();

  console.log(
    `\n[!] Permission ${targetSignature} added for ${caller} on the contract ${target} \n`
  );
  return;
};

const ownerProxyPermissions = {
  method: {
    name: 'setTokenPriceFeed(address,address,uint256,uint256,uint256,uint256)',
    signature: '0xbb991f11'
  },
  address: {
    lumiaMainnet: addressesLumiaMainnet.tokenToPriceFeed
  }
};

const caller = '';

const isTestnet = true; //* Toggle to test before deployment
const chainName = 'lumiaMainnet';
// addPermission(
//   caller,
//   ownerProxyPermissions.address[chainName], //* Update the contract target
//   ownerProxyPermissions.method.signature, //* Update the signature
//   chainName,
//   isTestnet
// );

import { ethers } from 'hardhat';

// * Method to mint - This will only work in chains where an EOA is set to mint. (eg. RedBelly Testnet)
async function getPermissionAndMintStable(
  receiverAddress: string,
  amount: string
) {
  const [owner] = await ethers.getSigners();
  const encoder = ethers.AbiCoder.defaultAbiCoder();
  console.log({ owner: await owner.getAddress() });
  const mintableTokenOwner = await ethers.getContractAt(
    'MintableTokenOwner',
    '0x2a8D0423ad4C1276F501FcFc5EAd983a043021D2'
  );
  const ownerProxy = await ethers.getContractAt(
    'OwnerProxy',
    '0xcC83F222d791FE8A9b989070A6fA837a7fd12C18'
  );

  //   ! This part is not needed as permission is already given. But good to keep for future needs
  //   const tx = await ownerProxy
  //     .connect(owner)
  //     .addPermission(
  //       await owner.getAddress(),
  //       '0x2a8d0423ad4c1276f501fcfc5ead983a043021d2',
  //       '0x983b2d56'
  //     );

  //   await tx.wait();

  //   const types = ['address'];
  //   const encodedParams = encoder.encode(types, [ownerProxy.target]);
  //   const addMinter = await ownerProxy
  //     .connect(owner)
  //     .execute(mintableTokenOwner.target, 'addMinter(address)', encodedParams);
  //   await addMinter.wait();

  //   const tx2 = await ownerProxy
  //     .connect(owner)
  //     .addPermission(
  //       await owner.getAddress(),
  //       '0x2a8d0423ad4c1276f501fcfc5ead983a043021d2',
  //       '0x40c10f19'
  //     );

  //   await tx2.wait();

  const fMintingAmount = Number(amount) * 10 ** 18;
  const types2 = ['address', 'uint256'];
  const encodedParams2 = encoder.encode(types2, [
    receiverAddress,
    BigInt(fMintingAmount)
  ]);
  const mintTokens = await ownerProxy
    .connect(owner)
    .execute(
      mintableTokenOwner.target,
      'mint(address,uint256)',
      encodedParams2
    );
  await mintTokens.wait();
}

// RedBelly!
const ReceiverWallet = '0x33A27AF3595dc2431065571Ac23Bb5F5aA4B7D23';
const amount = '100000';
// getPermissionAndMintStable(ReceiverWallet, amount);

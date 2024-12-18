import { ethers } from 'hardhat';
import { BaseContract } from 'ethers';
import { verify } from '../../utils/verifyContract';

export const mintableTokenOwner = async (mintableToken: BaseContract) => {
  const MintableTokenOwner =
    await ethers.getContractFactory('MintableTokenOwner');
  const mintableTokenOwner = await MintableTokenOwner.deploy(
    await mintableToken.getAddress()
  );
  await mintableTokenOwner.waitForDeployment();

  await verify(await mintableTokenOwner.getAddress(), [
    await mintableToken.getAddress()
  ]);

  // @ts-ignore
  const tx = await mintableToken.transferOwnership(
    await mintableTokenOwner.getAddress()
  );
  await tx.wait();
  console.log(
    '[!] MintableToken ownership transferred to mintableTokenOwner Contract'
  );
  return mintableTokenOwner;
};

import { ethers } from 'ethers';

// Encode the parameters and compute the hash
export async function getEncodedData(types: string[], params: string[]) {
  const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(types, params);

  console.log('encodedParams:', encodedParams);
  return encodedParams;
}

getEncodedData(
  ['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
  [
    '0x36B77a184bE8ee56f5E81C56727B20647A42e28E', // token address
    '0xD78fF234A0d5ddea664f4478D72B621715EF03E5', // price feed address  
    '175', // min price
    '130', // max price
    '9990000000000000000', // heartbeat
    '18' // max deviation
  ]
);

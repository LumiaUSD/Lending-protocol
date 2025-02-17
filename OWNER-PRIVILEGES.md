# Owner Privileges Documentation

This document outlines all methods that require owner privileges across the system contracts. Understanding these methods is crucial for managing system operations and security.

## AuctionManager

Owner can configure core auction parameters:

### Configuration Methods

- `setVaultFactory(address _vaultFactory)`: Updates the vault factory address
- `setAuctionDuration(uint256 _auctionDuration)`: Sets the duration for auctions
- `setLowestHF(uint256 _lowestHF)`: Sets the lowest acceptable health factor

## LastResortLiquidation

Manages collateral and bad debt distribution:

### Access Control

- `addAllowed(address _allowed)`: Adds an address to the allowed operators list
- `removeAllowed(address _allowed)`: Removes an address from the allowed operators list

### Collateral Management

- `withdrawCollateral(address _collateral, uint256 _amount, address _to)`: Withdraws collateral to specified address
- `distributeBadDebt(address _vault, uint256 _amount)`: Distributes bad debt to a specific vault

## TokenToPriceFeed

Controls price feed configurations:

### Price Feed Management

- `setTokenPriceFeed(address _token, address _priceFeed, uint256 _mcr, uint256 _mlr, uint256 _borrowRate, uint256 _decimals)`:
  - Sets or updates price feed parameters for a token
  - Controls Minimal Collateral Ratio (MCR)
  - Sets Minimal Liquidation Ratio (MLR)
  - Defines borrowing rates
- `transferOwnership(address newOwner)`: Transfers ownership of the contract

## VaultFactory

Core configuration of the vault system:

### System Parameters

- `setMaxTokensPerVault(uint256 _maxTokensPerVault)`: Maximum tokens allowed per vault
- `setPriceFeed(address _priceFeed)`: Updates the price feed contract address
- `setRedemptionRate(uint256 _redemptionRate)`: Sets the redemption fee rate
- `setBorrowRate(address _borrowRate)`: Sets the contract address for calculating borrow rates
- `setRedemptionHealthFactorLimit(uint256 _redemptionHealthFactorLimit)`: Sets minimum health factor for redemptions
- `setBorrowFeeRecipient(address _borrowFeeRecipient)`: Sets address receiving borrowing fees
- `setRedemptionFeeRecipient(address _redemptionFeeRecipient)`: Sets address receiving redemption fees
- `setDebtCeiling(uint256 _debtCeiling)`: Sets maximum total debt allowed in the system
- `setMaxDebtPerWindow(uint256 _maxDebtPerWindow)`: Sets maximum debt that can be taken in a time window
- `setDebtWindowSize(uint256 _debtWindowSize)`: Sets the size of the time window for debt limits
- `setCollateralCapacity(address _collateral, uint256 _capacity)`: Sets maximum amount of a specific collateral type
- `setLiquidationRouter(address _liquidationRouter)`: Updates the liquidation router address
- `setVaultDeployer(address _vaultDeployer)`: Sets the contract responsible for deploying new vaults

## VaultExtraSettings

Controls additional vault parameters:

### Vault Parameters

- `setMaxRedeemablePercentage(uint256 _debtTreshold, uint256 _maxRedeemablePercentage)`: Sets maximum redeemable percentage and debt threshold
- `setRedemptionKickback(uint256 _redemptionKickback)`: Sets redemption fee kickback rate

## SmartVaultProxy

Manages permissions for smart vault operations:

### Permission Management

- `addPermission(address targetAddress, bytes4 targetSignature)`: Whitelists method calls
- `removePermission(address targetAddress, bytes4 targetSignature)`: Removes whitelisted methods
- `setRewardFee(uint16 _newRewardFee)`: Sets reward fee percentage
- `setRewardCollector(address newRewardCollector)`: Updates reward collector address
- `transferOwnership(address newOwner)`: Transfers ownership of the contract

## OwnerProxy

Manages fine-grained permissions:

### Permission Control

- `addPermission(address caller, address targetAddress, bytes4 targetSignature)`: Grants specific call permissions
- `removePermission(uint256 permissionHash)`: Revokes specific permissions
- `executeOwner(address target, string memory func, bytes memory data)`: Executes privileged calls

## MintableTokenOwner

Controls token minting privileges:

### Token Management

- `transferTokenOwnership(address _newOwner)`: Transfers token ownership
- `addMinter(address _newMinter)`: Adds new minting privileges
- `revokeMinter(address _minter)`: Revokes minting privileges

## FeeRecipientManager

Manages fee distribution:

### Fee Management

- `claimRewards(address[] tokenFrom, address[] tokenTo, bool[] stable, uint256 amountOutMin)`: Claims and swaps rewards
- `forceWithdraw(address[] tokenFrom, address to)`: Emergency withdrawal of tokens
- `setfeeReceiver(address _feeReceiver)`: Updates fee receiver address
- `setRouter(address _router)`: Updates the router contract address used for swaps

## StabilityPool

### Configuration

- `setVaultFactory(address _vaultFactory)`: Updates the vault factory address
- `setA3AToken(address _a3aToken)`: Sets the A3A token address

## veA3AStaking

### Slashing Configuration

- `setSlashingDuration(uint256 _round, uint256 _duration)`: Sets duration for a slashing round
- `setSlashingRate(uint256 _round, uint256 _rate)`: Sets rate for a slashing round
- `setSlashingReturnForStabilityPool(uint256 _slashingReturnForStabilityPool)`: Sets percentage of slashed tokens returned to stability pool
- `setStabilityPool(address _stabilityPool)`: Sets the stability pool address
- `setVaultFactory(address _vaultFactory)`: Updates the vault factory address
- `setFactory(address _factory)`: Sets the factory contract address
- `setStable(address _stable)`: Sets the stable token address
- `setA3aToken(address _a3aToken)`: Sets the A3A token address

## LiquidationRouter

### Configuration

- `setVaultFactory(address _vaultFactory)`: Updates the vault factory address
- `setStabilityPool(address _stabilityPool)`: Sets the stability pool address
- `setAuctionManager(address _auctionManager)`: Sets the auction manager address
- `setLastResortLiquidation(address _lastResortLiquidation)`: Sets the last resort liquidation address

## Critical Considerations

1. **Ownership Transfer**

   - Most contracts inherit from OpenZeppelin's `Ownable`
   - Use `transferOwnership()` carefully as it transfers all privileges
   - Consider using multi-sig wallets for ownership
   - Every contract that inherits from Ownable includes a `transferOwnership(address newOwner)` method
   - This method should be used with extreme caution as it transfers complete control of the contract

## Understanding OwnerProxy

The OwnerProxy contract provides a way to delegate specific contract method permissions to different addresses. This allows for fine-grained access control beyond simple ownership.

### How to Grant Permissions

1. **Adding Permissions** (Owner only)

   ```solidity
   function addPermission(
       address caller,        // The address being granted permission
       address targetAddress, // The contract address containing the method
       bytes4 targetSignature // The method signature to allow
   )
   ```

   Example:

   ```typescript
   // To allow an address to call setMaxTokensPerVault on VaultFactory:
   const methodSignature = 'setMaxTokensPerVault(uint256)';
   const encodedSignature = ethers.utils.id(methodSignature).slice(0, 10); // Get first 4 bytes
   await ownerProxy.addPermission(
     operatorAddress,
     vaultFactoryAddress,
     encodedSignature
   );
   ```

2. **Revoking Permissions** (Owner only)
   ```solidity
   function removePermission(uint256 permissionHash)
   ```

### Executing Methods

1. **For Whitelisted Operators**

   ```solidity
   function execute(
       address target,      // Contract address
       string memory func,  // Function name with signature
       bytes memory data    // Encoded parameters
   )
   ```

   Example:

   ```typescript
   // To call setMaxTokensPerVault(5):
   const data = ethers.utils.defaultAbiCoder.encode(['uint256'], [5]);
   await ownerProxy.execute(
     vaultFactoryAddress,
     'setMaxTokensPerVault(uint256)',
     data
   );
   ```

2. **For Owner Only**
   ```solidity
   function executeOwner(
       address target,
       string memory func,
       bytes memory data
   )
   ```
   - Only the owner can call this method
   - No permission check is performed
   - Can execute any method on any contract

### Permission Management

- Permissions are stored as hashes combining caller, target, and method signature
- Each permission must be explicitly granted
- Permissions can be revoked individually
- Owner can execute any method without needing explicit permission

### Best Practices

1. **When Granting Permissions**

   - Verify the target contract address carefully
   - Double-check method signatures
   - Test permissions with small operations first

2. **When Executing Methods**

   - Verify encoded parameters before execution
   - Use helper functions to encode data correctly
   - Keep track of granted permissions

3. **Security Considerations**
   - Maintain a list of all granted permissions
   - Regularly audit active permissions
   - Remove unused permissions promptly
   - Consider using timelock for sensitive operations

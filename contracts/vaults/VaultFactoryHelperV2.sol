// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.4;

import '../interfaces/IVaultFactory.sol';
import '../interfaces/IVault.sol';
import '../interfaces/ITokenPriceFeed.sol';

/**
 * @title VaultFactoryHelperV2
 * @notice Helper contract providing various functions to retrieve information about vaults in a vault factory
 */
contract VaultFactoryHelperV2 {
    uint256 public constant DECIMAL_PRECISION = 1e18;

    /**
     * @notice Retrieves vault addresses from the factory within a specified range
     * @param _vaultFactory Address of the vault factory
     * @param startIndex The index to start retrieving vault addresses
     * @param endIndex The index to stop retrieving vault addresses (exclusive)
     * @return An array of vault addresses within the specified range
     */
    function getVaultsChunk(
        address _vaultFactory,
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        IVaultFactory vaultFactory = IVaultFactory(_vaultFactory);
        uint256 vaultCount = vaultFactory.vaultCount();

        require(
            endIndex > startIndex,
            'End index must be greater than start index.'
        );
        require(startIndex < vaultCount, 'Start index out of range.');

        // Adjust the endIndex if it exceeds the total number of vaults
        if (endIndex > vaultCount) {
            endIndex = vaultCount;
        }

        uint256 count = endIndex - startIndex;
        address[] memory vaults = new address[](count);

        // Get the first vault
        address currentVault = vaultFactory.firstVault();

        // If startIndex is greater than 0, navigate to the starting vault
        for (uint256 i = 0; i < startIndex; i++) {
            currentVault = vaultFactory.nextVault(currentVault);
        }

        // Fetch vaults from startIndex to endIndex
        for (uint256 i = 0; i < count; i++) {
            vaults[i] = currentVault;
            currentVault = vaultFactory.nextVault(currentVault);
        }

        return vaults;
    }

    /**
     * @notice Retrieves all vault addresses within a vault factory
     * @param _vaultFactory Address of the vault factory
     * @return An array of vault addresses
     */
    function getAllVaults(
        address _vaultFactory
    ) public view returns (address[] memory) {
        IVaultFactory vaultFactory = IVaultFactory(_vaultFactory);
        uint256 vaultCount = vaultFactory.vaultCount();
        if (vaultCount == 0) {
            return new address[](0);
        } else {
            address[] memory vaults = new address[](vaultCount);
            vaults[0] = vaultFactory.firstVault();
            for (uint256 i = 1; i < vaultCount; i++) {
                vaults[i] = vaultFactory.nextVault(vaults[i - 1]);
            }
            return vaults;
        }
    }

    /**
     * @notice Retrieves the Total Value Locked (TVL) of a specific vault based on a single collateral type
     * @param _vaultAddress Address of the vault
     * @param _collateralAddress Address of the collateral asset
     * @return The TVL of the vault for the given collateral
     */
    function getVaultTvlByCollateral(
        address _vaultAddress,
        address _collateralAddress
    ) public view returns (uint256) {
        IVault _vault = IVault(_vaultAddress);
        uint256 _collateralAmount = _vault.collateral(_collateralAddress);
        ITokenPriceFeed _priceFeed = ITokenPriceFeed(
            IVaultFactory(_vault.factory()).priceFeed()
        );
        uint256 _price = _priceFeed.tokenPrice(_collateralAddress);
        uint256 _normalizedCollateralAmount = _collateralAmount *
            (10 ** (18 - _priceFeed.decimals(_collateralAddress)));
        uint256 _tvl = (_normalizedCollateralAmount * _price) /
            DECIMAL_PRECISION;
        return _tvl;
    }

    /**
     * @notice Retrieves the Total Value Locked (TVL) of a vault across all collateral types it holds
     * @param _vault Address of the vault
     * @return The total TVL of the vault across all collateral types
     */
    function getVaultTvl(address _vault) public view returns (uint256) {
        IVault vault = IVault(_vault);
        uint256 tvl = 0;
        for (uint256 i = 0; i < vault.collateralsLength(); i++) {
            address _collateralAddress = vault.collateralAt(i);
            tvl += getVaultTvlByCollateral(_vault, _collateralAddress);
        }
        return tvl;
    }

    /**
     * @notice Retrieves an array of liquidatable vault addresses within a vault factory in chunks
     * @param _vaultFactory Address of the vault factory
     * @param _startIndex Start index of the chunk
     * @param _endIndex End index of the chunk
     * @return An array of liquidatable vault addresses within the specified range
     */
    function getLiquidatableVaultsChunk(
        address _vaultFactory,
        uint256 _startIndex,
        uint256 _endIndex
    ) external view returns (address[] memory) {
        address[] memory vaults = getVaultsChunk(
            _vaultFactory,
            _startIndex,
            _endIndex
        );
        uint256 chunkSize = vaults.length;
        address[] memory liquidatableVaults = new address[](chunkSize);
        uint256 liquidatableVaultCount = 0;

        IVaultFactory vaultFactory = IVaultFactory(_vaultFactory);
        for (uint256 i = 0; i < chunkSize; i++) {
            IVault _vault = IVault(vaults[i]);
            if (vaultFactory.isLiquidatable(address(_vault))) {
                liquidatableVaults[liquidatableVaultCount] = address(_vault);
                liquidatableVaultCount++;
            }
        }

        // Resize the array to the actual number of liquidatable vaults found
        assembly {
            mstore(liquidatableVaults, liquidatableVaultCount)
        }

        return liquidatableVaults;
    }

    /**
     * @notice Retrieves an array of redeemable vault addresses and their corresponding redeemable collaterals in chunks
     * @param _vaultFactory Address of the vault factory
     * @param _useMlr Boolean indicating whether to use MLR for health factor calculation
     * @param _startIndex Start index of the chunk
     * @param _endIndex End index of the chunk
     * @return redeemableVaults An array of redeemable vault addresses within the specified range
     * @return redeemableCollaterals An array of corresponding redeemable collateral addresses
     */
    function getRedeemableVaultsChunk(
        address _vaultFactory,
        bool _useMlr,
        uint256 _startIndex,
        uint256 _endIndex
    )
        external
        view
        returns (
            address[] memory redeemableVaults,
            address[] memory redeemableCollaterals
        )
    {
        address[] memory vaults = getVaultsChunk(
            _vaultFactory,
            _startIndex,
            _endIndex
        );
        uint256 chunkSize = vaults.length;
        redeemableVaults = new address[](chunkSize);
        redeemableCollaterals = new address[](chunkSize);
        uint256 redeemableVaultCount = 0;

        IVaultFactory vaultFactory = IVaultFactory(_vaultFactory);
        uint256 healthFactorLimit = vaultFactory.redemptionHealthFactorLimit();

        for (uint256 i = 0; i < chunkSize; i++) {
            IVault _vault = IVault(vaults[i]);
            if (_vault.healthFactor(_useMlr) < healthFactorLimit) {
                address[] memory _collaterals = getVaultCollaterals(
                    address(_vault)
                );
                for (uint256 j = 0; j < _collaterals.length; j++) {
                    if (
                        vaultFactory.isReedemable(
                            address(_vault),
                            _collaterals[j]
                        )
                    ) {
                        redeemableVaults[redeemableVaultCount] = address(
                            _vault
                        );
                        redeemableCollaterals[
                            redeemableVaultCount
                        ] = _collaterals[j];
                        redeemableVaultCount++;
                        break;
                    }
                }
            }
        }

        // Resize the arrays to the actual number of redeemable vaults found
        assembly {
            mstore(redeemableVaults, redeemableVaultCount)
            mstore(redeemableCollaterals, redeemableVaultCount)
        }

        return (redeemableVaults, redeemableCollaterals);
    }

    /**
     * @notice Retrieves an array of collateral asset addresses held by a specific vault
     * @param _vault Address of the vault
     * @return An array of collateral asset addresses
     */
    function getVaultCollaterals(
        address _vault
    ) public view returns (address[] memory) {
        IVault vault = IVault(_vault);
        uint256 collateralsLength = vault.collateralsLength();
        if (collateralsLength == 0) {
            return new address[](0);
        } else {
            address[] memory collaterals = new address[](collateralsLength);
            for (uint256 i = 0; i < collateralsLength; i++) {
                collaterals[i] = vault.collateralAt(i);
            }
            return collaterals;
        }
    }

    /**
     * @notice Calculates the Total Value Locked (TVL) across a chunk of vaults within a vault factory
     * @param _vaultFactory Address of the vault factory
     * @param _startIndex Start index of the chunk
     * @param _endIndex End index of the chunk
     * @return The total TVL across the vaults in the specified range
     */
    function getProtocolTvlChunk(
        address _vaultFactory,
        uint256 _startIndex,
        uint256 _endIndex
    ) external view returns (uint256) {
        uint256 tvl = 0;
        address[] memory vaults = getVaultsChunk(
            _vaultFactory,
            _startIndex,
            _endIndex
        );
        for (uint256 i = 0; i < vaults.length; i++) {
            tvl += getVaultTvl(vaults[i]);
        }
        return tvl;
    }
}

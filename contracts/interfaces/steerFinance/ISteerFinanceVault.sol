// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.25;

/**
 * @title ISteerFinanceVault
 * @dev Interface for the SteerFinanceVault contract.
 */
interface ISteerFinanceVault {
    /**
     * @dev Get the total amounts of assets in the vault.
     * @return total0 The amount of the first asset.
     * @return total1 The amount of the second asset.
     */
    function getTotalAmounts()
        external
        view
        returns (uint256 total0, uint256 total1);

    /**
     * @dev Get the total supply of the vault.
     * @return The total supply of the vault.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Get the number of decimals used for the vault's assets.
     * @return The number of decimals.
     */
    function decimals() external view returns (uint8);
}

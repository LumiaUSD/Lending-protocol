// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.25;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';
import '../../interfaces/IPriceFeed.sol';
import '../../interfaces/steerFinance/ISteerFinanceVault.sol';
import '../../interfaces/ITokenPriceFeed.sol';
import '../../utils/constants.sol';

/**
 * @title LpSfPriceFeed
 * @dev Retrieves and manages price data from Chainlink's Oracle for each token of the pair and calculates the lp token price by the total amount supplied of each token.
 */
contract LpSfPriceFeed is IPriceFeed, Constants {
    ISteerFinanceVault private immutable LpToken;
    uint24 public immutable updateThreshold = 24 hours;

    TokenInfo[] public tokens;
    OracleInfo[] public oracles;

    struct TokenInfo {
        IERC20Metadata token;
        uint8 decimals;
    }
    struct OracleInfo {
        AggregatorV2V3Interface oracle;
        uint256 precision;
    }

    /**
     * @dev Constructor to initialize the LpSfPriceFeed contract.
     * @param _lpToken Address of the LP token contract.
     * @param _tokens Array of addresses representing the tokens of the pair.
     * @param _oracles Array of addresses representing the Chainlink oracles for each token.
     * Note:
     * - `_tokens` array must contain exactly two valid token addresses.
     * - `_oracles` array must contain exactly two valid oracle addresses.
     */
    constructor(
        address _lpToken,
        address[] memory _tokens,
        address[] memory _oracles
    ) {
        require(_tokens.length == 2, 'two-tokens-are-required');
        require(_oracles.length == 2, 'two-oracles-are-required');
        require(_oracles[0] != address(0), 'invalid-address');
        require(_oracles[1] != address(0), 'invalid-address');
        require(_tokens[0] != address(0), 'invalid-address');
        require(_tokens[1] != address(0), 'invalid-address');
        require(_lpToken != address(0), 'invalid-address');
        LpToken = ISteerFinanceVault(_lpToken);

        for (uint256 i = 0; i < 2; i++) {
            address tokenAddress = _tokens[i];
            IERC20Metadata token_ = IERC20Metadata(tokenAddress);
            uint8 decimalsToken = token_.decimals();
            require(decimalsToken > 0, 'decimalsToken must be greater than 0');
            tokens.push(TokenInfo(token_, decimalsToken));

            AggregatorV2V3Interface oracle = AggregatorV2V3Interface(
                _oracles[i]
            );
            uint8 decimalsOracle = oracle.decimals();
            require(
                decimalsOracle > 0,
                'Decimals for token 0 must be greater than 0'
            );
            uint256 precision = 10 ** decimalsOracle;
            oracles.push(OracleInfo(oracle, precision));
        }
    }

    /**
     * @dev Retrieves the current price from the Chainlink oracle, ensuring it is not outdated.
     * @return The latest recorded price of the associated token.
     */
    //! todo: It should not allow manipulations, it´s checking the price now, and it´s manipulated.
    function price() public view virtual override returns (uint256) {
        (, int256 _price0, , uint256 _timestamp0, ) = oracles[0]
            .oracle
            .latestRoundData();
        (, int256 _price1, , uint256 _timestamp1, ) = oracles[1]
            .oracle
            .latestRoundData();
        require(_price0 > 0, '_price0 must be a positive number');
        require(_price1 > 0, '_price1 must be a positive number');
        require(
            block.timestamp - _timestamp0 <= updateThreshold,
            'price0-outdated'
        );
        require(
            block.timestamp - _timestamp1 <= updateThreshold,
            'price1-outdated'
        );

        uint256 formatedPrice0 = (uint256(_price0) * DECIMAL_PRECISION) /
            oracles[0].precision;
        uint256 formatedPrice1 = (uint256(_price1) * DECIMAL_PRECISION) /
            oracles[1].precision;

        (uint256 total0, uint256 total1) = LpToken.getTotalAmounts();
        uint8 lpDecimals = LpToken.decimals();
        uint256 totalValue0 = formatedPrice0 *
            (total0 * 10 ** (lpDecimals - tokens[0].decimals));
        uint256 totalValue1 = formatedPrice1 *
            (total1 * 10 ** (lpDecimals - tokens[1].decimals));
        uint256 totalValue = (totalValue0 + totalValue1) / DECIMAL_PRECISION;
        uint256 totalValueShifted = totalValue * 10 ** LpToken.decimals();

        uint256 supply = LpToken.totalSupply();

        return totalValueShifted / supply;
    }

    /**
     * @dev Retrieves the current price point.
     * @return The current price of the associated token.
     */
    function pricePoint() public view override returns (uint256) {
        return price();
    }

    /**
     * @dev Emits a price update signal for the associated token.
     */
    function emitPriceSignal() public override {
        emit PriceUpdate(address(LpToken), price(), price());
    }

    /**
     * @dev Retrieves the address of the associated LP token.
     * @return The address of the LP token.
     */
    function token() external view override returns (address) {
        return address(LpToken);
    }
}

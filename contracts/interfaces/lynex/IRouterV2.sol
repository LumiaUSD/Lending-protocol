// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.25;

interface IRouterV2 {
    function swapExactTokensForTokensSimple(
        uint amountIn,
        uint amountOutMin,
        address tokenFrom,
        address tokenTo,
        bool stable,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

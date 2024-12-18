// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.4;

import './ChainlinkPriceFeed.sol';

contract MockConvertedPriceFeedV2 is IPriceFeed, Constants {
    IPriceFeed public immutable priceFeed = IPriceFeed(address(0));
    IPriceFeed public immutable conversionPriceFeed = IPriceFeed(address(0));
    address public immutable override token;
    uint256 public fakePrice;

    constructor(address _token, uint256 _fakePrice) {
        token = _token;
        fakePrice = _fakePrice;
    }

    // ! Don´t use for production, this is a MockConvertedPriceFeed
    function updatePrice(uint256 _newPrice) external {
        fakePrice = _newPrice;
    }

    function price() public view override returns (uint256) {
        return fakePrice;
    }

    function pricePoint() public view override returns (uint256) {
        return price();
    }

    function emitPriceSignal() public {
        emit PriceUpdate(token, price(), price());
    }
}

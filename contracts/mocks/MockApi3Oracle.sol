// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

contract MockApi3Oracle {
    int224 private _value;
    uint32 private _timestamp;

    function setData(int224 value, uint32 timestamp) external {
        _value = value;
        _timestamp = timestamp;
    }

    function read() external view returns (int224 value, uint32 timestamp) {
        return (_value, _timestamp);
    }
} 
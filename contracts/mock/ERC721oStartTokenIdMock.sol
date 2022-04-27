// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import './ERC721oMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721oStartTokenIdMock is StartTokenIdHelper, ERC721oMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) StartTokenIdHelper(startTokenId_) ERC721oMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}

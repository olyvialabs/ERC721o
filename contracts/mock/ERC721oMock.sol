// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import '../ERC721o.sol';

contract ERC721oMock is ERC721o {
    constructor(string memory name_, string memory symbol_) ERC721o(name_, symbol_) {}

    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    function totalMinted() public view returns (uint256) {
        return _totalMinted();
    }

    function getAux(address owner) public view returns (uint64) {
        return _getAux(owner);
    }

    function setAux(address owner, uint64 aux) public {
        _setAux(owner, aux);
    }

    function createCategory(uint256 maxSupply) public {
        _createCategory(maxSupply);
    }

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity, uint256 categoryId) public {
        _safeMint(to, quantity, categoryId);
    }

    function safeMint(
        address to,
        uint256 quantity,
        uint256 categoryId,
        bytes memory _data
    ) public {
        _safeMint(to, quantity, categoryId, _data);
    }

    function mint(
        address to,
        uint256 quantity,
        uint256 categoryId
    ) public {
        _mint(to, quantity, categoryId, '', false); 
    }

    function burn(uint256 tokenId, bool approvalCheck) public {
        _burn(tokenId, approvalCheck);
    }
}
# About

ERC721o was born to provide a fully compliant implementation of IERC721 with the possibility of creation of categories and saving savings significant gas for the minting of multiple NFTs in a single transaction.

_This is a implementation based on ERC721A._

This project and implementation will be updated regularly and will continue to stay up to date with best practices.

**Olyvia Labs is not liable for any outcomes as a result of using ERC721O. DYOR.**

## Installation

`npm install --save-dev erc721o`

## Usage

```sol
pragma solidity ^0.8.4;

import "erc721o/contracts/ERC721o.sol";

contract Bitmon is ERC721o {
  constructor() ERC721o("Bitmon", "BTM") {}

  function mint(uint256 quantity, uint256 categoryId) external payable {
    _mint(msg.sender, quantity, categoryId);
  }
}

```

## Running tests

1. `npm install`
2. `npm run test`

## Contributing

We are open to contributions, but it's recommended to create an issue or to reply to a comment to let us know what you are working on first. That way we don't overwrite each other.

- Fork the Project
- Create your Feature Branch (`git checkout -b feature/feature-XXXXXXX`)
- Commit your Changes (`git commit -m 'Adding features XXXXXXXXXXXXXXX'`)
- Push to the Branch (`git push origin feature/feature-XXXXXXX`)
- Open a Pull Request to main branch

## Future implementations

- [x] Create ERC721o Structure
- [ ] Support Safe Mint and Mint
- [ ] Support Upgradable
      See the [open issues](https://github.com/olyvialabs/ERC721o/issues) for a full list of proposed features (and know issues).

# Contact

Contact us at hello@bixdy.com

## License

Distributed under the MIT License. See [LICENSE](./LICENSE.md) for more information.
Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

A complete example of usage can be found [here](https://github.com/olyvialabs/ERC721o/blob/main/contracts/mock/ERC721oMock.sol)

// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.3;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface MetadataProvider {
  function tokenURI(uint256 id) external view returns (string memory);
}

// This contract implements MetadataProvider, the same interface Pinyottas.sol's BaseURIMetadataProvider
// implements. By deploying this contract and passing its address to Pinyottas setMetadataProvider we can
// have AlternativeMetadataProvider be used for Pinyotta's tokenURI method instead of BaseURIMetadataProvider's.
contract AlternativeMetadataProvider is Ownable, MetadataProvider {

  using Strings for uint256;

  string public prefix = "Alternative"; 

  constructor() {}

  function tokenURI(uint256 id) public override view returns (string memory) {
    return string(abi.encodePacked(prefix, id.toString()));
  }

}

// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GLDToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("Gold", "GLD") { _mint(msg.sender, initialSupply); }
}

contract SLVToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("Silver", "SLV") { _mint(msg.sender, initialSupply); }
}

contract BRZToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("Bronze", "BRZ") { _mint(msg.sender, initialSupply); }
}

contract PLTToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("Platinum", "PLT") { _mint(msg.sender, initialSupply); }
}

//------------

contract AAVE is ERC20 {
  constructor(uint256 initialSupply) ERC20("Aave", "AAVE") { _mint(msg.sender, initialSupply); }
}

contract BAL is ERC20 {
  constructor(uint256 initialSupply) ERC20("Balancer", "BAL") { _mint(msg.sender, initialSupply); }
}

contract BANK is ERC20 {
  constructor(uint256 initialSupply) ERC20("Bank", "BANK") { _mint(msg.sender, initialSupply); }
}

contract BAT is ERC20 {
  constructor(uint256 initialSupply) ERC20("Basic Attention Token", "BAT") { _mint(msg.sender, initialSupply); }
}

contract COMP is ERC20 {
  constructor(uint256 initialSupply) ERC20("Compound", "COMP") { _mint(msg.sender, initialSupply); }
}

contract CRV is ERC20 {
  constructor(uint256 initialSupply) ERC20("Curve", "CRV") { _mint(msg.sender, initialSupply); }
}

contract DAI is ERC20 {
  constructor(uint256 initialSupply) ERC20("Dai", "DAI") { _mint(msg.sender, initialSupply); }
}

contract DPI is ERC20 {
  constructor(uint256 initialSupply) ERC20("Defi Pulse Index", "DPI") { _mint(msg.sender, initialSupply); }
}

contract GLM is ERC20 {
  constructor(uint256 initialSupply) ERC20("GOLEM", "GLM") { _mint(msg.sender, initialSupply); }
}

contract GRT is ERC20 {
  constructor(uint256 initialSupply) ERC20("The Graph", "GRT") { _mint(msg.sender, initialSupply); }
}

contract GTC is ERC20 {
  constructor(uint256 initialSupply) ERC20("Gitcoin", "GTC") { _mint(msg.sender, initialSupply); }
}

contract INST is ERC20 {
  constructor(uint256 initialSupply) ERC20("Instadapp", "INST") { _mint(msg.sender, initialSupply); }
}

contract LIDO is ERC20 {
  constructor(uint256 initialSupply) ERC20("Lido", "LIDO") { _mint(msg.sender, initialSupply); }
}

contract LINK is ERC20 {
  constructor(uint256 initialSupply) ERC20("Chainlink", "LINK") { _mint(msg.sender, initialSupply); }
}

contract MATIC is ERC20 {
  constructor(uint256 initialSupply) ERC20("Polygon", "MATIC") { _mint(msg.sender, initialSupply); }
}

contract MKR is ERC20 {
  constructor(uint256 initialSupply) ERC20("Maker", "MKR") { _mint(msg.sender, initialSupply); }
}

contract RAI is ERC20 {
  constructor(uint256 initialSupply) ERC20("Rai", "RAI") { _mint(msg.sender, initialSupply); }
}

contract RPL is ERC20 {
  constructor(uint256 initialSupply) ERC20("Rocketpool", "RPL") { _mint(msg.sender, initialSupply); }
}

contract SNX is ERC20 {
  constructor(uint256 initialSupply) ERC20("Synthetix", "SNX") { _mint(msg.sender, initialSupply); }
}

contract SUSHI is ERC20 {
  constructor(uint256 initialSupply) ERC20("Sushi", "SUSHI") { _mint(msg.sender, initialSupply); }
}

contract UNI is ERC20 {
  constructor(uint256 initialSupply) ERC20("Uniswap", "UNI") { _mint(msg.sender, initialSupply); }
}

contract USDC is ERC20 {
  constructor(uint256 initialSupply) ERC20("USD Coin", "USDC") { _mint(msg.sender, initialSupply); }
}

contract WBTC is ERC20 {
  constructor(uint256 initialSupply) ERC20("Wrapped Bitcoin", "WBTC") { _mint(msg.sender, initialSupply); }
  function decimals() public view virtual override returns (uint8) {
    return 8;
  }
}

contract WETH is ERC20 {
  constructor(uint256 initialSupply) ERC20("Wrapped Ether", "WETH") { _mint(msg.sender, initialSupply); }
}

contract YFI is ERC20 {
  constructor(uint256 initialSupply) ERC20("YFI", "YFI") { _mint(msg.sender, initialSupply); }
}

contract ZRX is ERC20 {
  constructor(uint256 initialSupply) ERC20("0x", "ZRX") { _mint(msg.sender, initialSupply); }
}
// deploy/00_deploy_your_contract.js

//const { ethers } = require("ethers");

const { TOKENS } = require("../../react-app/src/utils/tokens");
console.log(TOKENS);

const { ethers } = require("hardhat");

const MINT_FEE = ethers.utils.parseEther("0.08");
const ALLOWANCE = ethers.BigNumber.from(2).pow(256).sub(1);

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Dev config
  // ----------
  const addressesForWhitelist = [];
  for(let i = 0; i < TOKENS.length; i++) {
    const token = TOKENS[i];
    const desiredERC20Balance = ethers.BigNumber.from("10000").mul((ethers.BigNumber.from(10).pow(token.decimals)));
    const e20args = {
      args: [desiredERC20Balance],
      from: deployer,
      log: true,
    };

    await deploy(token.name, e20args);
    const tokenContract = await ethers.getContract(token.name, deployer);
    addressesForWhitelist.push(tokenContract.address);
  }

  await deploy("Pinyottas", {
    from: deployer,
    log: true,
  });
  await deploy("BaseURIMetadataProvider", {
    from: deployer,
    args: ["http://localhost:3001/tokens/metadata/"],
    log: true,
  });

  // Link Pinyottas to BaseURIMetadataProvider
  const baseURIMetadataProvider = await ethers.getContract("BaseURIMetadataProvider", deployer);
  const pinyottas = await ethers.getContract("Pinyottas", deployer);
  await pinyottas.setMetadataProvider(baseURIMetadataProvider.address);

  // Add the ERC20s to the whitelist
  await pinyottas.addContractsToWhitelist(addressesForWhitelist);

  // Approve Pinyottas on all the ERC20s
  for(let i = 0; i < TOKENS.length; i++) {
    const token = TOKENS[i];
    const tokenContract = await ethers.getContract(token.name, deployer);
    await tokenContract.approve(pinyottas.address, ALLOWANCE);
  }

  // Rinkeby config
  // --------------
  /*
  const addressesForWhitelist = [];
  for(let i = 0; i < TOKENS.length; i++) {
    const token = TOKENS[i];
    const desiredERC20Balance = ethers.BigNumber.from("10000").mul((ethers.BigNumber.from(10).pow(token.decimals)));
    const e20args = {
      args: [desiredERC20Balance],
      from: deployer,
      log: true,
    };

    await deploy(token.name, e20args);
    const tokenContract = await ethers.getContract(token.name, deployer);
    addressesForWhitelist.push(tokenContract.address);
  }

  await deploy("Pinyottas", {
    from: deployer,
    log: true,
  });
  await deploy("BaseURIMetadataProvider", {
    from: deployer,
    args: ["http://localhost:3001/tokens/metadata/"],
    log: true,
  });

  // Link Pinyottas to BaseURIMetadataProvider
  const baseURIMetadataProvider = await ethers.getContract("BaseURIMetadataProvider", deployer);
  const pinyottas = await ethers.getContract("Pinyottas", deployer);
  await pinyottas.setMetadataProvider(baseURIMetadataProvider.address);

  // Add the ERC20s to the whitelist
  await pinyottas.addContractsToWhitelist(addressesForWhitelist);
  */
  
  // Scaffold-eth examples:
  // --------------------------
  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["YourContract"];

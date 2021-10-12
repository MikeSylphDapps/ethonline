const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

const MINT_FEE = ethers.utils.parseEther("0.08");
const ORIGINAL_ERC20_SUPPLY = 100000;
const MAX_UINT_256 = ethers.BigNumber.from(2).pow(256).sub(1);

describe("Pinyottas", function () {
  let pinyottas;
  let baseURIMetadataProvider;
  let gldToken;
  let slvToken;
  let signers;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    
    const Pinyottas = await ethers.getContractFactory("Pinyottas");
    pinyottas = await Pinyottas.deploy();

    const BaseURIMetadataProvider = await ethers.getContractFactory("BaseURIMetadataProvider");
    baseURIMetadataProvider = await BaseURIMetadataProvider.deploy("http://localhost:3001/tokens/metadata/");
    await pinyottas.setMetadataProvider(baseURIMetadataProvider.address);

    const GLDToken = await ethers.getContractFactory("GLDToken");
    gldToken = await GLDToken.deploy(ORIGINAL_ERC20_SUPPLY);

    const SLVToken = await ethers.getContractFactory("SLVToken");
    slvToken = await SLVToken.deploy(ORIGINAL_ERC20_SUPPLY);
  });

  describe("flipSaleState()", () => {
    it("should be able to flip the sale state", async () => {
      const originalValue = await pinyottas.saleIsActive();
      await pinyottas.flipSaleState();
      const newValue = await pinyottas.saleIsActive();
      expect(originalValue).to.not.equal(newValue);
      await pinyottas.flipSaleState();
      const evenNewerValue = await pinyottas.saleIsActive();
      expect(originalValue).to.equal(evenNewerValue);
    });
  });

  describe("whitelisting", () => {
    let WHITELIST;

    before(async () => {
      WHITELIST = await pinyottas.WHITELIST();
    });

    it("should start empty", async () => {
      const count = (await pinyottas.getWhitelistedErc20Count()).toNumber();
      expect(count).to.equal(0);
    });

    describe("mint()", () => {
      it("should not allow minting of tokens missing from the whitelist", async () => {
        try {
          await pinyottas.mint([gldToken.address], [1], {
            value: ethers.utils.parseEther("0.08")
          });
          expect(false);
        } catch(e) {
          expect(true);
        }
      });

      it("should allow minting for tokens on the whitelist", async () => {
        // Check that there are no mints yet
        expect(
          (await pinyottas.totalSupply()).toNumber()
        ).to.equal(0);

        // Add GLD to whitelist
        await pinyottas.addContractsToWhitelist([gldToken.address]);

        // Approve pinyottas to spend GLD
        await gldToken.approve(pinyottas.address, MAX_UINT_256);

        // Mint
        await pinyottas.mint([gldToken.address], [1], { value: MINT_FEE });

        // Check that there is one mint now
        expect(await pinyottas.totalSupply()).to.equal(1);
      })
    });
    
    describe("addContractsToWhitelist()", () => {
      it("should add tokens to the whitelist", async () => {
        // Add GLD to whitelist
        await pinyottas.addContractsToWhitelist([gldToken.address]);
        
        // Check that there is only one contract on the whitelist
        expect(await pinyottas.getRoleMemberCount(WHITELIST)).to.equal(1);

        // ... and that it's the GLD contract
        expect(await pinyottas.getRoleMember(WHITELIST, 0)).to.equal(gldToken.address);
      });
    });

    describe("removeContractsFromWhitelist()", () => {
      it("should remove a single token from the whitelist", async () => {
        // Add GLD to the whitelist
        await pinyottas.addContractsToWhitelist([gldToken.address]);
        
        // Check that there is only one contract on the whitelist
        expect(await pinyottas.getRoleMemberCount(WHITELIST)).to.equal(1);

        // ... and that it's the GLD contract
        expect(await pinyottas.getRoleMember(WHITELIST, 0)).to.equal(gldToken.address);

        // Remove GLD from the whitelist
        await pinyottas.removeContractsFromWhitelist([gldToken.address]);
        
        // Check that it's no longer on the whitelist
        expect(await pinyottas.getRoleMemberCount(WHITELIST)).to.equal(0);
      });

      it("should remove only the specified token from the whitelist", async () => {
        // Add GLD and SLV to the whitelist
        await pinyottas.addContractsToWhitelist([gldToken.address, slvToken.address]);
        
        // Check that there are only two contracts on the whitelist
        expect(await pinyottas.getRoleMemberCount(WHITELIST)).to.equal(2);

        // Remove GLD
        await pinyottas.removeContractsFromWhitelist([gldToken.address]);
        
        // Check that there is only one contract left on the whitelist
        count = (await pinyottas.getRoleMemberCount(WHITELIST)).toNumber();
        expect(await pinyottas.getRoleMemberCount(WHITELIST)).to.equal(1);

        // ... and that it's SLV
        expect(await pinyottas.getRoleMember(WHITELIST, 0)).to.equal(slvToken.address);
      });
    });
  });

  describe("mint()", () => {
    it("should not allow minting when the sale is paused", async () => {
      await pinyottas.flipSaleState();
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      await expect(pinyottas.mint([gldToken.address], [1], { value: MINT_FEE })).to.be.reverted;
    });

    it.skip("should not allow minting after the max supply is reached", async () => {
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);

      const maxSupply = (await pinyottas.maxSupply()).toNumber();
      const promises = [];
      for(let i = 0; i < maxSupply; i++) {
        const p = pinyottas.mint([gldToken.address], [1], { value: MINT_FEE });
        promises.push(p);
      }
      await Promise.all([promises]);
      expect(await pinyottas.totalSupply()).to.equal(maxSupply);
      await expect(pinyottas.mint([gldToken.address], [1], { value: MINT_FEE })).to.be.revertedWith("Exceeds maximum supply");
    }).timeout(1000000);

    it("should not allow minting of empty pinyottas after *that* max supply is reached", async () => {
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);

      // Mint a non-empty pinyotta
      await expect(pinyottas.mint([gldToken.address], [1], { value: MINT_FEE }));

      const maxEmptyPinyottasSupply = (await pinyottas.maxEmptyPinyottasSupply()).toNumber();
      const promises = [];
      for(let i = 0; i < maxEmptyPinyottasSupply; i++) {
        const p = pinyottas.mint([], [], { value: MINT_FEE });
        promises.push(p);
      }
      await Promise.all([promises]);

      await expect(pinyottas.mint([], [], { value: MINT_FEE })).to.be.reverted;

      // Keep minting non-empty pinyottas :)
      await expect(pinyottas.mint([gldToken.address], [1], { value: MINT_FEE })).to.not.be.reverted;
    });

    it("should validate the amount of ether sent", async () => {
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      await expect(pinyottas.mint([gldToken.address], [1], { value: MINT_FEE.sub(1) })).to.be.revertedWith("Incorrect amount of ether sent");
      await expect(pinyottas.mint([gldToken.address], [1], { value: MINT_FEE.add(1) })).to.be.revertedWith("Incorrect amount of ether sent");
      await expect(pinyottas.mint([gldToken.address], [1], { value: MINT_FEE.mul(2) })).to.be.revertedWith("Incorrect amount of ether sent");
      await expect(pinyottas.mint([gldToken.address], [1], { value: ethers.utils.parseEther("1") })).revertedWith("Incorrect amount of ether sent");
      await expect(pinyottas.mint([gldToken.address], [1], { value: ethers.utils.parseEther("0.001") })).revertedWith("Incorrect amount of ether sent");
      await expect(pinyottas.mint([gldToken.address], [1], { value: MINT_FEE })).to.not.be.reverted;
    });

    it("should force _tokenContracts and _tokenAmounts to be the same length", async () => {
      await pinyottas.addContractsToWhitelist([gldToken.address, slvToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      await slvToken.approve(pinyottas.address, MAX_UINT_256);
      await expect(pinyottas.mint([gldToken.address], [], { value: MINT_FEE })).to.be.reverted;
      await expect(pinyottas.mint([], [1], { value: MINT_FEE })).to.be.reverted;
      await expect(pinyottas.mint([], [1, 1], { value: MINT_FEE })).to.be.reverted;
      await expect(pinyottas.mint([gldToken.address], [1, 1], { value: MINT_FEE })).to.be.reverted;
      await expect(pinyottas.mint([gldToken.address, slvToken.address], [1], { value: MINT_FEE })).to.be.reverted;
    });

    it("should not allow the same token contract twice in the args", async () => {
      await pinyottas.addContractsToWhitelist([gldToken.address, slvToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      await slvToken.approve(pinyottas.address, MAX_UINT_256);
      
      await expect(pinyottas.mint([gldToken.address, gldToken.address], [1, 1], { value: MINT_FEE })).to.be.revertedWith("Each item in _tokenContracts must be unique");
      await expect(pinyottas.mint([gldToken.address, slvToken.address, gldToken.address], [1, 1, 1], { value: MINT_FEE })).to.be.revertedWith("Each item in _tokenContracts must be unique");
      await expect(pinyottas.mint([gldToken.address, slvToken.address, slvToken.address], [1, 1, 1], { value: MINT_FEE })).to.be.revertedWith("Each item in _tokenContracts must be unique");
    });

    it("should not allow 0 as a token amount", async () => {
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      await slvToken.approve(pinyottas.address, MAX_UINT_256);

      await expect(pinyottas.mint([gldToken.address], [0], { value: MINT_FEE })).to.be.reverted;
      await expect(pinyottas.mint([gldToken.address, slvToken.address], [1, 0], { value: MINT_FEE })).to.be.reverted;
    });

    it("should enforce allowances", async () => {
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, 10);

      await expect(pinyottas.mint([gldToken.address], [5], { value: MINT_FEE })).to.not.be.reverted;
      await expect(pinyottas.mint([gldToken.address], [5], { value: MINT_FEE })).to.not.be.reverted;
      await expect(pinyottas.mint([gldToken.address], [5], { value: MINT_FEE })).to.be.reverted;
    });

    it("should allow minting of empty pinyottas... to a point", async () => {
      const promises = []
      for(let i = 0; i < 100; i++) {
        const promise = pinyottas.mint([], [], { value: MINT_FEE });
        promises.push(promise);
      };
      await Promise.all(promises);

      await expect(pinyottas.mint([], [], { value: MINT_FEE })).to.be.reverted;
    });
  })

  describe("getTokenBalanceInPinyotta and getTokenContractsInPinyotta", async () => {

  });

  describe("tokenURI", async () => {

  });

  describe("whitelisting", async () => {

  });
  
  describe("bust()", () => {
    it('should give the pinyotta owner the underlying tokens', async () => {
      const owner = signers[0];

      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      
      // Mint a pinyotta and bust it, checking token balances at each step
      expect(await gldToken.balanceOf(owner.address)).to.equal(ORIGINAL_ERC20_SUPPLY);
      await pinyottas.mint([gldToken.address], [1], { value: MINT_FEE });
      expect(await gldToken.balanceOf(owner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 1);
      await pinyottas.bust(1);
      expect(await gldToken.balanceOf(owner.address)).to.equal(ORIGINAL_ERC20_SUPPLY);

      // Try with two tokens
      await pinyottas.addContractsToWhitelist([slvToken.address]);
      await slvToken.approve(pinyottas.address, MAX_UINT_256);

      expect(await slvToken.balanceOf(owner.address)).to.equal(ORIGINAL_ERC20_SUPPLY);
      await pinyottas.mint([gldToken.address, slvToken.address], [1, 2], { value: MINT_FEE });
      expect(await gldToken.balanceOf(owner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 1);
      expect(await slvToken.balanceOf(owner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 2);
      await pinyottas.bust(2);
      expect(await gldToken.balanceOf(owner.address)).to.equal(ORIGINAL_ERC20_SUPPLY);
      expect(await slvToken.balanceOf(owner.address)).to.equal(ORIGINAL_ERC20_SUPPLY);
    });

    it('should give the pinyotta owner the underlying tokens even if they are not the original owner', async () => {
      const originalOwner = signers[0];
      const newOwner = signers[1];

      expect(await gldToken.balanceOf(newOwner.address)).to.equal(0);

      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      await pinyottas.mint([gldToken.address], [1], { value: MINT_FEE });
      await pinyottas.transferFrom(originalOwner.address, newOwner.address, 1);
      
      const pinyottasForNewOwner = pinyottas.connect(newOwner);
      await pinyottasForNewOwner.bust(1);

      expect(await gldToken.balanceOf(newOwner.address)).to.equal(1);
      expect(await gldToken.balanceOf(originalOwner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 1);

      // Retain ownership of the pinyotta
      await expect(pinyottas.ownerOf(1));

      // Try with two tokens
      await pinyottas.addContractsToWhitelist([slvToken.address]);
      await slvToken.approve(pinyottas.address, MAX_UINT_256);

      expect(await gldToken.balanceOf(originalOwner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 1);
      expect(await slvToken.balanceOf(originalOwner.address)).to.equal(ORIGINAL_ERC20_SUPPLY);
      await pinyottas.mint([gldToken.address, slvToken.address], [1, 2], { value: MINT_FEE });
      expect(await gldToken.balanceOf(originalOwner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 2);
      expect(await slvToken.balanceOf(originalOwner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 2);
      await pinyottas.transferFrom(originalOwner.address, newOwner.address, 2);
      await pinyottasForNewOwner.bust(2);
      expect(await gldToken.balanceOf(originalOwner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 2);
      expect(await slvToken.balanceOf(originalOwner.address)).to.equal(ORIGINAL_ERC20_SUPPLY - 2);
      expect(await gldToken.balanceOf(newOwner.address)).to.equal(2);
      expect(await slvToken.balanceOf(newOwner.address)).to.equal(2);
    });

    /*
    it('should reduce totalSupply but not mintCount', async () => {
      expect(await pinyottas.totalSupply()).to.equal(0);
      expect(await pinyottas.mintCount()).to.equal(0);

      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, 10000);
      await pinyottas.mint([gldToken.address], [1], { value: MINT_FEE });
      
      expect(await pinyottas.totalSupply()).to.equal(1);
      expect(await pinyottas.mintCount()).to.equal(1);
      
      await pinyottas.bust(1);
    
      expect(await pinyottas.totalSupply()).to.equal(0);
      expect(await pinyottas.mintCount()).to.equal(1);
    });
    */

    it('should only allow the token holder to bust', async () => {
      const owner1 = signers[0];
      const owner2 = signers[1];
      const owner3 = signers[2];
      const pinyottasForNewOwner2 = pinyottas.connect(owner2);
      const pinyottasForNewOwner3 = pinyottas.connect(owner3);

      // Mint a token and try to bust it from two other addresses
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      await pinyottas.mint([gldToken.address], [1], { value: MINT_FEE });
      await expect(pinyottasForNewOwner2.bust(1)).to.be.reverted;
      await expect(pinyottasForNewOwner3.bust(1)).to.be.reverted;
      await pinyottas.bust(1);
      await expect(pinyottas.bust(1)).to.be.reverted; // Can't bust the same token twice

      // Mint a token, transfer it, and try to bust it from the original address and a third address.
      await pinyottas.mint([gldToken.address], [1], { value: MINT_FEE });
      await pinyottas.transferFrom(owner1.address, owner2.address, 2);
      await expect(pinyottas.bust(2)).to.be.reverted;
      await expect(pinyottasForNewOwner3.bust(2)).to.be.reverted;
      await pinyottasForNewOwner2.bust(2);
      await expect(pinyottasForNewOwner2.bust(2)).to.be.reverted; // Can't bust the same token twice
    });

    it("should still allow calling of tokenURI, getTokenBalanceInPinyotta, and getTokenContractsInPinyotta", async () => {
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.approve(pinyottas.address, MAX_UINT_256);
      await pinyottas.mint([gldToken.address], [1], { value: MINT_FEE });
      
      await (expect(pinyottas.tokenURI(1))).to.not.be.reverted;
      await pinyottas.bust(1);
      await (expect(pinyottas.tokenURI(1))).to.not.be.reverted;
      
      const tc = await pinyottas.getTokenContractsInPinyotta(1);
      expect(tc.length).to.equal(1);
      expect(tc[0]).to.equal(gldToken.address);

      const tb = (await pinyottas.getTokenBalanceInPinyotta(1, gldToken.address));
      expect(tb).to.equal(0);
    });
  });

  describe("withdraw()", () => {
    it('should transfer the balance to the owner', async () => {
      const owner = signers[0];
      const minter = signers[1];
      const pinyottasForMinter = pinyottas.connect(minter);
      
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.transfer(minter.address, 100000);
      
      const gldTokenForMinter = gldToken.connect(minter);
      await gldTokenForMinter.approve(pinyottas.address, MAX_UINT_256);

      let expectedWithdrawAmount = ethers.BigNumber.from(MINT_FEE).mul(9); // 9 instead of 10 because we lose some for gas
      for(let i = 0; i < 10; i++) {
        await pinyottasForMinter.mint([gldToken.address], [1], { value: MINT_FEE });
      }

      const startBalance = await owner.getBalance();
      await pinyottas.withdraw();
      const expectedBalance = startBalance.add(expectedWithdrawAmount);
      expect(await owner.getBalance()).to.be.above(expectedBalance);
    });

    it('should not transfer the balance to the anyone else', async () => {
      const minter = signers[1];
      const pinyottasForMinter = pinyottas.connect(minter);
      
      await pinyottas.addContractsToWhitelist([gldToken.address]);
      await gldToken.transfer(minter.address, 100000);
      
      const gldTokenForMinter = gldToken.connect(minter);
      await gldTokenForMinter.approve(pinyottas.address, MAX_UINT_256);

      for(let i = 0; i < 10; i++) {
        await pinyottasForMinter.mint([gldToken.address], [1], { value: MINT_FEE });
      }

      await expect(pinyottasForMinter.withdraw()).to.be.reverted;
    });
  });
});

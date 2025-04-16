const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiceGame", function () {
  let DiceGame;
  let diceGame;
  let owner;
  let player;
  
  // Constants for testing
  const minBet = ethers.parseEther("0.01");
  const maxBet = ethers.parseEther("1");
  const houseEdge = 500; // 5%
  
  beforeEach(async function () {
    // Get signers
    [owner, player] = await ethers.getSigners();
    
    // Deploy contract
    DiceGame = await ethers.getContractFactory("DiceGame");
    diceGame = await DiceGame.deploy(minBet, maxBet, houseEdge);
    // Wait for deployment
    await diceGame.waitForDeployment();
    
    // Fund contract
    await owner.sendTransaction({
      to: await diceGame.getAddress(),
      value: ethers.parseEther("10")
    });
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await diceGame.owner()).to.equal(owner.address);
    });
    
    it("Should set the correct game parameters", async function () {
      expect(await diceGame.minBet()).to.equal(minBet);
      expect(await diceGame.maxBet()).to.equal(maxBet);
      expect(await diceGame.houseEdge()).to.equal(houseEdge);
    });
  });
  
  describe("Game Mechanics", function () {
    it("Should reject bets below minimum", async function () {
      const lowBet = ethers.parseEther("0.005");
      await expect(
        diceGame.connect(player).placeBet(1, { value: lowBet })
      ).to.be.revertedWith("Bet amount too low");
    });
    
    it("Should reject bets above maximum", async function () {
      const highBet = ethers.parseEther("2");
      await expect(
        diceGame.connect(player).placeBet(1, { value: highBet })
      ).to.be.revertedWith("Bet amount too high");
    });
    
    it("Should reject invalid dice numbers", async function () {
      await expect(
        diceGame.connect(player).placeBet(0, { value: minBet })
      ).to.be.revertedWith("Number must be between 1 and 6");
      
      await expect(
        diceGame.connect(player).placeBet(7, { value: minBet })
      ).to.be.revertedWith("Number must be between 1 and 6");
    });
    
    it("Should record game in player history", async function () {
      const betAmount = ethers.parseEther("0.05");
      await diceGame.connect(player).placeBet(3, { value: betAmount });
      
      const history = await diceGame.getPlayerHistory(player.address);
      expect(history.length).to.equal(1);
      expect(history[0].betAmount).to.equal(betAmount);
      expect(history[0].chosenNumber).to.equal(3);
    });
  });
  
  describe("Contract Management", function () {
    it("Should allow owner to withdraw funds", async function () {
      const withdrawAmount = ethers.parseEther("1");
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await diceGame.withdraw(withdrawAmount);
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      // Account for gas costs by checking the balance is higher, not exact amount
      expect(finalBalance > initialBalance).to.be.true;
    });
    
    it("Should prevent non-owners from withdrawing", async function () {
      await expect(
        diceGame.connect(player).withdraw(ethers.parseEther("1"))
      ).to.be.revertedWith("Only owner can call this function");
    });
    
    it("Should allow owner to update game parameters", async function () {
      const newMinBet = ethers.parseEther("0.02");
      const newMaxBet = ethers.parseEther("2");
      const newHouseEdge = 600;
      
      await diceGame.updateGameParameters(newMinBet, newMaxBet, newHouseEdge);
      
      expect(await diceGame.minBet()).to.equal(newMinBet);
      expect(await diceGame.maxBet()).to.equal(newMaxBet);
      expect(await diceGame.houseEdge()).to.equal(newHouseEdge);
    });
  });
});

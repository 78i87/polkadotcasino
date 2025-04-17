const { ethers } = require("hardhat") ;

async function main() {
  console.log("Deploying DiceGame contract...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy contract
  const minBet = ethers.parseEther("0.01");
  const maxBet = ethers.parseEther("1");
  const houseEdge = 500; // 5%
  
  const DiceGame = await ethers.getContractFactory("DiceGame");
  const diceGame = await DiceGame.deploy(minBet, maxBet, houseEdge);
  await diceGame.waitForDeployment();
  
  const diceGameAddress = await diceGame.getAddress();
  console.log("DiceGame deployed to:", diceGameAddress);
  
  // Fund the contract
  console.log("Funding contract with initial balance...");
  await deployer.sendTransaction({
    to: diceGameAddress,
    value: ethers.parseEther("1")
  });
  
  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
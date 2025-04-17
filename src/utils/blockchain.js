import { ethers } from 'ethers';

// ABI for the DiceGame contract
const DiceGameABI = [
  "function placeBet(uint8 chosenNumber) external payable",
  "function getPlayerHistory(address player) external view returns (tuple(uint256 betAmount, uint8 chosenNumber, uint8 rolledNumber, uint256 payout, uint256 timestamp)[] memory)",
  "function getContractBalance() external view returns (uint256)",
  "function minBet() external view returns (uint256)",
  "function maxBet() external view returns (uint256)",
  "function houseEdge() external view returns (uint256)",
  "event BetPlaced(address indexed player, uint256 amount, uint8 chosenNumber)",
  "event DiceRolled(address indexed player, uint8 rolledNumber)",
  "event PayoutSent(address indexed player, uint256 amount)"
];

// Contract address - this would be updated after deployment
const contractAddress = "0x0000000000000000000000000000000000000000";

// Connect wallet function
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet detected. Please install MetaMask.");
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const account = await signer.getAddress();
  
  return { provider, signer, account };
};

// Get contract instance
export const getDiceGameContract = async (signerOrProvider) => {
  return new ethers.Contract(contractAddress, DiceGameABI, signerOrProvider);
};

// Format ETH amount
export const formatEth = (wei) => {
  return parseFloat(ethers.utils.formatEther(wei)).toFixed(4);
};

// Listen for contract events
export const listenForEvents = (contract, account, callback) => {
  // Listen for BetPlaced events
  contract.on("BetPlaced", (player, amount, chosenNumber) => {
    if (player.toLowerCase() === account.toLowerCase()) {
      console.log("Bet placed:", { player, amount: formatEth(amount), chosenNumber });
    }
  });

  // Listen for DiceRolled events
  contract.on("DiceRolled", (player, rolledNumber) => {
    if (player.toLowerCase() === account.toLowerCase()) {
      console.log("Dice rolled:", { player, rolledNumber });
      callback && callback("rolled", { rolledNumber });
    }
  });

  // Listen for PayoutSent events
  contract.on("PayoutSent", (player, amount) => {
    if (player.toLowerCase() === account.toLowerCase()) {
      console.log("Payout sent:", { player, amount: formatEth(amount) });
      callback && callback("payout", { amount: formatEth(amount) });
    }
  });

  return () => {
    contract.removeAllListeners();
  };
};

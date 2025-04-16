// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DiceGame
 * @dev A simple dice game contract for the Chainflip Casino prototype
 */
contract DiceGame {
    // State variables
    address public owner;
    uint256 public minBet;
    uint256 public maxBet;
    uint256 public houseEdge; // Represented as percentage * 100 (e.g., 500 = 5%)
    
    // Game struct to store game history
    struct Game {
        uint256 betAmount;
        uint8 chosenNumber;
        uint8 rolledNumber;
        uint256 payout;
        uint256 timestamp;
    }
    
    // Mapping to store game history for each player
    mapping(address => Game[]) public gameHistory;
    
    // Events
    event BetPlaced(address indexed player, uint256 amount, uint8 chosenNumber);
    event DiceRolled(address indexed player, uint8 rolledNumber);
    event PayoutSent(address indexed player, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor to initialize the contract
     * @param _minBet Minimum bet amount in wei
     * @param _maxBet Maximum bet amount in wei
     * @param _houseEdge House edge percentage * 100 (e.g., 500 = 5%)
     */
    constructor(uint256 _minBet, uint256 _maxBet, uint256 _houseEdge) {
        owner = msg.sender;
        minBet = _minBet;
        maxBet = _maxBet;
        houseEdge = _houseEdge;
    }
    
    /**
     * @dev Place a bet on a number between 1 and 6
     * @param chosenNumber The number chosen by the player (1-6)
     */
    function placeBet(uint8 chosenNumber) external payable {
        // Validate bet amount
        require(msg.value >= minBet, "Bet amount too low");
        require(msg.value <= maxBet, "Bet amount too high");
        
        // Validate chosen number
        require(chosenNumber >= 1 && chosenNumber <= 6, "Number must be between 1 and 6");
        
        // Ensure contract has enough balance to pay potential winnings
        uint256 maxPayout = calculateMaxPayout(msg.value);
        require(address(this).balance >= maxPayout, "Contract doesn't have enough funds");
        
        // Emit bet placed event
        emit BetPlaced(msg.sender, msg.value, chosenNumber);
        
        // Roll the dice
        uint8 rolledNumber = rollDice();
        emit DiceRolled(msg.sender, rolledNumber);
        
        // Calculate payout
        uint256 payout = calculatePayout(msg.value, chosenNumber, rolledNumber);
        
        // Store game in history
        Game memory newGame = Game({
            betAmount: msg.value,
            chosenNumber: chosenNumber,
            rolledNumber: rolledNumber,
            payout: payout,
            timestamp: block.timestamp
        });
        
        gameHistory[msg.sender].push(newGame);
        
        // Send payout if player won
        if (payout > 0) {
            payable(msg.sender).transfer(payout);
            emit PayoutSent(msg.sender, payout);
        }
    }
    
    /**
     * @dev Roll the dice and generate a random number between 1 and 6
     * @return A random number between 1 and 6
     * @notice This is a simplified implementation for the prototype.
     * In production, a more secure random number generation method should be used.
     */
    function rollDice() internal view returns (uint8) {
        // Simple random number generation (1-6)
        // Note: This is not secure for production use
        uint8 result = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 6) + 1;
        return result;
    }
    
    /**
     * @dev Calculate the maximum possible payout for a given bet amount
     * @param betAmount The amount bet by the player
     * @return The maximum possible payout
     */
    function calculateMaxPayout(uint256 betAmount) internal pure returns (uint256) {
        // Maximum payout is 6x the bet amount (if player wins)
        return betAmount * 6;
    }
    
    /**
     * @dev Calculate the payout for a given bet
     * @param betAmount The amount bet by the player
     * @param chosenNumber The number chosen by the player
     * @param rolledNumber The number rolled by the dice
     * @return The payout amount
     */
    function calculatePayout(uint256 betAmount, uint8 chosenNumber, uint8 rolledNumber) internal view returns (uint256) {
        if (chosenNumber == rolledNumber) {
            // Player wins - payout is 6x the bet amount minus house edge
            uint256 winAmount = betAmount * 6;
            uint256 houseEdgeAmount = (winAmount * houseEdge) / 10000;
            return winAmount - houseEdgeAmount;
        } else {
            // Player loses
            return 0;
        }
    }
    
    /**
     * @dev Get the game history for a player
     * @param player The address of the player
     * @return An array of Game structs representing the player's game history
     */
    function getPlayerHistory(address player) external view returns (Game[] memory) {
        return gameHistory[player];
    }
    
    /**
     * @dev Withdraw funds from the contract
     * @param amount The amount to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(amount);
    }
    
    /**
     * @dev Update game parameters
     * @param _minBet New minimum bet amount
     * @param _maxBet New maximum bet amount
     * @param _houseEdge New house edge percentage * 100
     */
    function updateGameParameters(uint256 _minBet, uint256 _maxBet, uint256 _houseEdge) external onlyOwner {
        minBet = _minBet;
        maxBet = _maxBet;
        houseEdge = _houseEdge;
    }
    
    /**
     * @dev Fund the contract
     */
    function fundContract() external payable onlyOwner {
        // Just receive funds
    }
    
    /**
     * @dev Get contract balance
     * @return The balance of the contract
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

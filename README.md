 # Chainflip Casino

 Chainflip Casino is a decentralized dice game dApp built as part of a Polkadot Hackathon project. It consists of a Solidity smart contract for the game logic, a React frontend to interact with the contract, and a suite of Hardhat tests.

 ## Table of Contents
 - [Overview](#overview)
 - [Tech Stack](#tech-stack)
 - [File Structure](#file-structure)
 - [Prerequisites](#prerequisites)
 - [Installation](#installation)
 - [Local Development](#local-development)
 - [Smart Contract](#smart-contract)
 - [Testing](#testing)
 - [Usage](#usage)
 - [Configuration](#configuration)
 - [License](#license)

 ## Overview
 Chainflip Casino lets users place bets on a dice roll (1-6) against a configurable house edge. Players can view their game history, and the contract owner can manage funds and update parameters.

 ## Tech Stack
 - **Frontend**: React, React Scripts
 - **Blockchain**: Solidity, Ethers.js, Web3Modal
 - **Testing**: Hardhat, Ethers.js, Chai

 ## File Structure
 ```
 .
 ├── DiceGame.sol           # Solidity smart contract
 ├── README.md              # Project overview and setup instructions
 ├── package.json           # npm config & scripts
 ├── package-lock.json      # npm lock file
 ├── .gitignore             # Git ignore file
 ├── public/
 │   └── index.html         # HTML template
 └── src/
     ├── App.js             # Root React component
     ├── index.js           # React DOM entry point
     ├── index.css          # Global styles
     ├── components/
     │   ├── DiceGame.js    # Dice game UI component
     │   ├── DiceGame.test.js # Hardhat test suite for the contract
     │   ├── GameHistory.js # Game history component
     │   └── Header.js      # Header component (wallet connect)
     └── utils/
         └── blockchain.js  # Utilities: wallet & contract interaction

 ```

 ## Prerequisites
 - Node.js (v14+)
 - npm or Yarn
 - MetaMask or another Ethereum-compatible wallet

 ## Installation
 ```bash
 git clone <repository_url>
 cd chainflip-casino
 npm install
 ```

 ## Local Development
 1. **Start a local blockchain** (optional, for full end-to-end):
    ```bash
    npx hardhat node
    ```
 2. **Deploy the contract** (modify or create a deployment script if needed), then update `contractAddress` in `blockchain.js`.
 3. **Run the React app**:
    ```bash
    npm start
    ```
 4. Open [http://localhost:3000](http://localhost:3000) in your browser.

 ## Smart Contract
 - **DiceGame.sol** implements:
   - Betting between `minBet` and `maxBet`.
   - Simple on-chain randomness (keccak256 of timestamp, prevrandao, sender).
   - A house edge on winnings.
   - Game history per player.
   - Owner functions: `withdraw`, `fundContract`, `updateGameParameters`.
 - **Events**: `BetPlaced`, `DiceRolled`, `PayoutSent`.

 ## Testing
 Hardhat tests are provided in `DiceGame.test.js`:
 ```bash
 # Install Hardhat and test dependencies if not already:
 npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox chai
 # Run contract tests:
 npx hardhat test
 ```

 ## Usage
 - Click **Connect Wallet** to connect MetaMask.
 - Choose a number (1-6) and bet amount in the UI.
 - Submit a bet and view results and updated history.

 ## Configuration
 - **Contract Address**: Update `contractAddress` in `blockchain.js` after deploying your contract.
 - **Network**: Ensure MetaMask is connected to the same network (e.g., local Hardhat node or testnet).

 ## License
 This project is released under the MIT License.
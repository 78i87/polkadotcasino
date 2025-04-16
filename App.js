import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import Header from './components/Header';
import DiceGame from './components/DiceGame';
import GameHistory from './components/GameHistory';
import { connectWallet, getDiceGameContract } from './utils/blockchain';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Connect wallet function
  const handleConnectWallet = async () => {
    try {
      const { provider, signer, account } = await connectWallet();
      setProvider(provider);
      setSigner(signer);
      setAccount(account);

      // Get contract instance
      const contract = await getDiceGameContract(signer);
      setContract(contract);

      // Load game history
      if (account) {
        loadGameHistory(contract, account);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please make sure MetaMask is installed and connected to the correct network.");
    }
  };

  // Load game history
  const loadGameHistory = async (contract, account) => {
    try {
      const history = await contract.getPlayerHistory(account);
      setGameHistory(history);
    } catch (error) {
      console.error("Error loading game history:", error);
    }
  };

  // Place bet function
  const placeBet = async (chosenNumber, betAmount) => {
    if (!contract || !signer) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.placeBet(chosenNumber, {
        value: ethers.utils.parseEther(betAmount.toString())
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Reload game history
      await loadGameHistory(contract, account);
      setLoading(false);
      
      return true;
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Error placing bet. Please check your balance and try again.");
      setLoading(false);
      return false;
    }
  };

  return (
    <div className="container">
      <Header 
        account={account} 
        onConnectWallet={handleConnectWallet} 
      />
      
      <DiceGame 
        placeBet={placeBet}
        loading={loading}
        isConnected={!!account}
      />
      
      {account && gameHistory.length > 0 && (
        <GameHistory history={gameHistory} />
      )}
    </div>
  );
}

export default App;

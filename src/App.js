import React, { useState } from 'react';
import Header from './components/Header';
import DiceGame from './components/DiceGame';
import GameHistory from './components/GameHistory';
import {
  connectWallet,
  getDiceGameContract,
  getPlayerHistory,
  placeBet as sendBet
} from './utils/blockchain';

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [injector, setInjector] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Connect wallet function
  const handleConnectWallet = async () => {
    try {
      const { account: addr, injector } = await connectWallet();
      setAccount(addr);
      setInjector(injector);

      // Initialize contract
      const ctr = await getDiceGameContract();
      setContract(ctr);

      // Load game history
      const history = await getPlayerHistory(ctr, addr);
      setGameHistory(history);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Ensure Polkadot extension is installed and on Westend.');
    }
  };

  // Load game history
  // Removed in favor of getPlayerHistory from utils

  // Place bet function
  const placeBet = async (chosenNumber, betAmount) => {
    if (!contract || !injector || !account) {
      alert('Please connect your wallet first');
      return false;
    }
    try {
      setLoading(true);
      const success = await sendBet(contract, account, injector, chosenNumber, betAmount);
      if (success) {
        const history = await getPlayerHistory(contract, account);
        setGameHistory(history);
      }
      setLoading(false);
      return success;
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Error placing bet. Please check your balance and try again.');
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

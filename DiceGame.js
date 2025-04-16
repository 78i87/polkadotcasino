import React, { useState } from 'react';

function DiceGame({ placeBet, loading, isConnected }) {
  const [betAmount, setBetAmount] = useState(0.01);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Handle bet amount change
  const handleBetAmountChange = (e) => {
    setBetAmount(parseFloat(e.target.value));
  };

  // Handle number selection
  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
  };

  // Handle roll dice
  const handleRollDice = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (selectedNumber === null) {
      alert("Please select a number first");
      return;
    }

    if (betAmount <= 0) {
      alert("Please enter a valid bet amount");
      return;
    }

    setShowResult(false);
    const success = await placeBet(selectedNumber, betAmount);
    
    if (success) {
      // Simulate dice roll animation
      setTimeout(() => {
        // In a real implementation, we would get this from the blockchain event
        // For now, we'll simulate a random result
        const rolledNumber = Math.floor(Math.random() * 6) + 1;
        setResult({
          rolledNumber,
          win: rolledNumber === selectedNumber,
          payout: rolledNumber === selectedNumber ? betAmount * 6 : 0
        });
        setShowResult(true);
      }, 1000);
    }
  };

  return (
    <div className="dice-game">
      <h2 className="game-title">Dice Roll Game</h2>
      
      <div className="bet-input">
        <label htmlFor="betAmount">Bet Amount (ETH):</label>
        <input
          type="number"
          id="betAmount"
          value={betAmount}
          onChange={handleBetAmountChange}
          min="0.001"
          step="0.001"
          className="form-control mt-2"
          disabled={loading}
        />
      </div>
      
      <div>
        <p>Select a number:</p>
        <div className="number-selector">
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <div
              key={number}
              className={`dice-number ${selectedNumber === number ? 'selected' : ''}`}
              onClick={() => handleNumberSelect(number)}
            >
              {number}
            </div>
          ))}
        </div>
      </div>
      
      <button
        className="roll-button"
        onClick={handleRollDice}
        disabled={loading || !isConnected || selectedNumber === null}
      >
        {loading ? 'Rolling...' : 'Roll Dice'}
      </button>
      
      {showResult && result && (
        <div className="game-result">
          <div className="result-dice">{result.rolledNumber}</div>
          <div className={`result-message ${result.win ? 'result-win' : 'result-lose'}`}>
            {result.win ? 'You Win!' : 'You Lose!'}
          </div>
          {result.win && (
            <div>You won {result.payout} ETH!</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiceGame;

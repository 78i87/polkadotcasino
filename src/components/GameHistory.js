import React from 'react';
import { ethers } from 'ethers';

function GameHistory({ history }) {
  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Format ETH amount
  const formatEth = (wei) => {
    return parseFloat(ethers.utils.formatEther(wei)).toFixed(4);
  };

  return (
    <div>
      <h2 className="game-title">Game History</h2>
      <div className="table-responsive">
        <table className="history-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Bet Amount</th>
              <th>Chosen Number</th>
              <th>Rolled Number</th>
              <th>Result</th>
              <th>Payout</th>
            </tr>
          </thead>
          <tbody>
            {history.map((game, index) => (
              <tr key={index}>
                <td>{formatDate(game.timestamp.toString())}</td>
                <td>{formatEth(game.betAmount)} ETH</td>
                <td>{game.chosenNumber.toString()}</td>
                <td>{game.rolledNumber.toString()}</td>
                <td className={game.payout.toString() !== '0' ? 'win' : 'lose'}>
                  {game.payout.toString() !== '0' ? 'Win' : 'Lose'}
                </td>
                <td>{formatEth(game.payout)} ETH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GameHistory;

import React from 'react';
import { formatWND } from '../utils/blockchain';

function GameHistory({ history }) {
  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const ts = timestamp && typeof timestamp.toNumber === 'function'
      ? timestamp.toNumber()
      : Number(timestamp);
    return new Date(ts * 1000).toLocaleString();
  };

  // Format Westend (WND) amount
  // uses formatWND imported above

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
                <td>{formatDate(game.timestamp)}</td>
                <td>{formatWND(game.betAmount)} WND</td>
                <td>{game.chosenNumber.toNumber()}</td>
                <td>{game.rolledNumber.toNumber()}</td>
                <td className={game.payout.toNumber() !== 0 ? 'win' : 'lose'}>
                  {game.payout.toNumber() !== 0 ? 'Win' : 'Lose'}
                </td>
                <td>{formatWND(game.payout)} WND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GameHistory;

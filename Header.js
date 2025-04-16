import React from 'react';

function Header({ account, onConnectWallet }) {
  // Format account address for display
  const formatAccount = (account) => {
    if (!account) return '';
    return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
  };

  return (
    <div className="header">
      <div className="logo">Chainflip Casino</div>
      <button 
        className="wallet-button" 
        onClick={onConnectWallet}
      >
        {account ? formatAccount(account) : 'Connect Wallet'}
      </button>
    </div>
  );
}

export default Header;

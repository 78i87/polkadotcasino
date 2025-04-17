require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load private key from environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.28",
  networks: {
    westend: {
      url: "https://westend-rpc.polkadot.io",
      accounts: [PRIVATE_KEY],
      chainId: 42,
    },
    hardhat: {
      // Local development network
    }
  }
};

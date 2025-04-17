// Polkadot.js API integration for Westend network
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { formatBalance, BN } from '@polkadot/util';

// TODO: Place your Ink! contract metadata JSON at src/metadata/DiceGame.json
import DiceGameMetadata from '../metadata/DiceGame.json';

// Westend RPC endpoint
const WS_PROVIDER = 'wss://westend-rpc.polkadot.io';
// TODO: Replace with your deployed contract address on Westend
const CONTRACT_ADDRESS = '5XXXX...';

let api;

/**
 * Initialize and return the ApiPromise instance
 */
export const initApi = async () => {
  if (!api) {
    const provider = new WsProvider(WS_PROVIDER);
    api = await ApiPromise.create({ provider });
  }
  return api;
};

/**
 * Connect to the Polkadot{.js} extension and return account/injector
 */
export const connectWallet = async () => {
  const extensions = await web3Enable('Chainflip Casino');
  if (extensions.length === 0) {
    throw new Error('No Polkadot extension detected or access denied');
  }
  const accounts = await web3Accounts();
  if (accounts.length === 0) {
    throw new Error('No accounts found. Please authorize access in your extension.');
  }
  const { address } = accounts[0];
  const injector = await web3FromAddress(address);
  await initApi();
  return { account: address, injector };
};

/**
 * Return a ContractPromise instance for the DiceGame contract
 */
export const getDiceGameContract = async () => {
  const _api = await initApi();
  return new ContractPromise(_api, DiceGameMetadata, CONTRACT_ADDRESS);
};

/**
 * Place a bet by sending an extrinsic to the contract
 * @param {ContractPromise} contract
 * @param {string} account
 * @param {object} injector
 * @param {number} chosenNumber
 * @param {number} amount - in WND (Westend) units
 */
export const placeBet = async (contract, account, injector, chosenNumber, amount) => {
  // Convert amount to planck (12 decimals)
  const planckAmount = new BN(Math.floor(amount * 10 ** 12));
  const gasLimit = -1; // auto weight
  return new Promise(async (resolve, reject) => {
    try {
      const unsub = await contract.tx.placeBet({ gasLimit, value: planckAmount }, chosenNumber)
        .signAndSend(account, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock || result.status.isFinalized) {
            unsub();
            resolve(true);
          }
        });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Query on-chain player history
 * @param {ContractPromise} contract
 * @param {string} account
 */
export const getPlayerHistory = async (contract, account) => {
  const options = { gasLimit: -1, value: 0 };
  const { output } = await contract.query.getPlayerHistory(account, options, account);
  if (!output) return [];
  return output.map(([betAmount, chosenNumber, rolledNumber, payout, timestamp]) => ({
    betAmount,
    chosenNumber,
    rolledNumber,
    payout,
    timestamp
  }));
};

/**
 * Format planck value to human-readable Westend (WND) string
 */
export const formatWND = (value) => {
  return parseFloat(
    formatBalance(value, { decimals: 12, withUnit: false })
  ).toFixed(4);
};

/**
 * Listen for contract events and invoke callback on matches
 * @param {ContractPromise} contract
 * @param {string} account
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export const listenForEvents = (contract, account, callback) => {
  const unsubs = [];

  // BetPlaced(account, amount, chosenNumber)
  const bp = contract.events.BetPlaced(({ args }) => {
    const [player, amount, chosenNumber] = args;
    if (player.toString() === account) {
      callback('betPlaced', { amount: formatWND(amount), chosenNumber });
    }
  });
  unsubs.push(bp);

  // DiceRolled(account, rolledNumber)
  const dr = contract.events.DiceRolled(({ args }) => {
    const [player, rolledNumber] = args;
    if (player.toString() === account) {
      callback('rolled', { rolledNumber: rolledNumber.toNumber() });
    }
  });
  unsubs.push(dr);

  // PayoutSent(account, amount)
  const ps = contract.events.PayoutSent(({ args }) => {
    const [player, amount] = args;
    if (player.toString() === account) {
      callback('payout', { amount: formatWND(amount) });
    }
  });
  unsubs.push(ps);

  return () => {
    unsubs.forEach((u) => u && u());
  };
};
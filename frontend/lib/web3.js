import { ethers } from "ethers";

const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "";
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY";

// Simplified contract ABI
const ORACLE_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function getBalance(address user) external view returns (uint256)",
  "function setTrigger(bytes32 encryptedTriggerHash) external",
  "function clearTrigger() external",
  "function getLatestPrice(bytes32 assetId) external view returns (int64 price, uint64 timestamp, bool isAnomalous)",
];

let provider;
let signer;
let contract;

/**
 * Connect wallet
 */
export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed");
  }

  // Request account access
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  // Initialize provider and signer
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  // Initialize contract
  if (ORACLE_ADDRESS) {
    contract = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, signer);
  }

  return accounts[0];
}

/**
 * Get current wallet address
 */
export async function getAddress() {
  if (!signer) {
    throw new Error("Wallet not connected");
  }
  return await signer.getAddress();
}

/**
 * Get user balance in contract
 */
export async function getBalance() {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const address = await getAddress();
  const balance = await contract.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Deposit funds
 */
export async function deposit(amount) {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const tx = await contract.deposit({
    value: ethers.parseEther(amount),
  });

  await tx.wait();
  return tx.hash;
}

/**
 * Withdraw funds
 */
export async function withdraw(amount) {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const tx = await contract.withdraw(ethers.parseEther(amount));
  await tx.wait();
  return tx.hash;
}

/**
 * Set trigger
 */
export async function setTrigger(triggerData) {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  // In production, this would encrypt with Lit Protocol
  // For demo, we'll just hash the trigger data
  const hash = ethers.id(triggerData);

  const tx = await contract.setTrigger(hash);
  await tx.wait();
  return hash;
}

/**
 * Clear trigger
 */
export async function clearTrigger() {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const tx = await contract.clearTrigger();
  await tx.wait();
  return tx.hash;
}

/**
 * Get latest price from contract
 */
export async function getLatestPrice(asset = "BTC/USD") {
  if (!contract) {
    // Use read-only provider
    provider = new ethers.JsonRpcProvider(RPC_URL);
    contract = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);
  }

  const assetId = ethers.id(asset);
  const priceData = await contract.getLatestPrice(assetId);

  return {
    price: Number(priceData[0]) / 1e8,
    timestamp: Number(priceData[1]),
    isAnomalous: priceData[2],
  };
}

/**
 * Listen for events
 */
export function listenToEvents(eventName, callback) {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  contract.on(eventName, callback);

  // Return unsubscribe function
  return () => {
    contract.off(eventName, callback);
  };
}

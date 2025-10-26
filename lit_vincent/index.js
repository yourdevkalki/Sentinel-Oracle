// Sentinel Oracle Stop-Loss Ability
// For Vincent Framework

import { ethers } from "ethers";

export class StopLossAbility {
  constructor(config) {
    this.contractAddress = config.contractAddress;
    this.contractAbi = config.contractAbi || [
      "function executeAction(address user, bytes32 assetId, uint8 actionType, uint256 amount) external",
      "function getLatestPrice(bytes32 assetId) external view returns (uint256 price, uint256 timestamp, bool isAnomalous)",
      "function userBalances(address user) external view returns (uint256)",
    ];
    this.provider = new ethers.JsonRpcProvider(
      config.rpcUrl || "https://sepolia.infura.io/v3/YOUR_KEY"
    );
  }

  /**
   * Check if the ability can execute based on current conditions
   * @param {string} userAddress - User's wallet address
   * @param {object} triggerCondition - Encrypted trigger condition
   * @returns {boolean} - Whether execution is allowed
   */
  async canExecute(userAddress, triggerCondition) {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractAbi,
        this.provider
      );

      // Check user has balance
      const balance = await contract.userBalances(userAddress);
      if (balance === 0n) {
        console.log("User has no balance");
        return false;
      }

      // Check anomaly is flagged
      const assetId =
        triggerCondition.assetId || ethers.encodeBytes32String("BTC/USD");
      const [price, timestamp, isAnomalous] = await contract.getLatestPrice(
        assetId
      );

      if (!isAnomalous) {
        console.log("No anomaly detected");
        return false;
      }

      // Check threshold met
      const priceDropPercent = triggerCondition.threshold || 0.08; // 8% default
      // Additional price checking logic here

      console.log(
        `✅ Can execute: Balance=${balance}, Anomalous=${isAnomalous}`
      );
      return true;
    } catch (error) {
      console.error("Error checking execution conditions:", error);
      return false;
    }
  }

  /**
   * Execute the stop-loss ability
   * @param {ethers.Wallet} wallet - Executor wallet (Vincent executor)
   * @param {string} userAddress - User's wallet address
   * @param {object} triggerCondition - Decrypted trigger condition
   * @returns {object} - Execution result
   */
  async execute(wallet, userAddress, triggerCondition) {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractAbi,
        wallet
      );

      // Get user balance
      const balance = await contract.userBalances(userAddress);

      // Execute stop-loss (transfer 50% of balance to safety)
      const amount = balance / 2n;
      const assetId =
        triggerCondition.assetId || ethers.encodeBytes32String("BTC/USD");
      const actionType = 1; // STOP_LOSS action

      console.log(`🚀 Executing stop-loss for ${userAddress}`);
      console.log(`   Amount: ${ethers.formatEther(amount)} ETH`);

      const tx = await contract.executeAction(
        userAddress,
        assetId,
        actionType,
        amount
      );

      const receipt = await tx.wait();

      console.log(`✅ Stop-loss executed successfully`);
      console.log(`   TX Hash: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        amount: amount.toString(),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("❌ Error executing ability:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get ability metadata
   */
  getMetadata() {
    return {
      name: "StopLossAbility",
      description: "Automated stop-loss protection for DeFi positions",
      version: "1.0.0",
      author: "Sentinel Oracle",
      category: "DeFi Protection",
      tags: ["stop-loss", "defi", "protection", "automation"],
    };
  }
}

export default StopLossAbility;
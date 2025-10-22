/**
 * Vincent App - Stop Loss Ability
 * DeFi automation ability for Sentinel Oracle
 *
 * This is a reference implementation. For actual Vincent deployment,
 * follow the official Vincent quickstart: https://docs.heyvincent.ai/app/quickstart
 */

const { ethers } = require("ethers");
require("dotenv").config();

/**
 * StopLossAbility
 * Executes automated stop-loss when conditions are met
 */
class StopLossAbility {
  constructor(providerUrl, sentinelOracleAddress) {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.oracleAddress = sentinelOracleAddress;
  }

  /**
   * Check if ability can be executed
   * @param {string} userAddress - User's address
   * @param {Object} triggerCondition - Decrypted trigger condition
   * @returns {boolean} Whether ability can execute
   */
  async canExecute(userAddress, triggerCondition) {
    // Check conditions from trigger
    // Example: { asset: "BTC/USD", type: "STOP_LOSS", threshold: 0.08 }

    console.log("🔍 Checking execution conditions...");
    console.log("User:", userAddress);
    console.log("Trigger:", triggerCondition);

    // In production, this would check:
    // 1. Price meets threshold
    // 2. Anomaly is flagged
    // 3. User has sufficient balance
    // 4. No cooldown active

    return true;
  }

  /**
   * Execute the ability
   * @param {Object} wallet - Executor wallet (Vincent executor)
   * @param {string} userAddress - User whose trigger is being executed
   * @param {Object} triggerCondition - Trigger parameters
   */
  async execute(wallet, userAddress, triggerCondition) {
    try {
      console.log("🚀 Executing StopLossAbility...");

      // Load contract
      const contractABI = [
        "function executeAction(address user, bytes32 assetId, string calldata actionType, uint256 amount) external",
        "function getBalance(address user) external view returns (uint256)",
      ];

      const contract = new ethers.Contract(
        this.oracleAddress,
        contractABI,
        wallet
      );

      // Get user balance
      const balance = await contract.getBalance(userAddress);
      console.log(`User balance: ${ethers.formatEther(balance)} ETH`);

      if (balance === 0n) {
        console.log("⚠️  User has no balance, cannot execute");
        return false;
      }

      // Calculate amount to execute (e.g., 50% of balance for stop-loss)
      const executeAmount = balance / 2n;

      // Convert asset ID
      const assetId = ethers.id(triggerCondition.asset || "BTC/USD");

      // Execute action
      console.log(`📤 Sending transaction to execute action...`);
      console.log(`   Asset: ${triggerCondition.asset}`);
      console.log(`   Type: ${triggerCondition.type}`);
      console.log(`   Amount: ${ethers.formatEther(executeAmount)} ETH`);

      const tx = await contract.executeAction(
        userAddress,
        assetId,
        triggerCondition.type || "STOP_LOSS",
        executeAmount
      );

      console.log("Transaction hash:", tx.hash);

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log("✅ Action executed successfully!");
        return true;
      } else {
        console.log("❌ Transaction failed");
        return false;
      }
    } catch (error) {
      console.error("❌ Execution error:", error);
      return false;
    }
  }
}

/**
 * Vincent orchestrator
 * Listens for anomaly events and triggers Lit decryption + Vincent execution
 */
class VincentOrchestrator {
  constructor(litClient, stopLossAbility, executorWallet) {
    this.litClient = litClient;
    this.ability = stopLossAbility;
    this.executorWallet = executorWallet;
    this.processedEvents = new Set();
  }

  /**
   * Handle anomaly event
   * @param {Object} event - Anomaly event from contract
   * @param {Object} userTrigger - User's encrypted trigger data
   */
  async handleAnomalyEvent(event, userTrigger) {
    try {
      const eventId = `${event.transactionHash}-${event.logIndex}`;

      if (this.processedEvents.has(eventId)) {
        console.log("⏭️  Event already processed, skipping");
        return;
      }

      console.log("\n🚨 Anomaly detected! Processing trigger...");

      // Get auth signature for Lit
      const authSig = await this.litClient.getAuthSig(this.executorWallet);

      // Decrypt user's trigger condition
      const triggerCondition = await this.litClient.decryptTrigger(
        userTrigger.encryptedData,
        authSig
      );

      console.log("🔓 Trigger decrypted:", triggerCondition);

      // Check if ability can execute
      const canExecute = await this.ability.canExecute(
        userTrigger.userAddress,
        triggerCondition
      );

      if (!canExecute) {
        console.log("⛔ Conditions not met, cannot execute");
        return;
      }

      // Execute ability
      const success = await this.ability.execute(
        this.executorWallet,
        userTrigger.userAddress,
        triggerCondition
      );

      if (success) {
        this.processedEvents.add(eventId);
        console.log("✅ Trigger executed successfully!");
      }
    } catch (error) {
      console.error("❌ Error handling anomaly:", error);
    }
  }

  /**
   * Start listening for anomaly events
   * @param {Object} contract - Sentinel Oracle contract instance
   */
  async startListening(contract) {
    console.log("👂 Listening for anomaly events...");

    contract.on(
      "AnomalyFlagged",
      async (assetId, price, timestamp, reason, event) => {
        console.log("\n🔔 AnomalyFlagged Event:");
        console.log("  Asset:", assetId);
        console.log("  Price:", price.toString());
        console.log("  Reason:", reason);

        // In production, fetch user triggers from database/IPFS
        // For demo, simulate a user trigger
        const mockUserTrigger = {
          userAddress: "0x...", // User's address
          encryptedData: {
            // Encrypted trigger data
          },
        };

        // Handle the event
        // await this.handleAnomalyEvent(event, mockUserTrigger);
      }
    );

    console.log("✅ Orchestrator active and listening");
  }
}

module.exports = {
  StopLossAbility,
  VincentOrchestrator,
};

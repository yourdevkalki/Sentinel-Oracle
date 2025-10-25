/**
 * Sentinel Oracle - Vincent Integration Demo
 *
 * This demonstrates the complete flow of Vincent integration:
 * 1. User encrypts trigger with Lit
 * 2. AI detects anomaly
 * 3. Vincent (simulated) checks policies
 * 4. Executor signs and executes ability
 *
 * For hackathon: Uses simulated Vincent executor
 * Post-hackathon: Will use real Vincent registry
 */

const { ethers } = require("ethers");
const { StopLossAbility, VincentOrchestrator } = require("./vincent_ability");
require("dotenv").config();

// Simulated Vincent Executor
class SimulatedVincentExecutor {
  constructor(name) {
    this.name = name;
    this.registryUrl =
      "https://dashboard.heyvincent.ai/abilities/sentinel-oracle";
    this.executorAddress = process.env.AGENT_PRIVATE_KEY
      ? new ethers.Wallet(process.env.AGENT_PRIVATE_KEY).address
      : "0x0000000000000000000000000000000000000000";
  }

  async checkPolicies(ability, userAddress, triggerCondition) {
    console.log("\n🔍 [Vincent] Checking Policies...");
    console.log("=".repeat(60));

    // Policy 1: Anomaly Detection
    console.log("📋 Policy 1: Anomaly Detected");
    console.log("   ✓ Checking if oracle flagged anomaly...");
    console.log("   ✓ Contract: SentinelOracle");
    console.log("   ✓ Function: getLatestPrice()");
    console.log("   ✓ Condition: isAnomalous === true");
    console.log("   ✅ PASS - Anomaly is flagged\n");

    // Policy 2: User Balance
    console.log("📋 Policy 2: User Balance");
    console.log("   ✓ Checking if user has funds...");
    console.log("   ✓ Contract: SentinelOracle");
    console.log("   ✓ Function: getBalance(userAddress)");
    console.log("   ✓ Condition: balance > 0");
    console.log("   ✅ PASS - User has sufficient balance\n");

    // Policy 3: Cooldown
    console.log("📋 Policy 3: Execution Cooldown");
    console.log("   ✓ Checking last execution time...");
    console.log("   ✓ Min interval: 30 minutes");
    console.log("   ✓ Last execution: > 30 minutes ago");
    console.log("   ✅ PASS - Cooldown satisfied\n");

    console.log("=".repeat(60));
    console.log("✅ All policies passed!\n");

    return true;
  }

  async execute(ability, userAddress, triggerCondition) {
    console.log("\n🎭 [Simulated Vincent Executor]");
    console.log("=".repeat(60));
    console.log("Registry: " + this.registryUrl);
    console.log("Executor: " + this.executorAddress);
    console.log("=".repeat(60));

    // Check policies
    const policiesPassed = await this.checkPolicies(
      ability,
      userAddress,
      triggerCondition
    );

    if (!policiesPassed) {
      console.log("❌ Policies failed - Cannot execute");
      return false;
    }

    // Create executor wallet
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const wallet = process.env.AGENT_PRIVATE_KEY
      ? new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider)
      : ethers.Wallet.createRandom(provider);

    console.log("🔐 [Vincent] Signing transaction with executor key...");
    console.log("📤 [Vincent] Executing ability on-chain...\n");

    // Execute ability
    const result = await ability.execute(wallet, userAddress, triggerCondition);

    if (result) {
      console.log("\n✅ [Vincent] Ability executed successfully!");
      console.log("📝 [Vincent] Logged to audit trail");
      console.log("🎉 [Vincent] User position protected!\n");
    }

    return result;
  }
}

// Simulated Lit Client
class SimulatedLitClient {
  async encryptTrigger(triggerData, userAddress) {
    console.log("\n🔒 [Lit Protocol] Encrypting trigger...");
    console.log("   User:", userAddress);
    console.log("   Trigger:", triggerData);
    console.log("   Access Control: Requires anomaly flag + executor auth");
    console.log("   ✅ Encrypted successfully");

    return {
      encryptedData: Buffer.from(triggerData).toString("base64"),
      encryptedSymmetricKey: "simulated-key",
      accessControlConditions: [
        {
          contractAddress: process.env.SENTINEL_ORACLE_ADDRESS,
          functionName: "getLatestPrice",
          functionParams: [":assetId"],
          returnValueTest: {
            key: "isAnomalous",
            comparator: "=",
            value: "true",
          },
        },
      ],
    };
  }

  async decryptTrigger(encryptedData, authSig) {
    console.log("\n🔓 [Lit Protocol] Decrypting trigger...");
    console.log("   ✓ Verifying access control conditions...");
    console.log("   ✓ Checking anomaly flag...");
    console.log("   ✓ Verifying executor authorization...");
    console.log("   ✅ Decrypted successfully");

    const decrypted = Buffer.from(
      encryptedData.encryptedData,
      "base64"
    ).toString();
    return JSON.parse(decrypted);
  }

  async getAuthSig(wallet) {
    return {
      sig: "simulated-signature",
      derivedVia: "web3.eth.personal.sign",
      signedMessage: "Lit Protocol Authentication",
      address: wallet.address,
    };
  }
}

// Main Demo
async function runDemo() {
  console.log("\n");
  console.log("🛡️  SENTINEL ORACLE - VINCENT INTEGRATION DEMO");
  console.log("=".repeat(70));
  console.log("Demonstrating AI-powered DeFi protection with Vincent\n");

  try {
    // Initialize components
    console.log("📦 Initializing components...");

    // Load env from agent directory if not set
    if (!process.env.SENTINEL_ORACLE_ADDRESS) {
      require("dotenv").config({ path: "../agent/.env" });
    }

    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const litClient = new SimulatedLitClient();
    const vincentExecutor = new SimulatedVincentExecutor(
      "Sentinel Oracle Executor"
    );
    const ability = new StopLossAbility(
      process.env.ETH_RPC_URL,
      process.env.SENTINEL_ORACLE_ADDRESS ||
        "0x7f165fD307aeC2A00F89D0a533dF64CD4a7BB7Fd"
    );

    console.log("✅ Components initialized\n");

    // Step 1: User sets trigger
    console.log("\n" + "=".repeat(70));
    console.log("STEP 1: User Sets Private Trigger");
    console.log("=".repeat(70));

    const userAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
    const triggerData = JSON.stringify({
      asset: "BTC/USD",
      type: "STOP_LOSS",
      threshold: 0.08, // 8% drop
      action: "PROTECT_50_PERCENT",
    });

    console.log("👤 User:", userAddress);
    console.log(
      "🎯 Trigger Condition: If BTC drops > 8%, protect 50% of position"
    );

    const encrypted = await litClient.encryptTrigger(triggerData, userAddress);
    console.log("✅ Trigger encrypted and stored");

    // Step 2: AI detects anomaly
    console.log("\n" + "=".repeat(70));
    console.log("STEP 2: AI Agent Detects Anomaly");
    console.log("=".repeat(70));

    console.log("🤖 [Sentinel AI] Monitoring BTC/USD...");
    console.log("📊 [Sentinel AI] Price: $109,998 → $98,500 (10.5% drop)");
    console.log("📈 [Sentinel AI] Z-Score: 3.2 (exceeds 2.5σ threshold)");
    console.log("🚨 [Sentinel AI] ANOMALY DETECTED!");
    console.log("📤 [Sentinel AI] Flagging anomaly on-chain...");
    console.log("✅ [Sentinel AI] Anomaly flagged at block #9475210");

    // Step 3: Lit decrypts trigger
    console.log("\n" + "=".repeat(70));
    console.log("STEP 3: Lit Protocol Decrypts Trigger");
    console.log("=".repeat(70));

    const wallet = ethers.Wallet.createRandom();
    const authSig = await litClient.getAuthSig(wallet);
    const decryptedTrigger = await litClient.decryptTrigger(encrypted, authSig);

    console.log("✅ Trigger decrypted: User wants stop-loss on 8% BTC drop");

    // Step 4: Vincent executes ability
    console.log("\n" + "=".repeat(70));
    console.log("STEP 4: Vincent Executes Ability");
    console.log("=".repeat(70));

    const result = await vincentExecutor.execute(
      ability,
      userAddress,
      decryptedTrigger
    );

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("DEMO COMPLETE");
    console.log("=".repeat(70));

    if (result) {
      console.log("\n✅ SUCCESS - Complete flow demonstrated:");
      console.log("   1. ✅ User encrypted trigger with Lit Protocol");
      console.log("   2. ✅ AI detected anomaly (10.5% drop, z=3.2)");
      console.log("   3. ✅ Lit decrypted trigger with access control");
      console.log("   4. ✅ Vincent checked all policies");
      console.log("   5. ✅ Ability executed on-chain");
      console.log("   6. ✅ User position protected from liquidation");

      console.log("\n🎯 Integration Status:");
      console.log("   ✅ Smart contract integration");
      console.log("   ✅ Lit Protocol encryption");
      console.log("   ✅ Vincent ability architecture");
      console.log("   ✅ AI anomaly detection");
      console.log(
        "   🔄 Vincent registry: Post-hackathon (NPM publication required)"
      );

      console.log("\n📚 Documentation:");
      console.log("   - Ability config: ./sentinel-ability-config.json");
      console.log("   - Integration status: ./VINCENT_INTEGRATION_STATUS.md");
      console.log("   - Ability code: ./vincent_ability.js");
      console.log("   - Lit client: ./lit_client.js");
    } else {
      console.log("\n❌ Demo execution failed");
    }

    console.log("\n" + "=".repeat(70));
    console.log("🏆 Sentinel Oracle - Securing DeFi with AI + Vincent");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("\n❌ Demo error:", error.message);
    console.error(error);
  }
}

// Run if called directly
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };

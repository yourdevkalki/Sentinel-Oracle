const hre = require("hardhat");
require("dotenv").config();

/**
 * Demo Simulation Script
 * Creates a price anomaly for demonstration purposes
 * This script will push prices that trigger the AI agent's anomaly detection
 */

async function main() {
  console.log("🎬 Starting Anomaly Simulation\n");

  const contractAddress = process.env.SENTINEL_ORACLE_ADDRESS;

  if (!contractAddress) {
    console.error("❌ SENTINEL_ORACLE_ADDRESS not set in .env");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("🔑 Using account:", signer.address);

  // Load contract
  const SentinelOracle = await hre.ethers.getContractFactory("SentinelOracle");
  const contract = SentinelOracle.attach(contractAddress);

  const assetId = hre.ethers.id("BTC/USD");
  console.log("📊 Asset ID:", assetId);
  console.log("📡 Contract:", contractAddress);
  console.log("\n");

  // Phase 1: Push normal prices (baseline)
  console.log("📈 Phase 1: Establishing baseline with normal prices...\n");

  const basePrice = 65000; // $65,000 BTC
  const normalVariance = 100; // $100 variance

  for (let i = 0; i < 10; i++) {
    const price = basePrice + (Math.random() - 0.5) * normalVariance * 2;
    const priceScaled = Math.floor(price * 1e8);
    const confScaled = Math.floor(price * 0.001 * 1e8);

    console.log(`  Update ${i + 1}/10: $${price.toFixed(2)}`);

    const tx = await contract.updatePrice(assetId, priceScaled, confScaled);
    await tx.wait();

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("✅ Baseline established\n");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Phase 2: Create sudden price drop (anomaly)
  console.log("🚨 Phase 2: Simulating sudden price drop (>8%)...\n");

  const anomalousPrice = basePrice * 0.9; // 10% drop
  const anomalousPriceScaled = Math.floor(anomalousPrice * 1e8);
  const anomalousConfScaled = Math.floor(anomalousPrice * 0.001 * 1e8);

  console.log(
    `  💥 ANOMALOUS PRICE: $${anomalousPrice.toFixed(2)} (${(
      ((anomalousPrice - basePrice) / basePrice) *
      100
    ).toFixed(2)}% drop)`
  );

  const tx1 = await contract.updatePrice(
    assetId,
    anomalousPriceScaled,
    anomalousConfScaled
  );
  await tx1.wait();

  console.log("  ✅ Anomalous price pushed\n");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Push another anomalous price to ensure detection
  const anomalousPrice2 = basePrice * 0.89;
  const anomalousPrice2Scaled = Math.floor(anomalousPrice2 * 1e8);

  console.log(`  💥 SECOND ANOMALY: $${anomalousPrice2.toFixed(2)}`);

  const tx2 = await contract.updatePrice(
    assetId,
    anomalousPrice2Scaled,
    anomalousConfScaled
  );
  await tx2.wait();

  console.log("  ✅ Second anomalous price pushed\n");

  // Phase 3: Wait for AI agent detection
  console.log("⏳ Phase 3: Waiting for AI agent to detect anomaly...");
  console.log(
    "   (If agent is running, it should flag this within 5-10 seconds)\n"
  );

  // Check if anomaly was flagged
  for (let i = 0; i < 12; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const priceData = await contract.getLatestPrice(assetId);
    const isAnomalous = priceData[2];

    if (isAnomalous) {
      console.log("✅ ANOMALY DETECTED BY AI AGENT!");
      console.log("   Agent has successfully flagged the price anomaly.\n");
      break;
    }

    if (i === 11) {
      console.log("⚠️  Anomaly not yet flagged by agent.");
      console.log(
        "   Make sure the AI agent is running: cd agent && python agent.py\n"
      );
    } else {
      process.stdout.write(`   Checking... (${i + 1}/12)\r`);
    }
  }

  // Phase 4: Return to normal
  console.log("📉 Phase 4: Returning prices to normal range...\n");

  const recoveryPrice = basePrice * 0.98;
  const recoveryPriceScaled = Math.floor(recoveryPrice * 1e8);

  console.log(`  Recovery price: $${recoveryPrice.toFixed(2)}`);

  const tx3 = await contract.updatePrice(
    assetId,
    recoveryPriceScaled,
    anomalousConfScaled
  );
  await tx3.wait();

  console.log("  ✅ Recovery price pushed\n");

  console.log("🎉 Simulation complete!\n");
  console.log("================================================");
  console.log("📋 Summary");
  console.log("================================================");
  console.log("✅ Baseline prices pushed (10 samples)");
  console.log("✅ Anomaly simulated (10% drop)");
  console.log("✅ Check your AI agent logs for detection");
  console.log("✅ Check frontend dashboard for visualization");
  console.log("================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

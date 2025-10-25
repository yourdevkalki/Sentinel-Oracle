const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Deploy SentinelOracle with proper Pyth Pull Oracle integration
 * Per Pyth qualification requirements
 */

// Pyth contract addresses on different networks
const PYTH_CONTRACT_ADDRESSES = {
  // Ethereum Sepolia
  11155111: "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21",

  // Base Sepolia
  84532: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",

  // For local testing (if you deploy mock)
  31337: "0x0000000000000000000000000000000000000000",
};

// Pyth Price Feed IDs
const PYTH_PRICE_IDS = {
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  AVAX: "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7",
  MATIC: "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52",
};

async function main() {
  console.log("\n🛡️  Sentinel Oracle - Pyth Pull Oracle Integration");
  console.log("═".repeat(70));
  console.log("📋 Deploying with OFFICIAL Pyth Pull Oracle method");
  console.log("═".repeat(70), "\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", chainId);

  // Get Pyth contract address for this network
  const pythContractAddress = PYTH_CONTRACT_ADDRESSES[chainId];
  if (
    !pythContractAddress ||
    pythContractAddress === "0x0000000000000000000000000000000000000000"
  ) {
    console.error("\n❌ Pyth contract address not configured for this network");
    console.log(
      "💡 Please add the Pyth contract address for chain ID:",
      chainId
    );
    console.log(
      "📖 Check: https://docs.pyth.network/price-feeds/contract-addresses/evm"
    );
    process.exit(1);
  }

  console.log("📍 Pyth Contract:", pythContractAddress);

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("\n👤 Deployer:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("\n❌ Insufficient balance");
    console.log("💡 Get testnet ETH from a faucet");
    process.exit(1);
  }

  // Deploy contract
  console.log("\n📦 Deploying SentinelOracle...");
  console.log("   Constructor args: pythContract =", pythContractAddress);

  const SentinelOracle = await hre.ethers.getContractFactory("SentinelOracle");
  const oracle = await SentinelOracle.deploy(pythContractAddress);

  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();

  console.log("✅ SentinelOracle deployed to:", oracleAddress);

  // Configure assets
  console.log("\n⚙️  Configuring assets...");

  const assets = [
    {
      symbol: "BTC/USD",
      pythId: PYTH_PRICE_IDS.BTC,
    },
    {
      symbol: "ETH/USD",
      pythId: PYTH_PRICE_IDS.ETH,
    },
    {
      symbol: "SOL/USD",
      pythId: PYTH_PRICE_IDS.SOL,
    },
    {
      symbol: "AVAX/USD",
      pythId: PYTH_PRICE_IDS.AVAX,
    },
    {
      symbol: "MATIC/USD",
      pythId: PYTH_PRICE_IDS.MATIC,
    },
  ];

  for (const asset of assets) {
    const assetId = hre.ethers.id(asset.symbol);
    console.log(`   Adding ${asset.symbol}...`);

    const tx = await oracle.addSupportedAsset(
      assetId,
      asset.pythId,
      asset.symbol
    );
    await tx.wait();

    console.log(`   ✅ ${asset.symbol} configured`);
  }

  // Set AI agent address if provided
  const aiAgentAddress = process.env.AI_AGENT_ADDRESS;
  if (aiAgentAddress) {
    console.log("\n🤖 Setting AI agent address...");
    const tx = await oracle.setAIAgent(aiAgentAddress);
    await tx.wait();
    console.log("✅ AI agent set to:", aiAgentAddress);
  } else {
    console.log("\n⚠️  AI_AGENT_ADDRESS not set in .env");
    console.log("💡 You'll need to call setAIAgent() later");
  }

  // Set Vincent executor if provided
  const vincentExecutor = process.env.VINCENT_EXECUTOR_ADDRESS;
  if (vincentExecutor) {
    console.log("\n🔐 Setting Vincent executor...");
    const tx = await oracle.setVincentExecutor(vincentExecutor);
    await tx.wait();
    console.log("✅ Vincent executor set to:", vincentExecutor);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: chainId,
    sentinelOracle: oracleAddress,
    pythContract: pythContractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    assets: assets,
    aiAgent: aiAgentAddress || "Not set",
    vincentExecutor: vincentExecutor || "Not set",
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  // Also save as latest
  const latestPath = path.join(deploymentsDir, `${network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:");
  console.log("   ", filepath);
  console.log("   ", latestPath);

  // Print next steps
  console.log("\n" + "═".repeat(70));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("═".repeat(70));

  console.log("\n📝 Next Steps:");
  console.log("\n1️⃣  Update .env files:");
  console.log(`   SENTINEL_ORACLE_ADDRESS=${oracleAddress}`);

  console.log("\n2️⃣  If AI agent address was not set, run:");
  console.log(`   await oracle.setAIAgent("YOUR_AGENT_ADDRESS")`);

  console.log("\n3️⃣  Start the price pusher:");
  console.log(`   node scripts/updatePythPricePull.js`);

  console.log("\n4️⃣  Verify contract on Etherscan (optional):");
  console.log(
    `   npx hardhat verify --network ${network.name} ${oracleAddress} ${pythContractAddress}`
  );

  console.log("\n📖 Contract Details:");
  console.log(`   Address: ${oracleAddress}`);
  console.log(`   Pyth Contract: ${pythContractAddress}`);
  console.log(
    `   Assets: ${assets.length} configured (${assets
      .map((a) => a.symbol.split("/")[0])
      .join(", ")})`
  );

  console.log("\n✅ Ready for Pyth qualification!");
  console.log("   ✅ Uses Pyth Pull Oracle method (updatePriceFeeds)");
  console.log("   ✅ Fetches data from Hermes");
  console.log("   ✅ Updates and consumes prices on-chain");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error);
    process.exit(1);
  });

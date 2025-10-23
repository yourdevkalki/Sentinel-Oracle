const hre = require("hardhat");
require("dotenv").config();

/**
 * Script to add supported assets to the deployed SentinelOracle contract
 */

const CONTRACT_ADDRESS =
  process.env.SENTINEL_ORACLE_ADDRESS ||
  "0x516f96811D3C93E8a391109198514152E3918238";

const SUPPORTED_ASSETS = [
  "BTC/USD",
  "ETH/USD",
  "SOL/USD",
  "AVAX/USD",
  "MATIC/USD",
];

async function main() {
  console.log("🔧 Adding supported assets to SentinelOracle contract...");
  console.log("Contract address:", CONTRACT_ADDRESS);

  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);

  // Load contract
  const SentinelOracle = await hre.ethers.getContractFactory("SentinelOracle");
  const contract = SentinelOracle.attach(CONTRACT_ADDRESS);

  console.log("\n📊 Adding assets to contract...");

  for (const assetSymbol of SUPPORTED_ASSETS) {
    try {
      const assetId = hre.ethers.id(assetSymbol);

      console.log(`\nAdding ${assetSymbol}...`);
      console.log(`Asset ID: ${assetId}`);

      // Check if asset already exists
      const existingSymbol = await contract.getAssetSymbol(assetId);
      if (existingSymbol !== "") {
        console.log(`✅ ${assetSymbol} already exists, skipping`);
        continue;
      }

      // Add the asset
      const tx = await contract.addSupportedAsset(assetId, assetSymbol);
      console.log(`📤 Transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log(`✅ ${assetSymbol} added successfully!`);
    } catch (error) {
      console.error(`❌ Error adding ${assetSymbol}:`, error.message);
    }
  }

  // Verify all assets were added
  console.log("\n🔍 Verifying added assets...");

  const assetCount = await contract.getSupportedAssetCount();
  console.log(`Total supported assets: ${assetCount}`);

  const supportedAssets = await contract.getSupportedAssets();
  console.log("Supported asset IDs:");
  supportedAssets.forEach((assetId, index) => {
    console.log(`  ${index + 1}. ${assetId}`);
  });

  console.log("\n✅ Asset setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

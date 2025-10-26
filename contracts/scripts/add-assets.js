const hre = require("hardhat");
require("dotenv").config();

/**
 * Script to add supported assets to the deployed SentinelOracle contract
 */

const CONTRACT_ADDRESS =
  process.env.SENTINEL_ORACLE_ADDRESS ||
  "0x516f96811D3C93E8a391109198514152E3918238";

const SUPPORTED_ASSETS = [
  {
    symbol: "BTC/USD",
    pythId:
      "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  },
  {
    symbol: "ETH/USD",
    pythId:
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  },
  {
    symbol: "SOL/USD",
    pythId:
      "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  },
  {
    symbol: "AVAX/USD",
    pythId:
      "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7",
  },
  {
    symbol: "LINK/USD",
    pythId:
      "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221",
  },
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

  for (const asset of SUPPORTED_ASSETS) {
    try {
      const assetId = hre.ethers.id(asset.symbol);

      console.log(`\nAdding ${asset.symbol}...`);
      console.log(`Asset ID: ${assetId}`);
      console.log(`Pyth ID: ${asset.pythId}`);

      // Check if asset already exists
      const existingSymbol = await contract.getAssetSymbol(assetId);
      if (existingSymbol !== "") {
        console.log(`✅ ${asset.symbol} already exists, skipping`);
        continue;
      }

      // Add the asset with Pyth price ID
      const tx = await contract.addSupportedAsset(
        assetId,
        asset.pythId,
        asset.symbol
      );
      console.log(`📤 Transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log(`✅ ${asset.symbol} added successfully!`);
    } catch (error) {
      console.error(`❌ Error adding ${asset.symbol}:`, error.message);
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

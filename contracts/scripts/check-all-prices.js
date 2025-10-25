const hre = require("hardhat");

async function main() {
  const contractAddr =
    process.env.SENTINEL_ORACLE_ADDRESS ||
    "0x7f165fD307aeC2A00F89D0a533dF64CD4a7BB7Fd";
  const contract = await hre.ethers.getContractAt(
    "SentinelOracle",
    contractAddr
  );

  const assets = ["BTC/USD", "ETH/USD", "SOL/USD", "AVAX/USD", "LINK/USD"];

  console.log("\n📊 Checking all asset prices on Sepolia network...");
  console.log("Contract:", contractAddr);

  const network = await hre.ethers.provider.getNetwork();
  console.log(
    "Network:",
    network.name,
    "- Chain ID:",
    network.chainId.toString()
  );
  console.log("=" * 60);

  for (const asset of assets) {
    const assetId = hre.ethers.id(asset);
    console.log(`\n🔍 Checking ${asset}...`);
    console.log(`Asset ID: ${assetId}`);

    try {
      const priceData = await contract.getLatestPrice(assetId);
      const price = Number(priceData[0]) / 1e8;
      const timestamp = new Date(Number(priceData[1]) * 1000).toISOString();
      const isAnomalous = priceData[2];

      console.log(`✅ Price: $${price.toFixed(2)} USD`);
      console.log(`✅ Timestamp: ${timestamp}`);
      console.log(`✅ Is Anomalous: ${isAnomalous}`);
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
      console.log(`   No price data available for ${asset}`);
    }
  }
}

main().catch(console.error);

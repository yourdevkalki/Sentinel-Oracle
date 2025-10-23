const hre = require("hardhat");

async function main() {
  const contractAddr =
    process.env.SENTINEL_ORACLE_ADDRESS ||
    "0x7f165fD307aeC2A00F89D0a533dF64CD4a7BB7Fd";
  const contract = await hre.ethers.getContractAt(
    "SentinelOracle",
    contractAddr
  );

  const assetId = hre.ethers.id("BTC/USD");
  console.log("\n📊 Checking price on network...");
  console.log("Contract:", contractAddr);
  console.log("Asset ID:", assetId);

  const network = await hre.ethers.provider.getNetwork();
  console.log(
    "Network:",
    network.name,
    "- Chain ID:",
    network.chainId.toString()
  );

  try {
    const priceData = await contract.getLatestPrice(assetId);
    console.log("\n✅ Price:", Number(priceData[0]) / 1e8, "USD");
    console.log(
      "✅ Timestamp:",
      new Date(Number(priceData[1]) * 1000).toISOString()
    );
    console.log("✅ Is Anomalous:", priceData[2]);
  } catch (e) {
    console.log("\n❌ Error:", e.message);
    console.log(
      "This means no price has been written to the contract yet on this network."
    );
  }
}

main().catch(console.error);

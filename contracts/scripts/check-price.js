const hre = require("hardhat");

async function main() {
  const contractAddr = "0x516f96811D3C93E8a391109198514152E3918238";
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

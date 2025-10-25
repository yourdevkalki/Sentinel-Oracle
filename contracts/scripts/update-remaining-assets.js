const hre = require("hardhat");

async function main() {
  const contractAddr = "0x7f165fD307aeC2A00F89D0a533dF64CD4a7BB7Fd";

  console.log("🔧 Manually updating ETH and MATIC prices...");

  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);

  const contract = await hre.ethers.getContractAt(
    "SentinelOracle",
    contractAddr
  );

  // Update ETH/USD
  const ethAssetId = hre.ethers.id("ETH/USD");
  const ethPrice = 3850 * 1e8; // 3850 USD
  const ethConfidence = 10 * 1e8; // 10 USD confidence

  console.log(`\n📊 Updating ETH/USD price to $${ethPrice / 1e8}`);

  try {
    const ethTx = await contract.updatePrice(
      ethAssetId,
      ethPrice,
      ethConfidence
    );
    console.log("📤 ETH Transaction sent:", ethTx.hash);
    await ethTx.wait();
    console.log("✅ ETH price updated");
  } catch (error) {
    console.error("❌ Error updating ETH:", error.message);
  }

  // Wait a moment to avoid replacement transaction issues
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Update MATIC/USD
  const maticAssetId = hre.ethers.id("MATIC/USD");
  const maticPrice = 0.8 * 1e8; // 0.8 USD
  const maticConfidence = 0.01 * 1e8; // 0.01 USD confidence

  console.log(`\n📊 Updating MATIC/USD price to $${maticPrice / 1e8}`);

  try {
    const maticTx = await contract.updatePrice(
      maticAssetId,
      maticPrice,
      maticConfidence
    );
    console.log("📤 MATIC Transaction sent:", maticTx.hash);
    await maticTx.wait();
    console.log("✅ MATIC price updated");
  } catch (error) {
    console.error("❌ Error updating MATIC:", error.message);
  }

  console.log("\n🎉 Manual updates complete!");
}

main().catch(console.error);

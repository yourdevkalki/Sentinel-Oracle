const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Sentinel Oracle...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy SentinelOracle
  console.log("Deploying SentinelOracle contract...");
  const SentinelOracle = await hre.ethers.getContractFactory("SentinelOracle");
  const sentinelOracle = await SentinelOracle.deploy();

  await sentinelOracle.waitForDeployment();
  const oracleAddress = await sentinelOracle.getAddress();

  console.log("✅ SentinelOracle deployed to:", oracleAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    sentinelOracle: oracleAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save latest deployment
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to:", filename);

  // Update .env file with contract address
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");

    if (envContent.includes("SENTINEL_ORACLE_ADDRESS=")) {
      envContent = envContent.replace(
        /SENTINEL_ORACLE_ADDRESS=.*/,
        `SENTINEL_ORACLE_ADDRESS=${oracleAddress}`
      );
    } else {
      envContent += `\nSENTINEL_ORACLE_ADDRESS=${oracleAddress}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("✅ Updated .env with contract address\n");
  }

  console.log("================================================");
  console.log("📋 Deployment Summary");
  console.log("================================================");
  console.log("Network:", hre.network.name);
  console.log("SentinelOracle:", oracleAddress);
  console.log("Deployer:", deployer.address);
  console.log("================================================\n");

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📝 To verify the contract, run:");
    console.log(
      `npx hardhat verify --network ${hre.network.name} ${oracleAddress}`
    );
    console.log();
  }

  console.log("🎉 Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

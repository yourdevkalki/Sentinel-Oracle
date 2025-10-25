const hre = require("hardhat");
const axios = require("axios");
require("dotenv").config();

/**
 * Proper Pyth Pull Oracle Price Pusher
 * Implements the OFFICIAL Pyth qualification requirements:
 * 1. Fetch price update data from Hermes
 * 2. Call updatePriceFeeds(bytes[]) on-chain
 * 3. Consume the price
 */

// Pyth Price Feed IDs (Mainnet IDs work on testnets)
// Verified working IDs from Pyth Network
const PYTH_PRICE_IDS = {
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", // SOL/USD
  AVAX: "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7", // AVAX/USD
  // MATIC removed - causing 404 errors on Hermes
  // Use LINK instead
  LINK: "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221", // LINK/USD
};

// Our internal asset IDs
const ASSET_CONFIG = {
  BTC: {
    symbol: "BTC/USD",
    pythId: PYTH_PRICE_IDS.BTC,
  },
  ETH: {
    symbol: "ETH/USD",
    pythId: PYTH_PRICE_IDS.ETH,
  },
  SOL: {
    symbol: "SOL/USD",
    pythId: PYTH_PRICE_IDS.SOL,
  },
  AVAX: {
    symbol: "AVAX/USD",
    pythId: PYTH_PRICE_IDS.AVAX,
  },
  LINK: {
    symbol: "LINK/USD",
    pythId: PYTH_PRICE_IDS.LINK,
  },
};

const HERMES_URL = process.env.PYTH_HERMES_URL || "https://hermes.pyth.network";
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL || "5000"); // 5 seconds

class PythPullPricePusher {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    this.contract = null;
    this.signer = null;
    this.isRunning = false;
  }

  async initialize() {
    [this.signer] = await hre.ethers.getSigners();
    console.log("🔑 Using account:", this.signer.address);
    console.log(
      "💰 Balance:",
      hre.ethers.formatEther(
        await hre.ethers.provider.getBalance(this.signer.address)
      ),
      "ETH\n"
    );

    // Load contract
    const SentinelOracle = await hre.ethers.getContractFactory(
      "SentinelOracle"
    );
    this.contract = SentinelOracle.attach(this.contractAddress);

    console.log("📡 Connected to SentinelOracle at:", this.contractAddress);

    // Check if contract has Pyth interface
    try {
      const pythAddress = await this.contract.pyth();
      console.log("✅ Pyth contract configured at:", pythAddress);
    } catch (error) {
      console.warn("⚠️  Contract may not have Pyth integration");
    }

    console.log("✅ Initialization complete\n");
  }

  /**
   * Fetch price update data from Hermes (Step 1 of Pyth requirements)
   * This returns the actual VAA bytes that need to be submitted on-chain
   */
  async fetchPriceUpdateData(priceIds) {
    try {
      console.log(`📡 Fetching price update data from Hermes...`);

      // Official Pyth documentation method:
      // https://docs.pyth.network/price-feeds/core/fetch-price-updates
      // GET https://hermes.pyth.network/v2/updates/price/latest?ids[]=<id1>&ids[]=<id2>

      const params = new URLSearchParams();
      priceIds.forEach((id) => {
        params.append("ids[]", id);
      });

      const url = `${HERMES_URL}/v2/updates/price/latest?${params.toString()}`;

      console.log(`   URL: ${HERMES_URL}/v2/updates/price/latest`);
      console.log(`   Price IDs: ${priceIds.length} feeds`);

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          Accept: "application/json",
        },
      });

      // Response format from Pyth docs:
      // {
      //   "binary": {
      //     "encoding": "hex",
      //     "data": ["0x...", "0x..."]
      //   },
      //   "parsed": [...]
      // }

      if (response.data && response.data.binary && response.data.binary.data) {
        console.log(
          `✅ Received ${response.data.binary.data.length} price updates from Hermes`
        );

        // Hermes returns hex-encoded VAA data with 0x prefix
        const priceUpdateData = response.data.binary.data;

        // Ensure all have 0x prefix
        return priceUpdateData.map((vaa) => {
          return vaa.startsWith("0x") ? vaa : `0x${vaa}`;
        });
      }

      throw new Error("Invalid response from Hermes");
    } catch (error) {
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        console.error("❌ Hermes request timed out");
      } else if (error.response) {
        console.error(
          "❌ Hermes error:",
          error.response.status,
          error.response.statusText
        );
        if (error.response.data) {
          console.error("   Response:", JSON.stringify(error.response.data));
        }
      } else {
        console.error("❌ Error fetching from Hermes:", error.message);
      }
      throw error;
    }
  }

  /**
   * Get the latest prices to display (optional, for logging)
   */
  async fetchLatestPrices(priceIds) {
    try {
      const response = await axios.get(`${HERMES_URL}/api/latest_price_feeds`, {
        params: {
          ids: priceIds,
        },
        timeout: 5000,
      });

      if (response.data && Array.isArray(response.data)) {
        return response.data.map((feed) => ({
          id: feed.id,
          price: feed.price.price,
          expo: feed.price.expo,
          conf: feed.price.conf,
          publishTime: feed.price.publish_time,
        }));
      }

      return [];
    } catch (error) {
      console.warn("⚠️  Could not fetch prices for display");
      return [];
    }
  }

  /**
   * Update prices on-chain using Pyth Pull method (Step 2 of requirements)
   */
  async updatePricesOnChain(priceUpdateData) {
    try {
      console.log("\n📤 Updating prices on-chain...");

      // Get the fee required
      const updateFee = await this.contract.pyth.getUpdateFee(priceUpdateData);
      console.log(`   Fee required: ${hre.ethers.formatEther(updateFee)} ETH`);

      // Call updatePriceFeeds with the price update data
      const tx = await this.contract.updatePriceFeeds(priceUpdateData, {
        value: updateFee,
        gasLimit: 500000, // Sufficient for multiple price updates
      });

      console.log(`   Transaction hash: ${tx.hash}`);
      console.log("   Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(
          `✅ Prices updated on-chain (Block: ${receipt.blockNumber})`
        );
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
        return true;
      } else {
        console.error("❌ Transaction failed");
        return false;
      }
    } catch (error) {
      if (error.code === "INSUFFICIENT_FUNDS") {
        console.error("❌ Insufficient funds for transaction");
      } else if (error.message.includes("execution reverted")) {
        console.error("❌ Transaction reverted:", error.message);
      } else {
        console.error("❌ Error updating prices:", error.message);
      }
      return false;
    }
  }

  /**
   * Update stored prices for quick access (Step 3 of requirements - consume the price)
   */
  async updateStoredPrices() {
    try {
      console.log("\n💾 Updating stored prices in contract...");

      // Update each asset individually
      for (const asset of Object.values(ASSET_CONFIG)) {
        try {
          const assetId = hre.ethers.id(asset.symbol);
          const tx = await this.contract.updateStoredPrice(assetId, {
            gasLimit: 200000,
          });
          await tx.wait();
          console.log(`   ✅ ${asset.symbol} stored`);
        } catch (error) {
          // Asset might already be up-to-date or not configured
          console.log(`   ⚠️  ${asset.symbol} skipped`);
        }
      }

      return true;
    } catch (error) {
      console.warn("⚠️  Could not update stored prices:", error.message);
      return false;
    }
  }

  /**
   * Display current prices
   */
  async displayPrices(assets) {
    console.log("\n📊 Current Prices:");
    console.log("─".repeat(60));

    for (const [key, config] of Object.entries(assets)) {
      try {
        const assetId = hre.ethers.id(config.symbol);
        const [price, timestamp, isAnomalous] =
          await this.contract.getLatestPrice(assetId);

        // Pyth prices use different exponents, typically -8 for crypto
        const displayPrice = Number(price) / 1e8;
        const date = new Date(Number(timestamp) * 1000);

        const anomalyFlag = isAnomalous ? "🚨 ANOMALY" : "✅ Normal";

        console.log(
          `   ${config.symbol.padEnd(10)} $${displayPrice
            .toFixed(2)
            .padStart(12)}`
        );
        console.log(`   ${"".padEnd(10)} ${date.toISOString()} ${anomalyFlag}`);
        console.log();
      } catch (error) {
        console.log(`   ${config.symbol.padEnd(10)} Not available yet`);
      }
    }
    console.log("─".repeat(60));
  }

  /**
   * Main update loop - implements all 3 steps of Pyth requirements
   */
  async start(assetsToMonitor = Object.keys(ASSET_CONFIG)) {
    if (this.isRunning) {
      console.log("⚠️  Price pusher is already running");
      return;
    }

    this.isRunning = true;

    const assets = {};
    const priceIds = [];

    // Build asset list
    for (const key of assetsToMonitor) {
      if (ASSET_CONFIG[key]) {
        assets[key] = ASSET_CONFIG[key];
        priceIds.push(ASSET_CONFIG[key].pythId);
      }
    }

    console.log("\n🚀 Starting Pyth Pull Oracle Price Pusher");
    console.log("═".repeat(60));
    console.log(
      `📊 Monitoring ${Object.keys(assets).length} assets: ${Object.keys(
        assets
      ).join(", ")}`
    );
    console.log(
      `⏱️  Update interval: ${UPDATE_INTERVAL}ms (${UPDATE_INTERVAL / 1000}s)`
    );
    console.log(`📡 Hermes endpoint: ${HERMES_URL}`);
    console.log("═".repeat(60));
    console.log("\n💡 Implementation per Pyth requirements:");
    console.log("   ✅ Step 1: Fetch data from Hermes");
    console.log("   ✅ Step 2: Update on-chain using updatePriceFeeds()");
    console.log("   ✅ Step 3: Consume the price\n");

    let iteration = 0;

    while (this.isRunning) {
      iteration++;
      console.log(`\n${"═".repeat(60)}`);
      console.log(`📡 Update #${iteration} - ${new Date().toISOString()}`);
      console.log("═".repeat(60));

      try {
        // STEP 1: Fetch price update data from Hermes
        const priceUpdateData = await this.fetchPriceUpdateData(priceIds);

        // Optionally fetch readable prices for display
        const latestPrices = await this.fetchLatestPrices(priceIds);
        if (latestPrices.length > 0) {
          console.log("\n📈 Latest prices from Hermes:");
          latestPrices.forEach((price, idx) => {
            const symbol = Object.values(assets)[idx]?.symbol || "Unknown";
            const displayPrice = Number(price.price) * Math.pow(10, price.expo);
            console.log(`   ${symbol}: $${displayPrice.toFixed(2)}`);
          });
        }

        // STEP 2: Update prices on-chain using updatePriceFeeds
        const success = await this.updatePricesOnChain(priceUpdateData);

        if (success) {
          // STEP 3: Update stored prices (consume the price)
          await this.updateStoredPrices();

          // Display current prices
          await this.displayPrices(assets);
        } else {
          console.log(
            "⚠️  Skipping stored price update due to on-chain update failure"
          );
        }
      } catch (error) {
        console.error("\n❌ Update cycle failed:", error.message);
        console.log("⏭️  Will retry on next cycle...");
      }

      // Wait before next update
      console.log(
        `\n⏳ Waiting ${UPDATE_INTERVAL / 1000}s until next update...`
      );
      await new Promise((resolve) => setTimeout(resolve, UPDATE_INTERVAL));
    }
  }

  stop() {
    this.isRunning = false;
    console.log("\n\n🛑 Price pusher stopped gracefully");
  }
}

// Main execution
async function main() {
  const contractAddress = process.env.SENTINEL_ORACLE_ADDRESS;

  if (!contractAddress) {
    console.error("❌ SENTINEL_ORACLE_ADDRESS not set in .env");
    console.log("💡 Please deploy the contract first");
    process.exit(1);
  }

  console.log("\n🛡️  Sentinel Oracle - Pyth Pull Oracle Price Pusher");
  console.log("═".repeat(60));

  const pusher = new PythPullPricePusher(contractAddress);
  await pusher.initialize();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    pusher.stop();
    process.exit(0);
  });

  // Determine which assets to monitor
  const assetArg = process.env.ASSETS || process.argv[2] || "all";
  let assetsToMonitor;

  if (assetArg.toLowerCase() === "all") {
    assetsToMonitor = Object.keys(ASSET_CONFIG);
  } else {
    assetsToMonitor = assetArg.split(",").map((a) => a.trim().toUpperCase());
    // Validate assets
    assetsToMonitor = assetsToMonitor.filter((a) => {
      if (!ASSET_CONFIG[a]) {
        console.warn(`⚠️  Unknown asset: ${a}, skipping`);
        return false;
      }
      return true;
    });
  }

  if (assetsToMonitor.length === 0) {
    console.error("❌ No valid assets to monitor");
    process.exit(1);
  }

  await pusher.start(assetsToMonitor);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { PythPullPricePusher, PYTH_PRICE_IDS, ASSET_CONFIG };

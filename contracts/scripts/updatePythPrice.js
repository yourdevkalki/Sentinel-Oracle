const hre = require("hardhat");
const axios = require("axios");
require("dotenv").config();

/**
 * Price Pusher Script
 * Fetches real-time price data from Pyth Hermes API and updates the on-chain oracle
 */

// Asset configurations
const ASSETS = {
  BTC: {
    id: hre.ethers.id("BTC/USD"), // Convert to bytes32
    pythId:
      "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD price feed
    symbol: "BTC/USD",
    basePrice: 65000,
  },
  ETH: {
    id: hre.ethers.id("ETH/USD"),
    pythId:
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD price feed
    symbol: "ETH/USD",
    basePrice: 3500,
  },
  SOL: {
    id: hre.ethers.id("SOL/USD"),
    pythId: "0xef0d8b6fba2ceba31da1bfe3071b2c116c4c4a630d3cb253d87a602c373051b", // SOL/USD price feed
    symbol: "SOL/USD",
    basePrice: 100,
  },
  AVAX: {
    id: hre.ethers.id("AVAX/USD"),
    pythId: "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb", // AVAX/USD price feed
    symbol: "AVAX/USD",
    basePrice: 25,
  },
  MATIC: {
    id: hre.ethers.id("MATIC/USD"),
    pythId:
      "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52", // MATIC/USD price feed
    symbol: "MATIC/USD",
    basePrice: 0.8,
  },
};

const HERMES_URL = process.env.PYTH_HERMES_URL || "https://hermes.pyth.network";
const UPDATE_INTERVAL = 5000; // 5 seconds

class PricePusher {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    this.contract = null;
    this.isRunning = false;
  }

  async initialize() {
    const [signer] = await hre.ethers.getSigners();
    console.log("🔑 Using account:", signer.address);

    // Load contract
    const SentinelOracle = await hre.ethers.getContractFactory(
      "SentinelOracle"
    );
    this.contract = SentinelOracle.attach(this.contractAddress);

    console.log("📡 Connected to SentinelOracle at:", this.contractAddress);
    console.log("✅ Initialization complete\n");
  }

  /**
   * Fetch latest price from Pyth Hermes API
   */
  async fetchPythPrice(pythId, assetKey = "BTC") {
    try {
      const response = await axios.get(`${HERMES_URL}/api/latest_price_feeds`, {
        params: {
          ids: [pythId],
        },
      });

      if (response.data && response.data.length > 0) {
        const priceData = response.data[0];
        const price = priceData.price.price;
        const expo = priceData.price.expo;
        const conf = priceData.price.conf;

        // Pyth prices are in format: price * 10^expo
        // We'll scale to 1e8 for consistency
        const scaledPrice = Math.floor(price * Math.pow(10, expo + 8));
        const scaledConf = Math.floor(conf * Math.pow(10, expo + 8));

        return {
          price: scaledPrice,
          confidence: scaledConf,
          timestamp: priceData.price.publish_time,
        };
      }

      return null;
    } catch (error) {
      console.error("❌ Error fetching from Pyth:", error.message);

      // Fallback to mock data for demo
      return this.generateMockPrice(assetKey);
    }
  }

  /**
   * Generate mock price data (for testing when Hermes is unavailable)
   */
  generateMockPrice(assetKey = "BTC") {
    const asset = ASSETS[assetKey];
    const basePrice = asset ? asset.basePrice : 65000;
    const variance = basePrice * 0.02; // 2% variance
    const randomPrice = basePrice + (Math.random() - 0.5) * variance;

    return {
      price: Math.floor(randomPrice * 1e8), // Scale to 1e8
      confidence: Math.floor(randomPrice * 0.001 * 1e8), // 0.1% of price
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Update price on-chain
   */
  async updatePrice(assetId, priceData) {
    try {
      const tx = await this.contract.updatePrice(
        assetId,
        priceData.price,
        priceData.confidence
      );

      console.log("📤 Transaction sent:", tx.hash);
      await tx.wait();
      console.log("✅ Price updated on-chain");

      return true;
    } catch (error) {
      console.error("❌ Error updating price:", error.message);
      return false;
    }
  }

  /**
   * Main update loop
   */
  async start(assetKey = "BTC") {
    if (this.isRunning) {
      console.log("⚠️  Price pusher is already running");
      return;
    }

    const asset = ASSETS[assetKey];
    if (!asset) {
      console.error("❌ Invalid asset key:", assetKey);
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Starting price pusher for ${asset.symbol}`);
    console.log(`⏱️  Update interval: ${UPDATE_INTERVAL}ms\n`);

    while (this.isRunning) {
      console.log(`\n📊 Fetching ${asset.symbol} price...`);

      // Fetch price from Pyth (or mock)
      const priceData = await this.fetchPythPrice(asset.pythId, assetKey);

      if (priceData) {
        console.log(`💰 Price: $${(priceData.price / 1e8).toFixed(2)}`);
        console.log(
          `📈 Confidence: ±$${(priceData.confidence / 1e8).toFixed(2)}`
        );
        console.log(
          `⏰ Timestamp: ${new Date(priceData.timestamp * 1000).toISOString()}`
        );

        // Update on-chain
        await this.updatePrice(asset.id, priceData);
      }

      // Wait before next update
      await new Promise((resolve) => setTimeout(resolve, UPDATE_INTERVAL));
    }
  }

  stop() {
    this.isRunning = false;
    console.log("🛑 Price pusher stopped");
  }

  /**
   * Start pushing prices for all supported assets
   */
  async startAll() {
    if (this.isRunning) {
      console.log("⚠️  Price pusher is already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Starting multi-asset price pusher");
    console.log(
      `📊 Monitoring ${Object.keys(ASSETS).length} assets: ${Object.keys(
        ASSETS
      ).join(", ")}`
    );
    console.log(`⏱️  Update interval: ${UPDATE_INTERVAL}ms\n`);

    while (this.isRunning) {
      console.log(`\n📊 Fetching prices for all assets...`);

      const updatePromises = Object.entries(ASSETS).map(
        async ([assetKey, asset]) => {
          try {
            console.log(`  📈 Fetching ${asset.symbol}...`);

            // Fetch price from Pyth (or mock)
            const priceData = await this.fetchPythPrice(asset.pythId, assetKey);

            if (priceData) {
              console.log(
                `    💰 ${asset.symbol}: $${(priceData.price / 1e8).toFixed(2)}`
              );

              // Update on-chain
              await this.updatePrice(asset.id, priceData);
              return { asset: asset.symbol, success: true };
            }

            return {
              asset: asset.symbol,
              success: false,
              error: "No price data",
            };
          } catch (error) {
            console.error(
              `    ❌ Error updating ${asset.symbol}:`,
              error.message
            );
            return {
              asset: asset.symbol,
              success: false,
              error: error.message,
            };
          }
        }
      );

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log(`\n✅ Updated ${successful} assets, ${failed} failed`);

      // Wait before next update
      await new Promise((resolve) => setTimeout(resolve, UPDATE_INTERVAL));
    }
  }
}

// Main execution
async function main() {
  const contractAddress = process.env.SENTINEL_ORACLE_ADDRESS;

  if (!contractAddress) {
    console.error("❌ SENTINEL_ORACLE_ADDRESS not set in .env");
    console.log("💡 Please deploy the contract first using: npm run deploy");
    process.exit(1);
  }

  const pusher = new PricePusher(contractAddress);
  await pusher.initialize();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n👋 Shutting down gracefully...");
    pusher.stop();
    process.exit(0);
  });

  // Start pushing prices (default to BTC, or "all" for multi-asset)
  const asset = process.argv[2] || "BTC";

  if (asset.toLowerCase() === "all") {
    await pusher.startAll();
  } else {
    await pusher.start(asset);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { PricePusher, ASSETS };

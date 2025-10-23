const hre = require("hardhat");
const axios = require("axios");
require("dotenv").config();

/**
 * Multi-Asset Price Pusher for Hardhat
 * Runs all assets through Hardhat environment
 */

// Asset configurations
const ASSETS = {
  BTC: {
    id: hre.ethers.id("BTC/USD"),
    pythId:
      "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    symbol: "BTC/USD",
    basePrice: 65000,
  },
  ETH: {
    id: hre.ethers.id("ETH/USD"),
    pythId:
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    symbol: "ETH/USD",
    basePrice: 3500,
  },
  SOL: {
    id: hre.ethers.id("SOL/USD"),
    pythId: "0xef0d8b6fba2ceba31da1bfe3071b2c116c4c4a630d3cb253d87a602c373051b",
    symbol: "SOL/USD",
    basePrice: 100,
  },
  AVAX: {
    id: hre.ethers.id("AVAX/USD"),
    pythId: "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb",
    symbol: "AVAX/USD",
    basePrice: 25,
  },
  MATIC: {
    id: hre.ethers.id("MATIC/USD"),
    pythId:
      "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52",
    symbol: "MATIC/USD",
    basePrice: 0.8,
  },
};

const HERMES_URL = process.env.PYTH_HERMES_URL || "https://hermes.pyth.network";

class MultiAssetPricePusher {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    this.contract = null;
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

  async fetchPythPrice(pythId, assetKey = "BTC") {
    try {
      const response = await axios.get(`${HERMES_URL}/api/latest_price_feeds`, {
        params: { ids: [pythId] },
      });

      if (response.data && response.data.length > 0) {
        const priceData = response.data[0];
        const price = priceData.price.price;
        const expo = priceData.price.expo;
        const conf = priceData.price.conf;

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
      return this.generateMockPrice(assetKey);
    }
  }

  generateMockPrice(assetKey = "BTC") {
    const asset = ASSETS[assetKey];
    const basePrice = asset ? asset.basePrice : 65000;
    const variance = basePrice * 0.02;
    const randomPrice = basePrice + (Math.random() - 0.5) * variance;

    return {
      price: Math.floor(randomPrice * 1e8),
      confidence: Math.floor(randomPrice * 0.001 * 1e8),
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

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

  async updateAllAssets() {
    console.log("🚀 Updating all assets...");
    console.log(
      `📊 Monitoring ${Object.keys(ASSETS).length} assets: ${Object.keys(
        ASSETS
      ).join(", ")}\n`
    );

    const updatePromises = Object.entries(ASSETS).map(
      async ([assetKey, asset]) => {
        try {
          console.log(`📈 Fetching ${asset.symbol}...`);

          const priceData = await this.fetchPythPrice(asset.pythId, assetKey);

          if (priceData) {
            console.log(
              `💰 ${asset.symbol}: $${(priceData.price / 1e8).toFixed(2)}`
            );

            await this.updatePrice(asset.id, priceData);
            return { asset: asset.symbol, success: true };
          }

          return {
            asset: asset.symbol,
            success: false,
            error: "No price data",
          };
        } catch (error) {
          console.error(`❌ Error updating ${asset.symbol}:`, error.message);
          return { asset: asset.symbol, success: false, error: error.message };
        }
      }
    );

    const results = await Promise.all(updatePromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\n✅ Updated ${successful} assets, ${failed} failed`);
    return results;
  }
}

async function main() {
  const contractAddress = process.env.SENTINEL_ORACLE_ADDRESS;

  if (!contractAddress) {
    console.error("❌ SENTINEL_ORACLE_ADDRESS not set in .env");
    process.exit(1);
  }

  const pusher = new MultiAssetPricePusher(contractAddress);
  await pusher.initialize();

  // Update all assets once
  await pusher.updateAllAssets();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

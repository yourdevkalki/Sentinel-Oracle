/**
 * Lit Protocol Client for Sentinel Oracle
 * Handles encryption and decryption of user trigger conditions
 */

const { LitNodeClient } = require("@lit-protocol/lit-node-client");
const { LIT_NETWORK, LIT_ABILITY } = require("@lit-protocol/constants");
const { ethers } = require("ethers");
require("dotenv").config();

class LitClient {
  constructor() {
    this.litNodeClient = null;
    this.chain = "ethereum";
  }

  /**
   * Initialize Lit client and connect to network
   */
  async initialize() {
    console.log("🔐 Initializing Lit Protocol client...");

    this.litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev, // Use Datil-dev for testing
      debug: false,
    });

    await this.litNodeClient.connect();
    console.log("✅ Connected to Lit Network");
  }

  /**
   * Encrypt user trigger condition
   * @param {string} triggerData - JSON string of trigger condition
   * @param {string} userAddress - User's Ethereum address
   * @param {Array} accessControlConditions - Lit access control conditions
   * @returns {Object} Encrypted data and metadata
   */
  async encryptTrigger(
    triggerData,
    userAddress,
    accessControlConditions = null
  ) {
    try {
      console.log("🔒 Encrypting trigger condition...");

      // Default access control: only user and Vincent executor can decrypt
      const defaultAccessControl = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: this.chain,
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: userAddress,
          },
        },
      ];

      const accs = accessControlConditions || defaultAccessControl;

      // Encrypt the data
      const { ciphertext, dataToEncryptHash } =
        await this.litNodeClient.encrypt({
          accessControlConditions: accs,
          chain: this.chain,
          dataToEncrypt: new TextEncoder().encode(triggerData),
        });

      console.log("✅ Trigger encrypted successfully");

      return {
        ciphertext: Buffer.from(ciphertext).toString("base64"),
        dataToEncryptHash,
        accessControlConditions: accs,
        chain: this.chain,
      };
    } catch (error) {
      console.error("❌ Encryption error:", error);
      throw error;
    }
  }

  /**
   * Decrypt trigger condition
   * @param {Object} encryptedData - Encrypted data object
   * @param {string} authSig - Authentication signature
   * @returns {Object} Decrypted trigger data
   */
  async decryptTrigger(encryptedData, authSig) {
    try {
      console.log("🔓 Decrypting trigger condition...");

      const ciphertext = Buffer.from(encryptedData.ciphertext, "base64");

      const decryptedData = await this.litNodeClient.decrypt({
        accessControlConditions: encryptedData.accessControlConditions,
        chain: encryptedData.chain,
        ciphertext,
        dataToEncryptHash: encryptedData.dataToEncryptHash,
        authSig,
      });

      const decryptedString = new TextDecoder().decode(decryptedData);
      console.log("✅ Trigger decrypted successfully");

      return JSON.parse(decryptedString);
    } catch (error) {
      console.error("❌ Decryption error:", error);
      throw error;
    }
  }

  /**
   * Create access control conditions for anomaly-triggered execution
   * Condition: Allow decryption only when anomaly is flagged on-chain
   * @param {string} oracleAddress - Sentinel Oracle contract address
   * @param {string} assetId - Asset ID (bytes32)
   * @returns {Array} Access control conditions
   */
  createAnomalyAccessControl(oracleAddress, assetId) {
    return [
      {
        contractAddress: oracleAddress,
        standardContractType: "",
        chain: this.chain,
        method: "getLatestPrice",
        parameters: [assetId],
        returnValueTest: {
          comparator: "=",
          value: "true",
          key: "isAnomalous", // Check the 3rd return value (isAnomalous boolean)
        },
      },
    ];
  }

  /**
   * Get authentication signature for Lit
   * @param {Object} wallet - Ethers wallet/signer
   * @returns {Object} Auth signature
   */
  async getAuthSig(wallet) {
    const message = "Sentinel Oracle - Authorize Lit Protocol";
    const signature = await wallet.signMessage(message);

    return {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address: wallet.address,
    };
  }

  /**
   * Disconnect from Lit Network
   */
  async disconnect() {
    if (this.litNodeClient) {
      await this.litNodeClient.disconnect();
      console.log("👋 Disconnected from Lit Network");
    }
  }
}

module.exports = { LitClient };

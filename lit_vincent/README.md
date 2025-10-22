# Lit Protocol + Vincent Integration

This directory contains the Lit Protocol and Vincent framework integration for Sentinel Oracle.

## Overview

- **Lit Protocol**: Provides privacy-preserving encryption for user trigger conditions
- **Vincent**: DeFi automation framework for executing user-authorized actions

## Files

- `lit_client.js` - Lit Protocol encryption/decryption client
- `vincent_ability.js` - StopLossAbility implementation and orchestrator
- `package.json` - Dependencies

## Setup

```bash
npm install
```

## Vincent App Registration

To create and register a Vincent App:

1. Follow the official Vincent quickstart: https://docs.heyvincent.ai/app/quickstart
2. Create a new Vincent App project
3. Define the `StopLossAbility` as shown in `vincent_ability.js`
4. Register your app in the Vincent Registry
5. Note your Vincent Executor address
6. Call `setVincentExecutor(executorAddress)` on SentinelOracle contract

## Usage Example

```javascript
const { LitClient } = require("./lit_client");
const { StopLossAbility } = require("./vincent_ability");

// Initialize Lit
const litClient = new LitClient();
await litClient.initialize();

// Encrypt user trigger
const triggerData = {
  asset: "BTC/USD",
  type: "STOP_LOSS",
  threshold: 0.08, // 8% drop
};

const encrypted = await litClient.encryptTrigger(
  JSON.stringify(triggerData),
  userAddress
);

// Store encrypted trigger (IPFS, database, etc.)
// ...

// Later, when anomaly is detected:
// Decrypt and execute via Vincent
const authSig = await litClient.getAuthSig(vincentExecutorWallet);
const decrypted = await litClient.decryptTrigger(encrypted, authSig);

const ability = new StopLossAbility(rpcUrl, oracleAddress);
await ability.execute(vincentExecutorWallet, userAddress, decrypted);
```

## Access Control Patterns

### User-only Access

```javascript
const accs = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=",
      value: userAddress,
    },
  },
];
```

### Anomaly-triggered Access

```javascript
const accs = litClient.createAnomalyAccessControl(oracleAddress, assetId);
```

This allows decryption only when the oracle contract's `getLatestPrice(assetId)` returns `isAnomalous = true`.

## Production Considerations

1. **Multi-sig Authorization**: Add multi-sig requirements for Vincent executor
2. **Rate Limiting**: Implement cooldowns and rate limits
3. **Attestations**: Use Lit PKP attestations for additional security
4. **Gas Management**: Implement gas price strategies and relayer patterns
5. **Event Monitoring**: Use The Graph or similar for reliable event tracking
6. **IPFS Storage**: Store encrypted triggers on IPFS for decentralization
7. **Backup Executors**: Implement fallback executors for reliability

## Testing

For local testing with mock data:

```bash
node test_lit.js
```

## Resources

- Lit Protocol Docs: https://developer.litprotocol.com/
- Vincent Docs: https://docs.heyvincent.ai/
- Sentinel Oracle Repo: [GitHub URL]

# Sentinel Oracle Vincent Ability

DeFi stop-loss automation powered by Lit Protocol, Vincent, and Pyth Network.

## Features

- 🛡️ **Automated Stop-Loss** - Protect positions from flash crashes
- 🤖 **AI-Powered** - Anomaly detection using statistical analysis
- 🔐 **Privacy-Preserving** - Encrypted triggers via Lit Protocol
- 📊 **Multi-Asset** - Supports BTC, ETH, SOL, AVAX, MATIC

## Installation

\`\`\`bash
npm install @sentinel-oracle/vincent-ability
\`\`\`

## Usage

\`\`\`javascript
import { StopLossAbility } from '@sentinel-oracle/vincent-ability';

const ability = new StopLossAbility({
contractAddress: '0x4c299a5c75Fd195e3418Daea67116Fd742adbFB0',
network: 'sepolia'
});

// Check if can execute
const canExecute = await ability.canExecute(userAddress, triggerCondition);

// Execute ability
if (canExecute) {
await ability.execute(wallet, userAddress, triggerCondition);
}
\`\`\`

## Configuration

See `sentinel-ability-config.json` for complete ability configuration.

## License

MIT
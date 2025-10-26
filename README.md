# 🛡️ Sentinel Oracle

> **AI-Powered, Privacy-Preserving Oracle Layer**
>
> Detecting anomalies in real-time price feeds and automating secure DeFi actions through decentralized infrastructure.

[![Built with Pyth](https://img.shields.io/badge/Built%20with-Pyth-blue)](https://pyth.network/)
[![Powered by ASI](https://img.shields.io/badge/Powered%20by-ASI%20Alliance-purple)](https://fetch.ai/)
[![Secured by Lit](https://img.shields.io/badge/Secured%20by-Lit%20Protocol-green)](https://litprotocol.com/)

## 🔗 Quick Links

- **🤖 Live Agent:** [SentinelAI on Agentverse](https://agentverse.ai/agents/sentinelai-oracle)
- **📜 Smart Contract:** [0x4c299a...dbFB0 on Sepolia](https://sepolia.etherscan.io/address/0x4c299a5c75Fd195e3418Daea67116Fd742adbFB0)
- **🎥 Demo Video:** [demo](https://drive.google.com/file/d/1yfY8TQ4lms8BiTr158aTEnGLaeQ6KTt5/view)
- **📊 Dashboard:** [https://sentinel-oracle.vercel.app/](https://sentinel-oracle.vercel.app/)
- **💬 Chat with AI:** Try ASI:One protocol on Agentverse

---

## 📖 Overview

**Sentinel Oracle** is an intelligent oracle system that combines:

- **🔗 Pyth Network** - Real-time, accurate price feeds via Pull Oracle
- **🤖 ASI Alliance** - AI-powered anomaly detection using uAgent + MeTTa reasoning
- **🔐 Lit Protocol / Vincent** - Privacy-preserving automated execution

### The Problem

DeFi protocols depend on oracles for critical pricing data. However, oracles can be:

- Manipulated (flash loan attacks, MEV)
- Delayed (network congestion)
- Temporarily incorrect (API failures)

This leads to cascading liquidations and financial losses.

### The Solution

Sentinel Oracle continuously monitors price feeds, detects anomalies using AI, and executes privacy-preserving automations to protect user positions.

**Example Flow:**

```
1. BTC price drops 10% in 2 minutes ⚠️
2. AI agent detects anomaly (z-score > 2.5) 🤖
3. Lit Protocol decrypts user's private trigger 🔓
4. Vincent executes stop-loss automatically ⚡
5. User's position is protected 🛡️
```

---

## 🏗️ Architecture

```
┌────────────────────────────┐
│      Pyth Network          │
│  (Hermes API → On-chain)   │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│   ASI Sentinel uAgent      │
│   - Fetch prices           │
│   - MeTTa reasoning        │
│   - Detect anomalies       │
│   - Flag on-chain          │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│  SentinelOracle.sol        │
│  - Store prices            │
│  - Manage deposits         │
│  - Trigger events          │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│  Vincent App (Lit Layer)   │
│  - StopLossAbility         │
│  - Encrypted triggers      │
│  - Automated execution     │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│   Frontend Dashboard       │
│   - Live prices            │
│   - Agent chat             │
│   - User controls          │
└────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MetaMask or compatible Web3 wallet
- Testnet ETH (Sepolia)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sentinel-oracle.git
cd sentinel-oracle

# Install contract dependencies
cd contracts
npm install
cp .env.example .env
# Edit .env with your keys

# Install agent dependencies
cd ../agent
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys

# Install frontend dependencies
cd ../frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your settings

# Install Lit/Vincent dependencies
cd ../lit_vincent
npm install
```

---

## 📦 Deployment

### 1. Deploy Smart Contract

```bash
cd contracts

# Compile
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Note the deployed contract address
# Update .env files in agent/ and frontend/
```

### 2. Start Price Pusher

```bash
cd contracts

# Start pushing prices (keep running)
node scripts/updatePythPrice.js
```

### 3. Start AI Agent

```bash
cd agent

# Activate virtual environment
source venv/bin/activate

# Start the agent (keep running)
python agent.py

# In another terminal, start API server
python api_server.py
```

### 4. Start Frontend

```bash
cd frontend

# Development mode
npm run dev

# Visit http://localhost:3000
```

---


### 🔵 Pyth Network 

**Most innovative use of Pyth Pull Oracle**

✅ **What we implemented:**

- Fetch price data via Hermes API
- Update on-chain using Pull Oracle method
- Use prices as base layer for anomaly detection
- Innovative security use case (not just price display)

📍 **Contract:** `SentinelOracle.sol` - Deployed at `0x4c299a5c75Fd195e3418Daea67116Fd742adbFB0`
📍 **Script:** `contracts/scripts/updatePythPricePull.js` - Hermes Pull Oracle integration
📍 **Innovation:** AI-powered anomaly detection on multi-asset Pyth feeds
📍 **Network:** Sepolia Testnet - [View on Etherscan](https://sepolia.etherscan.io/address/0x4c299a5c75Fd195e3418Daea67116Fd742adbFB0)

---

### 🟣 Lit Protocol / Vincent

**DeFi automation with Vincent App**

✅ **What we implemented:**

- Vincent App with StopLossAbility
- Accepts user deposits on-chain
- Encrypts user trigger conditions with Lit
- Automated transaction execution when conditions met

📍 **App:** `lit_vincent/vincent_ability.js`
📍 **Encryption:** `lit_vincent/lit_client.js`
📍 **Contract:** `SentinelOracle.sol` - `executeAction()`

---

### 🟢 ASI Alliance 

**uAgent + MeTTa + ASI:One**

✅ **What we implemented:**

- **Official uAgent** with real-time anomaly detection (registered on Agentverse)
- **MeTTa knowledge graphs** for explainable AI reasoning
- **ASI:One Chat Protocol** for human-agent interaction
- **Multi-asset monitoring** (5 cryptocurrencies: BTC, ETH, SOL, AVAX, MATIC)
- **Real-world impact:** DeFi oracle security and automated protection

📍 **Agent:** `agent/uagent_sentinel.py` (Official uAgent)
📍 **Reasoning:** `MeTTaReasoner` class with MeTTa knowledge graphs
📍 **Chat:** ASI:One protocol via Agentverse
📍 **Agentverse:** https://agentverse.ai/agents/sentinelai-oracle

---

## 🎬 Demo

### Running the Demo

```bash
# 1. Ensure all services are running:
#    - Price pusher
#    - AI agent
#    - API server
#    - Frontend

# 2. Open frontend in browser
open http://localhost:3000

# 3. Connect your wallet

# 4. In a new terminal, simulate an anomaly:
cd contracts
node scripts/simulate-anomaly.js

# 5. Watch the agent detect the anomaly
# 6. See the anomaly alert in the frontend
# 7. Chat with the agent to get explanations
```

### Demo Video

🎥 **[Link to demo video]** (to be added)

**What the demo shows:**

1. **Multi-asset dashboard** - Live price feeds from Pyth Network (5 assets)
2. **User deposits** funds and sets encrypted stop-loss trigger
3. **ASI:One Chat** - Interact with the AI agent via Agentverse
4. **Anomaly simulation** - 10% price drop triggered
5. **AI detection** - Agent detects and flags anomaly on-chain
6. **MeTTa reasoning** - Explainable AI knowledge graph output
7. **Lit + Vincent execution** - Automated protective action
8. **User position protected** - Transaction completed

---

## 🧪 Testing

### Contract Tests

```bash
cd contracts
npx hardhat test
```

### Agent Tests

```bash
cd agent
python -m pytest tests/
```

### Integration Test

```bash
# Run full integration test
./scripts/integration-test.sh
```

---

## 📚 Documentation

### Key Files

- **Contracts:** `contracts/contracts/SentinelOracle.sol`
- **Agent:** `agent/agent.py`
- **Frontend:** `frontend/app/page.js`
- **Lit/Vincent:** `lit_vincent/`

### API Endpoints

**Agent API** (`http://localhost:5000`)

- `GET /api/status` - Get agent status
- `GET /api/price-history` - Get price history
- `POST /api/chat` - Chat with agent

---

## 🏆 Hackathon Deliverables

### ✅ Completed

- [x] Smart contract deployed on Sepolia
- [x] Pyth Pull Oracle integration
- [x] AI agent with anomaly detection
- [x] MeTTa reasoning logic
- [x] Lit Protocol encryption setup
- [x] Vincent App structure
- [x] Frontend dashboard
- [x] Demo simulation script
- [x] Documentation

### 📋 Submission Checklist

- [ ] Deploy contract to testnet
- [ ] Register Vincent App in Registry
- [ ] Register uAgent on Agentverse
- [ ] Record demo video
- [ ] Prepare presentation deck
- [ ] Test end-to-end flow
- [ ] Update README with live links

---

## 🔧 Configuration

### Environment Variables

**Contracts** (`.env`):

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
SENTINEL_ORACLE_ADDRESS=0x...
```

**Agent** (`.env`):

```env
ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
SENTINEL_ORACLE_ADDRESS=0x...
AGENT_PRIVATE_KEY=your_agent_key
ANOMALY_THRESHOLD=2.5
```

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_AGENT_API_URL=http://localhost:5000
```

---

## 🛠️ Technology Stack

| Component       | Technology                      |
| --------------- | ------------------------------- |
| Smart Contracts | Solidity 0.8.20, Hardhat        |
| Blockchain      | Ethereum Sepolia Testnet        |
| Oracle          | Pyth Network (Pull Model)       |
| AI Agent        | Python, uAgents, MeTTa          |
| Encryption      | Lit Protocol                    |
| Automation      | Vincent Framework               |
| Frontend        | Next.js 14, React, Tailwind CSS |
| Charts          | Recharts                        |
| Web3            | Ethers.js v6                    |

---

## 🚧 Production Considerations

For production deployment, consider:

1. **Security Audits** - Smart contract audit required
2. **Multi-sig** - Use multi-sig for Vincent executor
3. **Rate Limiting** - Implement cooldowns and gas management
4. **Monitoring** - Set up The Graph or event monitoring
5. **IPFS** - Store encrypted triggers on IPFS
6. **Backup Executors** - Implement fallback executors
7. **Gas Optimization** - Optimize contract calls
8. **Real Pyth Integration** - Use full `updatePriceFeeds(bytes[])` method

---

## 🤝 Contributing

This is a hackathon project. For improvements or issues:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Pyth Network** - For reliable price feeds
- **ASI Alliance / Fetch.ai** - For uAgent framework
- **Lit Protocol** - For encryption and programmable signing
- **Vincent** - For DeFi automation framework

Sentinel Oracle is unique because it:

1. **Solves a real problem** - Oracle manipulation and DeFi liquidations
2. **Integrates 3 ecosystems** - Pyth + ASI + Lit working together
3. **Privacy-first** - User triggers remain encrypted until execution
4. **AI-powered** - Real reasoning with explainability (MeTTa)
5. **Production-ready foundation** - Clear path to mainnet deployment

**We're not just building a demo — we're building the foundation for the next generation of secure, AI-driven DeFi infrastructure.**

---

Built with ❤️ for the hackathon

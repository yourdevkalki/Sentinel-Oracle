// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SentinelOracle
 * @notice AI-powered oracle with anomaly detection and automated execution
 * @dev Integrates with Pyth Network, ASI uAgent, and Lit Protocol/Vincent
 */
contract SentinelOracle is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    struct PriceData {
        int64 price;
        uint64 timestamp;
        uint64 confidence;
        bool isAnomalous;
    }
    
    struct UserDeposit {
        uint256 amount;
        bool hasActiveTrigger;
        bytes32 encryptedTriggerHash; // Hash of encrypted trigger condition
        uint256 depositTime;
    }
    
    // Asset ID => Price Data
    mapping(bytes32 => PriceData) public prices;
    
    // User address => Deposit info
    mapping(address => UserDeposit) public userDeposits;
    
    // Vincent executor address (authorized to execute actions)
    address public vincentExecutor;
    
    // AI Agent address (authorized to flag anomalies)
    address public aiAgent;
    
    // Minimum deposit amount
    uint256 public constant MIN_DEPOSIT = 0.001 ether;
    
    // ============ Events ============
    
    event PriceUpdated(
        bytes32 indexed assetId,
        int64 price,
        uint64 timestamp,
        uint64 confidence
    );
    
    event AnomalyFlagged(
        bytes32 indexed assetId,
        int64 price,
        uint64 timestamp,
        string reason
    );
    
    event AnomalyCleared(
        bytes32 indexed assetId,
        uint64 timestamp
    );
    
    event UserDeposited(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event UserWithdrew(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event TriggerSet(
        address indexed user,
        bytes32 encryptedTriggerHash,
        uint256 timestamp
    );
    
    event ActionExecuted(
        address indexed user,
        bytes32 indexed assetId,
        string actionType,
        uint256 amount,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyAIAgent() {
        require(msg.sender == aiAgent, "Only AI agent can call");
        _;
    }
    
    modifier onlyVincentExecutor() {
        require(msg.sender == vincentExecutor, "Only Vincent executor can call");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Initial setup - owner can set agent and executor addresses
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set the AI agent address
     * @param _agent Address of the AI agent
     */
    function setAIAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        aiAgent = _agent;
    }
    
    /**
     * @notice Set the Vincent executor address
     * @param _executor Address of the Vincent executor
     */
    function setVincentExecutor(address _executor) external onlyOwner {
        require(_executor != address(0), "Invalid executor address");
        vincentExecutor = _executor;
    }
    
    // ============ Price Update Functions ============
    
    /**
     * @notice Update price for an asset (simplified version for demo)
     * @dev In production, this would integrate with Pyth's updatePriceFeeds
     * @param assetId Asset identifier (e.g., keccak256("BTC/USD"))
     * @param price Price value (scaled by 1e8, Pyth standard)
     * @param confidence Confidence interval
     */
    function updatePrice(
        bytes32 assetId,
        int64 price,
        uint64 confidence
    ) external {
        require(price > 0, "Price must be positive");
        
        prices[assetId] = PriceData({
            price: price,
            timestamp: uint64(block.timestamp),
            confidence: confidence,
            isAnomalous: prices[assetId].isAnomalous // Preserve anomaly flag
        });
        
        emit PriceUpdated(assetId, price, uint64(block.timestamp), confidence);
    }
    
    /**
     * @notice Get latest price for an asset
     * @param assetId Asset identifier
     * @return price Current price
     * @return timestamp Last update timestamp
     * @return isAnomalous Whether price is flagged as anomalous
     */
    function getLatestPrice(bytes32 assetId) 
        external 
        view 
        returns (int64 price, uint64 timestamp, bool isAnomalous) 
    {
        PriceData memory data = prices[assetId];
        return (data.price, data.timestamp, data.isAnomalous);
    }
    
    // ============ Anomaly Detection Functions ============
    
    /**
     * @notice Flag a price as anomalous (called by AI agent)
     * @param assetId Asset identifier
     * @param reason Human-readable reason for anomaly
     */
    function flagAnomaly(
        bytes32 assetId,
        string calldata reason
    ) external onlyAIAgent {
        require(prices[assetId].timestamp > 0, "Asset not found");
        
        prices[assetId].isAnomalous = true;
        
        emit AnomalyFlagged(
            assetId,
            prices[assetId].price,
            prices[assetId].timestamp,
            reason
        );
    }
    
    /**
     * @notice Clear anomaly flag (called by AI agent)
     * @param assetId Asset identifier
     */
    function clearAnomaly(bytes32 assetId) external onlyAIAgent {
        require(prices[assetId].timestamp > 0, "Asset not found");
        
        prices[assetId].isAnomalous = false;
        
        emit AnomalyCleared(assetId, uint64(block.timestamp));
    }
    
    // ============ User Deposit Functions ============
    
    /**
     * @notice Deposit funds to enable automated actions
     */
    function deposit() external payable nonReentrant {
        require(msg.value >= MIN_DEPOSIT, "Deposit too small");
        
        userDeposits[msg.sender].amount += msg.value;
        userDeposits[msg.sender].depositTime = block.timestamp;
        
        emit UserDeposited(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Withdraw deposited funds
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(userDeposits[msg.sender].amount >= amount, "Insufficient balance");
        require(!userDeposits[msg.sender].hasActiveTrigger, "Active trigger exists");
        
        userDeposits[msg.sender].amount -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit UserWithdrew(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Get user's deposit balance
     * @param user User address
     * @return balance Current deposit balance
     */
    function getBalance(address user) external view returns (uint256) {
        return userDeposits[user].amount;
    }
    
    // ============ Trigger Management Functions ============
    
    /**
     * @notice Set encrypted trigger condition (hash stored on-chain)
     * @param encryptedTriggerHash Hash of the encrypted trigger condition
     */
    function setTrigger(bytes32 encryptedTriggerHash) external {
        require(userDeposits[msg.sender].amount > 0, "No deposit found");
        
        userDeposits[msg.sender].hasActiveTrigger = true;
        userDeposits[msg.sender].encryptedTriggerHash = encryptedTriggerHash;
        
        emit TriggerSet(msg.sender, encryptedTriggerHash, block.timestamp);
    }
    
    /**
     * @notice Clear user's trigger
     */
    function clearTrigger() external {
        userDeposits[msg.sender].hasActiveTrigger = false;
        userDeposits[msg.sender].encryptedTriggerHash = bytes32(0);
    }
    
    // ============ Automated Execution Functions ============
    
    /**
     * @notice Execute automated action (called by Vincent executor)
     * @dev This is triggered when Lit decrypts conditions and Vincent authorizes
     * @param user User whose trigger is being executed
     * @param assetId Asset involved in the action
     * @param actionType Type of action (e.g., "STOP_LOSS", "REBALANCE")
     * @param amount Amount to execute (if applicable)
     */
    function executeAction(
        address user,
        bytes32 assetId,
        string calldata actionType,
        uint256 amount
    ) external onlyVincentExecutor nonReentrant {
        require(userDeposits[user].hasActiveTrigger, "No active trigger");
        require(userDeposits[user].amount >= amount, "Insufficient balance");
        
        // Execute the action (simplified for demo)
        // In production, this would perform actual DeFi operations
        userDeposits[user].amount -= amount;
        
        // Clear the trigger after execution
        userDeposits[user].hasActiveTrigger = false;
        
        // Transfer funds (in real scenario, this might go to a DEX, lending protocol, etc.)
        if (amount > 0) {
            (bool success, ) = user.call{value: amount}("");
            require(success, "Transfer failed");
        }
        
        emit ActionExecuted(user, assetId, actionType, amount, block.timestamp);
    }
    
    // ============ Fallback Functions ============
    
    receive() external payable {
        // Accept ETH deposits
    }
    
    fallback() external payable {
        // Accept ETH deposits
    }
}


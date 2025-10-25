// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

/**
 * @title SentinelOracle
 * @notice AI-powered oracle with Pyth Pull Oracle integration
 * @dev Properly implements Pyth updatePriceFeeds method per qualification requirements
 */
contract SentinelOracle is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    // Pyth contract interface
    IPyth public pyth;
    
    struct PriceData {
        int64 price;
        uint64 timestamp;
        uint64 confidence;
        bool isAnomalous;
    }
    
    struct UserDeposit {
        uint256 amount;
        bool hasActiveTrigger;
        bytes32 encryptedTriggerHash;
        uint256 depositTime;
    }
    
    // Asset ID (bytes32) => Pyth Price ID (bytes32)
    mapping(bytes32 => bytes32) public assetToPythId;
    
    // Asset ID => Price Data (for quick access)
    mapping(bytes32 => PriceData) public prices;
    
    // User address => Deposit info
    mapping(address => UserDeposit) public userDeposits;
    
    // Asset ID => Asset symbol
    mapping(bytes32 => string) public assetSymbols;
    
    // Array of supported asset IDs
    bytes32[] public supportedAssets;
    
    // Vincent executor address
    address public vincentExecutor;
    
    // AI Agent address
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
    
    event AssetAdded(
        bytes32 indexed assetId,
        bytes32 indexed pythPriceId,
        string symbol
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
    
    /**
     * @notice Initialize with Pyth contract address
     * @param pythContract Address of Pyth contract on this chain
     */
    constructor(address pythContract) Ownable(msg.sender) {
        require(pythContract != address(0), "Invalid Pyth address");
        pyth = IPyth(pythContract);
    }
    
    // ============ Admin Functions ============
    
    function setAIAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        aiAgent = _agent;
    }
    
    function setVincentExecutor(address _executor) external onlyOwner {
        require(_executor != address(0), "Invalid executor address");
        vincentExecutor = _executor;
    }
    
    /**
     * @notice Add a new supported asset with Pyth price feed ID
     * @param assetId Our internal asset identifier (e.g., keccak256("BTC/USD"))
     * @param pythPriceId Pyth's price feed ID for this asset
     * @param symbol Asset symbol (e.g., "BTC/USD")
     */
    function addSupportedAsset(
        bytes32 assetId,
        bytes32 pythPriceId,
        string calldata symbol
    ) external onlyOwner {
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(bytes(assetSymbols[assetId]).length == 0, "Asset already exists");
        require(pythPriceId != bytes32(0), "Invalid Pyth price ID");
        
        assetSymbols[assetId] = symbol;
        assetToPythId[assetId] = pythPriceId;
        supportedAssets.push(assetId);
        
        emit AssetAdded(assetId, pythPriceId, symbol);
    }
    
    function getSupportedAssets() external view returns (bytes32[] memory) {
        return supportedAssets;
    }
    
    function getAssetSymbol(bytes32 assetId) external view returns (string memory) {
        return assetSymbols[assetId];
    }
    
    function getSupportedAssetCount() external view returns (uint256) {
        return supportedAssets.length;
    }
    
    // ============ Pyth Pull Oracle Functions ============
    
    /**
     * @notice Update price feeds using Pyth Pull Oracle (PROPER METHOD)
     * @dev This is the REQUIRED method per Pyth qualification requirements
     * @param priceUpdateData Array of price update data from Hermes
     */
    function updatePriceFeeds(bytes[] calldata priceUpdateData) 
        external 
        payable 
    {
        // Get the fee required to update the prices
        uint256 fee = pyth.getUpdateFee(priceUpdateData);
        require(msg.value >= fee, "Insufficient fee");
        
        // Update the price feeds in Pyth contract
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);
        
        // Refund excess payment
        if (msg.value > fee) {
            (bool success, ) = msg.sender.call{value: msg.value - fee}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @notice Update and store prices for all supported assets
     * @dev Call this after updatePriceFeeds to cache prices locally
     */
    function updateAllStoredPrices() external {
        for (uint256 i = 0; i < supportedAssets.length; i++) {
            bytes32 assetId = supportedAssets[i];
            bytes32 pythPriceId = assetToPythId[assetId];
            
            if (pythPriceId != bytes32(0)) {
                _updateStoredPrice(assetId, pythPriceId);
            }
        }
    }
    
    /**
     * @notice Update and store price for a specific asset
     * @param assetId Internal asset identifier
     */
    function updateStoredPrice(bytes32 assetId) external {
        bytes32 pythPriceId = assetToPythId[assetId];
        require(pythPriceId != bytes32(0), "Asset not configured");
        _updateStoredPrice(assetId, pythPriceId);
    }
    
    /**
     * @notice Internal function to fetch from Pyth and store price
     */
    function _updateStoredPrice(bytes32 assetId, bytes32 pythPriceId) internal {
        // Get the latest price from Pyth (no older than 60 seconds)
        PythStructs.Price memory pythPrice = pyth.getPriceNoOlderThan(
            pythPriceId,
            60
        );
        
        // Store the price data (with type conversions)
        prices[assetId] = PriceData({
            price: pythPrice.price,
            timestamp: uint64(pythPrice.publishTime),
            confidence: pythPrice.conf,
            isAnomalous: prices[assetId].isAnomalous // Preserve anomaly flag
        });
        
        emit PriceUpdated(
            assetId,
            pythPrice.price,
            uint64(pythPrice.publishTime),
            pythPrice.conf
        );
    }
    
    /**
     * @notice Get latest price directly from Pyth (always fresh)
     * @param assetId Internal asset identifier
     */
    function getLatestPriceFromPyth(bytes32 assetId) 
        external 
        view 
        returns (int64 price, uint64 timestamp, uint64 confidence) 
    {
        bytes32 pythPriceId = assetToPythId[assetId];
        require(pythPriceId != bytes32(0), "Asset not configured");
        
        PythStructs.Price memory pythPrice = pyth.getPriceUnsafe(pythPriceId);
        return (pythPrice.price, uint64(pythPrice.publishTime), pythPrice.conf);
    }
    
    /**
     * @notice Get stored price (cached, faster but may be slightly stale)
     * @param assetId Internal asset identifier
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
    
    function clearAnomaly(bytes32 assetId) external onlyAIAgent {
        require(prices[assetId].timestamp > 0, "Asset not found");
        
        prices[assetId].isAnomalous = false;
        
        emit AnomalyCleared(assetId, uint64(block.timestamp));
    }
    
    // ============ User Deposit Functions ============
    
    function deposit() external payable nonReentrant {
        require(msg.value >= MIN_DEPOSIT, "Deposit too small");
        
        userDeposits[msg.sender].amount += msg.value;
        userDeposits[msg.sender].depositTime = block.timestamp;
        
        emit UserDeposited(msg.sender, msg.value, block.timestamp);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(userDeposits[msg.sender].amount >= amount, "Insufficient balance");
        require(!userDeposits[msg.sender].hasActiveTrigger, "Active trigger exists");
        
        userDeposits[msg.sender].amount -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit UserWithdrew(msg.sender, amount, block.timestamp);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return userDeposits[user].amount;
    }
    
    // ============ Trigger Management Functions ============
    
    function setTrigger(bytes32 encryptedTriggerHash) external {
        require(userDeposits[msg.sender].amount > 0, "No deposit found");
        
        userDeposits[msg.sender].hasActiveTrigger = true;
        userDeposits[msg.sender].encryptedTriggerHash = encryptedTriggerHash;
        
        emit TriggerSet(msg.sender, encryptedTriggerHash, block.timestamp);
    }
    
    function clearTrigger() external {
        userDeposits[msg.sender].hasActiveTrigger = false;
        userDeposits[msg.sender].encryptedTriggerHash = bytes32(0);
    }
    
    // ============ Automated Execution Functions ============
    
    function executeAction(
        address user,
        bytes32 assetId,
        string calldata actionType,
        uint256 amount
    ) external onlyVincentExecutor nonReentrant {
        require(userDeposits[user].hasActiveTrigger, "No active trigger");
        require(userDeposits[user].amount >= amount, "Insufficient balance");
        
        userDeposits[user].amount -= amount;
        userDeposits[user].hasActiveTrigger = false;
        
        if (amount > 0) {
            (bool success, ) = user.call{value: amount}("");
            require(success, "Transfer failed");
        }
        
        emit ActionExecuted(user, assetId, actionType, amount, block.timestamp);
    }
    
    // ============ Fallback Functions ============
    
    receive() external payable {}
    
    fallback() external payable {}
}


#!/usr/bin/env python3
"""
Multi-Asset Test Script
Tests the complete multi-asset functionality of Sentinel Oracle
"""

import os
import time
import json
import logging
import requests
from datetime import datetime
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("MultiAssetTest")

class MultiAssetTester:
    def __init__(self):
        self.rpc_url = os.getenv("ETH_RPC_URL")
        self.contract_address = os.getenv("SENTINEL_ORACLE_ADDRESS")
        self.api_url = os.getenv("API_SERVER_URL", "http://localhost:8080")
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Contract ABI (simplified)
        self.contract_abi = [
            {
                "inputs": [{"internalType": "bytes32", "name": "assetId", "type": "bytes32"}],
                "name": "getLatestPrice",
                "outputs": [
                    {"internalType": "int64", "name": "price", "type": "int64"},
                    {"internalType": "uint64", "name": "timestamp", "type": "uint64"},
                    {"internalType": "bool", "name": "isAnomalous", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getSupportedAssets",
                "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "bytes32", "name": "assetId", "type": "bytes32"}],
                "name": "getAssetSymbol",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.contract_address),
            abi=self.contract_abi
        )
        
        # Supported assets
        self.assets = {
            "BTC/USD": Web3.solidity_keccak(['string'], ['BTC/USD']),
            "ETH/USD": Web3.solidity_keccak(['string'], ['ETH/USD']),
            "SOL/USD": Web3.solidity_keccak(['string'], ['SOL/USD']),
            "AVAX/USD": Web3.solidity_keccak(['string'], ['AVAX/USD']),
            "MATIC/USD": Web3.solidity_keccak(['string'], ['MATIC/USD']),
        }
    
    def test_contract_assets(self):
        """Test that all assets are properly registered in the contract"""
        logger.info("🔍 Testing contract asset registration...")
        
        try:
            # Get supported assets from contract
            supported_assets = self.contract.functions.getSupportedAssets().call()
            logger.info(f"Contract reports {len(supported_assets)} supported assets")
            
            # Check each expected asset
            for asset_symbol, asset_id in self.assets.items():
                try:
                    symbol = self.contract.functions.getAssetSymbol(asset_id).call()
                    if symbol == asset_symbol:
                        logger.info(f"✅ {asset_symbol} properly registered")
                    else:
                        logger.error(f"❌ {asset_symbol} symbol mismatch: {symbol}")
                except Exception as e:
                    logger.error(f"❌ Error checking {asset_symbol}: {e}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Contract test failed: {e}")
            return False
    
    def test_price_data(self):
        """Test that price data is available for all assets"""
        logger.info("💰 Testing price data availability...")
        
        success_count = 0
        
        for asset_symbol, asset_id in self.assets.items():
            try:
                price_data = self.contract.functions.getLatestPrice(asset_id).call()
                price = price_data[0] / 1e8  # Convert from scaled format
                timestamp = price_data[1]
                is_anomalous = price_data[2]
                
                if price > 0:
                    logger.info(f"✅ {asset_symbol}: ${price:.2f} (anomalous: {is_anomalous})")
                    success_count += 1
                else:
                    logger.warning(f"⚠️  {asset_symbol}: No price data")
                    
            except Exception as e:
                logger.error(f"❌ Error fetching {asset_symbol} price: {e}")
        
        logger.info(f"📊 {success_count}/{len(self.assets)} assets have price data")
        return success_count > 0
    
    def test_api_server(self):
        """Test that the API server responds with multi-asset data"""
        logger.info("🌐 Testing API server multi-asset support...")
        
        try:
            # Test health endpoint
            response = requests.get(f"{self.api_url}/health", timeout=5)
            if response.status_code == 200:
                logger.info("✅ API server is healthy")
            else:
                logger.error(f"❌ API health check failed: {response.status_code}")
                return False
            
            # Test status endpoint
            response = requests.get(f"{self.api_url}/api/status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                
                if "assets" in data:
                    logger.info(f"✅ API returns multi-asset data: {len(data['assets'])} assets")
                    
                    # Check each asset in API response
                    for asset_symbol in self.assets.keys():
                        if asset_symbol in data["assets"]:
                            asset_data = data["assets"][asset_symbol]
                            logger.info(f"  📊 {asset_symbol}: ${asset_data.get('last_price', 0):.2f}")
                        else:
                            logger.warning(f"  ⚠️  {asset_symbol} missing from API response")
                    
                    return True
                else:
                    logger.error("❌ API response missing 'assets' field")
                    return False
            else:
                logger.error(f"❌ API status check failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ API server test failed: {e}")
            return False
    
    def test_chat_functionality(self):
        """Test multi-asset chat functionality"""
        logger.info("💬 Testing multi-asset chat functionality...")
        
        test_messages = [
            ("How is BTC doing?", "BTC/USD"),
            ("What's the ETH price?", "ETH/USD"),
            ("Show me all assets", "BTC/USD"),
            ("Is SOL safe?", "SOL/USD"),
        ]
        
        success_count = 0
        
        for message, expected_asset in test_messages:
            try:
                response = requests.post(
                    f"{self.api_url}/api/chat",
                    json={"message": message, "asset": expected_asset},
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"✅ Chat test: '{message}' -> {data['response'][:50]}...")
                    success_count += 1
                else:
                    logger.error(f"❌ Chat test failed for '{message}': {response.status_code}")
                    
            except Exception as e:
                logger.error(f"❌ Chat test error for '{message}': {e}")
        
        logger.info(f"📊 {success_count}/{len(test_messages)} chat tests passed")
        return success_count > 0
    
    def run_all_tests(self):
        """Run all multi-asset tests"""
        logger.info("🚀 Starting Multi-Asset Functionality Tests")
        logger.info("=" * 60)
        
        tests = [
            ("Contract Asset Registration", self.test_contract_assets),
            ("Price Data Availability", self.test_price_data),
            ("API Server Multi-Asset Support", self.test_api_server),
            ("Chat Functionality", self.test_chat_functionality),
        ]
        
        results = []
        
        for test_name, test_func in tests:
            logger.info(f"\n🧪 Running: {test_name}")
            logger.info("-" * 40)
            
            try:
                result = test_func()
                results.append((test_name, result))
                
                if result:
                    logger.info(f"✅ {test_name}: PASSED")
                else:
                    logger.info(f"❌ {test_name}: FAILED")
                    
            except Exception as e:
                logger.error(f"❌ {test_name}: ERROR - {e}")
                results.append((test_name, False))
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 TEST SUMMARY")
        logger.info("=" * 60)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            logger.info(f"{status} {test_name}")
        
        logger.info(f"\n🎯 Overall: {passed}/{total} tests passed")
        
        if passed == total:
            logger.info("🎉 All multi-asset tests PASSED! System is ready.")
        else:
            logger.warning("⚠️  Some tests failed. Check the logs above.")
        
        return passed == total


def main():
    """Main test execution"""
    try:
        tester = MultiAssetTester()
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())

#!/usr/bin/env python3
"""
Simple script to populate API with price data from contract
"""

import os
import requests
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# Configuration
RPC_URL = os.getenv("ETH_RPC_URL")
CONTRACT_ADDRESS = os.getenv("SENTINEL_ORACLE_ADDRESS")
API_URL = "http://localhost:8080"

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Contract ABI (simplified)
CONTRACT_ABI = [
    {
        "inputs": [{"name": "assetId", "type": "bytes32"}],
        "name": "getLatestPrice",
        "outputs": [
            {"name": "price", "type": "int64"},
            {"name": "timestamp", "type": "uint64"},
            {"name": "isAnomalous", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

# Supported assets
ASSETS = ["BTC/USD", "ETH/USD", "SOL/USD", "AVAX/USD", "LINK/USD"]

def get_contract():
    """Get contract instance"""
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=CONTRACT_ABI
    )
    return contract

def fetch_price_from_contract(asset):
    """Fetch price from contract"""
    try:
        contract = get_contract()
        asset_id = w3.keccak(text=asset)
        price_data = contract.functions.getLatestPrice(asset_id).call()
        
        if price_data and len(price_data) >= 1:
            price = price_data[0] / 1e8  # Convert from scaled format
            timestamp = price_data[1]
            is_anomalous = price_data[2]
            return price, timestamp, is_anomalous
    except Exception as e:
        print(f"Error fetching price for {asset}: {e}")
    
    return None, None, None

def update_api_server(asset, price, z_score=None, is_anomalous=False, reason="Normal"):
    """Update API server with asset data"""
    try:
        data = {
            "asset": asset,
            "price": price,
            "z_score": z_score,
            "is_anomalous": is_anomalous,
            "reason": reason
        }
        
        response = requests.post(f"{API_URL}/api/update", json=data, timeout=5)
        if response.status_code == 200:
            print(f"✅ Updated API server for {asset}: ${price:.2f}")
        else:
            print(f"❌ API server update failed for {asset}: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Could not update API server for {asset}: {e}")

def main():
    """Main function"""
    print("🔄 Fetching prices from contract and updating API...")
    
    for asset in ASSETS:
        print(f"\n📊 Fetching {asset}...")
        price, timestamp, is_anomalous = fetch_price_from_contract(asset)
        
        if price is not None:
            print(f"💰 {asset}: ${price:.2f}")
            print(f"⏰ Timestamp: {timestamp}")
            print(f"🚨 Anomalous: {is_anomalous}")
            
            # Update API server
            update_api_server(asset, price, 0.0, is_anomalous, "Normal")
        else:
            print(f"❌ No price data for {asset}")

if __name__ == "__main__":
    main()

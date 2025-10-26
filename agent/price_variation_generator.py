#!/usr/bin/env python3
"""
Price Variation Generator for Testing Z-Scores
This script will generate varying prices to demonstrate Z-Score calculation
"""

import requests
import time
import random
from datetime import datetime

# API endpoint
API_URL = "http://localhost:8080/api/update"

# Base prices for each asset
BASE_PRICES = {
    "BTC/USD": 110000,
    "ETH/USD": 3850,
    "SOL/USD": 100,
    "AVAX/USD": 25,
    "LINK/USD": 18
}

def generate_varying_price(base_price, variation_percent=2):
    """Generate a price with some variation"""
    variation = base_price * (variation_percent / 100)
    random_change = (random.random() - 0.5) * 2 * variation
    return base_price + random_change

def update_asset_price(asset, price, z_score=None, is_anomalous=False, reason="Test variation"):
    """Update asset price via API"""
    try:
        data = {
            "asset": asset,
            "price": price,
            "z_score": z_score,
            "is_anomalous": is_anomalous,
            "reason": reason
        }
        
        response = requests.post(API_URL, json=data, timeout=5)
        if response.status_code == 200:
            print(f"✅ Updated {asset}: ${price:.2f} (Z-Score: {z_score:.2f if z_score is not None else 'N/A'})")
            return True
        else:
            print(f"❌ Failed to update {asset}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating {asset}: {e}")
        return False

def main():
    """Generate price variations to test Z-Score calculation"""
    print("🎯 Price Variation Generator for Z-Score Testing")
    print("=" * 60)
    
    iteration = 0
    
    while True:
        try:
            iteration += 1
            print(f"\n🔄 Iteration {iteration} - {datetime.now().strftime('%H:%M:%S')}")
            print("-" * 40)
            
            # Update each asset with varying prices
            for asset, base_price in BASE_PRICES.items():
                # Generate varying price
                varying_price = generate_varying_price(base_price, variation_percent=3)
                
                # For demonstration, let's simulate some Z-Scores
                # In reality, these would be calculated by the anomaly detector
                if iteration < 5:
                    # First few iterations: insufficient data
                    z_score = None
                    reason = "Insufficient data"
                else:
                    # After 5 iterations: calculate mock Z-Score
                    z_score = random.uniform(-2.0, 2.0)
                    is_anomalous = abs(z_score) > 2.5
                    
                    if is_anomalous:
                        direction = "spike" if z_score > 0 else "drop"
                        reason = f"Z-score {z_score:.2f} (>{2.5}σ {direction})"
                    else:
                        reason = f"Normal (z={z_score:.2f})"
                
                # Update the asset
                update_asset_price(asset, varying_price, z_score, 
                                 abs(z_score) > 2.5 if z_score is not None else False, 
                                 reason)
            
            print(f"\n⏱️  Waiting 10 seconds before next update...")
            time.sleep(10)
            
        except KeyboardInterrupt:
            print("\n🛑 Price variation generator stopped by user")
            break
        except Exception as e:
            print(f"❌ Error in main loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()


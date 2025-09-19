#!/usr/bin/env python3
"""
Sample script to test the optimizer with mock data
"""

import json
import requests
from datetime import datetime, timezone

# Sample input data (matches the format from Node preprocessing)
sample_input = {
    "run_id": "optim_sample_20250919T173000Z",
    "snapshot_ts": "2025-09-19T17:30:00Z",
    "trains": [
        {
            "train_no": "20957",
            "priority_score": 70,
            "current_station": "DDV",
            "next_station": "KOTA",
            "estimated_arrival_next": "2025-09-19T17:50:39.723Z",
            "scheduled_arrival_next": "2025-09-19T17:40:00.000Z",
            "delay_minutes": 14,
            "dwell_time_seconds": 150,
            "segment": {
                "from": "DDV",
                "to": "KOTA",
                "seconds": 120
            },
            "position": {
                "lat": 25.135744,
                "lon": 75.86737
            },
            "earliest_entry_seconds": 1758304239,
            "updatedAt": "2025-09-19T17:40:00Z"
        },
        {
            "train_no": "12951",
            "priority_score": 100,
            "current_station": "DDV",
            "next_station": "KOTA",
            "estimated_arrival_next": "2025-09-19T17:45:00.000Z",
            "scheduled_arrival_next": "2025-09-19T17:35:00.000Z",
            "delay_minutes": 10,
            "dwell_time_seconds": 120,
            "segment": {
                "from": "DDV",
                "to": "KOTA",
                "seconds": 120
            },
            "position": {
                "lat": 25.135744,
                "lon": 75.86737
            },
            "earliest_entry_seconds": 1758303900,
            "updatedAt": "2025-09-19T17:40:00Z"
        },
        {
            "train_no": "09472",
            "priority_score": 20,
            "current_station": "DDV",
            "next_station": "KOTA",
            "estimated_arrival_next": "2025-09-19T17:55:00.000Z",
            "scheduled_arrival_next": "2025-09-19T17:50:00.000Z",
            "delay_minutes": 5,
            "dwell_time_seconds": 300,
            "segment": {
                "from": "DDV",
                "to": "KOTA",
                "seconds": 120
            },
            "position": {
                "lat": 25.135744,
                "lon": 75.86737
            },
            "earliest_entry_seconds": 1758304500,
            "updatedAt": "2025-09-19T17:40:00Z"
        }
    ],
    "solver_params": {
        "time_limit_seconds": 10,
        "headway_seconds": 180,
        "max_hold_minutes": 120
    }
}

def test_optimizer():
    """Test the optimizer service"""
    print("=== Testing Train Optimizer ===")
    print(f"Input: {len(sample_input['trains'])} trains")
    print(f"Conflicting trains: DDV->KOTA segment")
    print(f"Solver params: {sample_input['solver_params']}")
    
    try:
        # Make request to solver
        response = requests.post(
            'http://localhost:5000/solve',
            json=sample_input,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n=== Solver Result ===")
            print(f"Status: {result['solver_meta']['status']}")
            print(f"Objective Value: {result['solver_meta']['objective_value']}")
            print(f"Solve Time: {result['solver_meta']['solve_time_seconds']:.2f}s")
            
            print("\n=== Train Results ===")
            for train_result in result['results']:
                print(f"Train {train_result['train_no']}:")
                print(f"  Priority: {train_result['priority_score']}")
                print(f"  Entry: {train_result['optimized_entry_iso']}")
                print(f"  Arrival: {train_result['optimized_arrival_iso']}")
                print(f"  Hold: {train_result['hold_seconds']}s ({train_result['action']})")
                print()
            
            return result
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to optimizer service at localhost:5000")
        print("Make sure the service is running: python solver.py")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == '__main__':
    test_optimizer()

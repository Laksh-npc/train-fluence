#!/usr/bin/env python3
"""
Script to automatically add test train data to Firebase for optimization testing
"""

import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase (you'll need your service account key)
# Download from Firebase Console > Project Settings > Service Accounts
try:
    cred = credentials.Certificate('server/firebase-service-account.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Connected to Firebase")
except Exception as e:
    print(f"❌ Firebase connection failed: {e}")
    print("Make sure you have the firebase-service-account.json file in the server folder")
    exit(1)

# Test train data
test_trains = [
    {
        "train_no": "12951",
        "train_name": "Mumbai Rajdhani Express",
        "priority_score": 90,
        "current_station": "NDLS",
        "next_station": "GWL",
        "estimated_arrival_next": "2025-09-19T20:30:00Z",
        "scheduled_arrival_next": "2025-09-19T20:25:00Z",
        "delay_minutes": 5,
        "dwell_time_seconds": 120,
        "segment_travel_time_seconds": {
            "from": "NDLS",
            "to": "GWL",
            "seconds": 1800
        },
        "position": {
            "lat": 28.6139,
            "lon": 77.2090
        },
        "updatedAt": "2025-09-19T20:15:00Z"
    },
    {
        "train_no": "12009",
        "train_name": "Mumbai Shatabdi Express", 
        "priority_score": 85,
        "current_station": "NDLS",
        "next_station": "GWL",
        "estimated_arrival_next": "2025-09-19T20:32:00Z",
        "scheduled_arrival_next": "2025-09-19T20:30:00Z",
        "delay_minutes": 2,
        "dwell_time_seconds": 90,
        "segment_travel_time_seconds": {
            "from": "NDLS", 
            "to": "GWL",
            "seconds": 1800
        },
        "position": {
            "lat": 28.6139,
            "lon": 77.2090
        },
        "updatedAt": "2025-09-19T20:15:00Z"
    },
    {
        "train_no": "22691",
        "train_name": "Rajdhani Express",
        "priority_score": 88,
        "current_station": "NDLS",
        "next_station": "GWL", 
        "estimated_arrival_next": "2025-09-19T20:35:00Z",
        "scheduled_arrival_next": "2025-09-19T20:32:00Z",
        "delay_minutes": 3,
        "dwell_time_seconds": 150,
        "segment_travel_time_seconds": {
            "from": "NDLS",
            "to": "GWL", 
            "seconds": 1800
        },
        "position": {
            "lat": 28.6139,
            "lon": 77.2090
        },
        "updatedAt": "2025-09-19T20:15:00Z"
    },
    {
        "train_no": "09472",
        "train_name": "Freight Express",
        "priority_score": 40,
        "current_station": "NDLS",
        "next_station": "GWL",
        "estimated_arrival_next": "2025-09-19T20:28:00Z", 
        "scheduled_arrival_next": "2025-09-19T20:25:00Z",
        "delay_minutes": 3,
        "dwell_time_seconds": 300,
        "segment_travel_time_seconds": {
            "from": "NDLS",
            "to": "GWL",
            "seconds": 1800
        },
        "position": {
            "lat": 28.6139,
            "lon": 77.2090
        },
        "updatedAt": "2025-09-19T20:15:00Z"
    },
    {
        "train_no": "12903",
        "train_name": "Mumbai Express",
        "priority_score": 75,
        "current_station": "NDLS", 
        "next_station": "GWL",
        "estimated_arrival_next": "2025-09-19T20:40:00Z",
        "scheduled_arrival_next": "2025-09-19T20:35:00Z",
        "delay_minutes": 5,
        "dwell_time_seconds": 180,
        "segment_travel_time_seconds": {
            "from": "NDLS",
            "to": "GWL",
            "seconds": 1800
        },
        "position": {
            "lat": 28.6139,
            "lon": 77.2090
        },
        "updatedAt": "2025-09-19T20:15:00Z"
    }
]

def clear_existing_trains():
    """Clear all existing train data"""
    print("🗑️ Clearing existing train data...")
    trains_ref = db.collection('trains')
    docs = trains_ref.stream()
    
    deleted_count = 0
    for doc in docs:
        doc.reference.delete()
        deleted_count += 1
    
    print(f"✅ Deleted {deleted_count} existing train records")

def add_test_trains():
    """Add test train data to Firebase"""
    print("🚂 Adding test train data...")
    
    for train in test_trains:
        # Use train_no as document ID
        doc_ref = db.collection('trains').document(train['train_no'])
        doc_ref.set(train)
        print(f"✅ Added train {train['train_no']} - {train['train_name']}")
    
    print(f"🎉 Successfully added {len(test_trains)} test trains!")

def main():
    print("🚀 Setting up test data for optimization algorithm...")
    
    # Clear existing data first
    clear_existing_trains()
    
    # Add test data
    add_test_trains()
    
    print("\n🎯 Test data setup complete!")
    print("Now you can test your optimization algorithm at:")
    print("1. http://localhost:8080/ - Click 'Run AI Optimization'")
    print("2. http://localhost:8080/analytics - View optimization results")
    print("3. http://localhost:8080/dashboard - See live train data")

if __name__ == "__main__":
    main()

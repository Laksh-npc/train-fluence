#!/usr/bin/env python3
"""
Railway Traffic Optimization Solver using OR-Tools CP-SAT
Implements MILP for train scheduling with conflict resolution
"""

import json
import time
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

from flask import Flask, request, jsonify
from ortools.sat.python import cp_model


@dataclass
class Train:
    train_no: str
    priority_score: int
    current_station: str
    next_station: str
    earliest_entry_seconds: int
    travel_time_seconds: int
    dwell_time_seconds: int


@dataclass
class SolverParams:
    time_limit_seconds: int = 20
    headway_seconds: int = 180
    max_hold_minutes: int = 120


class TrainOptimizer:
    def __init__(self):
        self.model = None
        self.solver = None
        self.trains = []
        self.train_indices = {}
        self.variables = {}
        self.solver_params = SolverParams()
    
    def parse_input(self, input_data: Dict) -> Tuple[List[Train], SolverParams]:
        """Parse input JSON and create Train objects"""
        trains = []
        train_data = input_data.get('trains', [])
        solver_params_data = input_data.get('solver_params', {})
        
        # Parse solver parameters
        solver_params = SolverParams(
            time_limit_seconds=solver_params_data.get('time_limit_seconds', 20),
            headway_seconds=solver_params_data.get('headway_seconds', 180),
            max_hold_minutes=solver_params_data.get('max_hold_minutes', 120)
        )
        
        # Parse trains
        for i, train_data in enumerate(train_data):
            train = Train(
                train_no=train_data['train_no'],
                priority_score=train_data['priority_score'],
                current_station=train_data['current_station'],
                next_station=train_data['next_station'],
                earliest_entry_seconds=train_data['earliest_entry_seconds'],
                travel_time_seconds=train_data['segment']['seconds'],
                dwell_time_seconds=train_data['dwell_time_seconds']
            )
            trains.append(train)
            self.train_indices[train.train_no] = i
        
        return trains, solver_params
    
    def build_model(self, trains: List[Train], params: SolverParams):
        """Build CP-SAT model for train scheduling"""
        self.trains = trains
        self.solver_params = params
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        
        # Set solver parameters
        self.solver.parameters.max_time_in_seconds = params.time_limit_seconds
        
        # Create variables
        self._create_variables()
        
        # Add constraints
        self._add_constraints()
        
        # Set objective
        self._set_objective()
    
    def _create_variables(self):
        """Create decision variables"""
        max_time = max(train.earliest_entry_seconds for train in self.trains) + 3600  # 1 hour buffer
        
        # Start time variables for each train
        for i, train in enumerate(self.trains):
            var_name = f'start_time_{i}'
            self.variables[var_name] = self.model.NewIntVar(
                train.earliest_entry_seconds,
                max_time,
                var_name
            )
        
        # Ordering variables for conflicting trains
        for i in range(len(self.trains)):
            for j in range(i + 1, len(self.trains)):
                if self._trains_conflict(i, j):
                    var_name = f'order_{i}_{j}'
                    self.variables[var_name] = self.model.NewBoolVar(var_name)
    
    def _trains_conflict(self, i: int, j: int) -> bool:
        """Check if two trains conflict (same segment)"""
        train_i = self.trains[i]
        train_j = self.trains[j]
        
        # Trains conflict if they share the same segment
        return (train_i.current_station == train_j.current_station and 
                train_i.next_station == train_j.next_station)
    
    def _add_constraints(self):
        """Add constraints to the model"""
        # Headway constraints for conflicting trains
        for i in range(len(self.trains)):
            for j in range(i + 1, len(self.trains)):
                if self._trains_conflict(i, j):
                    self._add_headway_constraint(i, j)
    
    def _add_headway_constraint(self, i: int, j: int):
        """Add headway constraint between two conflicting trains"""
        train_i = self.trains[i]
        train_j = self.trains[j]
        headway = self.solver_params.headway_seconds
        
        start_i = self.variables[f'start_time_{i}']
        start_j = self.variables[f'start_time_{j}']
        order_var = self.variables[f'order_{i}_{j}']
        
        # Large constant for big-M constraint
        M = 86400  # 24 hours in seconds
        
        # If order_var = 1, then train i goes first
        # start_i + travel_time_i + headway <= start_j + M * (1 - order_var)
        self.model.Add(
            start_i + train_i.travel_time_seconds + headway <= 
            start_j + M * (1 - order_var)
        )
        
        # If order_var = 0, then train j goes first
        # start_j + travel_time_j + headway <= start_i + M * order_var
        self.model.Add(
            start_j + train_j.travel_time_seconds + headway <= 
            start_i + M * order_var
        )
    
    def _set_objective(self):
        """Set objective: minimize weighted delay"""
        delay_terms = []
        
        for i, train in enumerate(self.trains):
            start_var = self.variables[f'start_time_{i}']
            # Delay = start_time - earliest_entry_time
            delay = start_var - train.earliest_entry_seconds
            # Weight by priority score
            weighted_delay = delay * train.priority_score
            delay_terms.append(weighted_delay)
        
        # Minimize total weighted delay
        self.model.Minimize(sum(delay_terms))
    
    def solve(self) -> Dict:
        """Solve the model and return results"""
        start_time = time.time()
        
        # Solve
        status = self.solver.Solve(self.model)
        solve_time = time.time() - start_time
        
        # Parse results
        results = []
        objective_value = 0
        
        if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            objective_value = self.solver.ObjectiveValue()
            
            for i, train in enumerate(self.trains):
                start_var = self.variables[f'start_time_{i}']
                start_time_seconds = self.solver.Value(start_var)
                
                # Calculate hold time
                hold_seconds = max(0, start_time_seconds - train.earliest_entry_seconds)
                
                # Convert to ISO strings
                start_iso = datetime.fromtimestamp(start_time_seconds, tz=timezone.utc).isoformat()
                arrival_iso = datetime.fromtimestamp(
                    start_time_seconds + train.travel_time_seconds, 
                    tz=timezone.utc
                ).isoformat()
                
                result = {
                    'train_no': train.train_no,
                    'optimized_entry_epoch': start_time_seconds,
                    'optimized_entry_iso': start_iso,
                    'optimized_arrival_iso': arrival_iso,
                    'hold_seconds': int(hold_seconds),
                    'action': 'HOLD' if hold_seconds > 0 else 'PROCEED',
                    'priority_score': train.priority_score
                }
                results.append(result)
        
        elif status == cp_model.INFEASIBLE:
            # Fallback: greedy heuristic
            results = self._greedy_fallback()
        
        # Map status
        status_map = {
            cp_model.OPTIMAL: 'OPTIMAL',
            cp_model.FEASIBLE: 'FEASIBLE',
            cp_model.INFEASIBLE: 'INFEASIBLE',
            cp_model.UNKNOWN: 'UNKNOWN'
        }
        
        return {
            'solver_meta': {
                'status': status_map.get(status, 'UNKNOWN'),
                'objective_value': objective_value,
                'solve_time_seconds': solve_time
            },
            'results': results
        }
    
    def _greedy_fallback(self) -> List[Dict]:
        """Greedy fallback when solver is infeasible"""
        # Sort trains by priority (higher priority first)
        sorted_trains = sorted(self.trains, key=lambda t: t.priority_score, reverse=True)
        
        results = []
        current_time = min(train.earliest_entry_seconds for train in self.trains)
        
        for train in sorted_trains:
            # Assign sequential slots
            start_time_seconds = max(current_time, train.earliest_entry_seconds)
            hold_seconds = max(0, start_time_seconds - train.earliest_entry_seconds)
            
            start_iso = datetime.fromtimestamp(start_time_seconds, tz=timezone.utc).isoformat()
            arrival_iso = datetime.fromtimestamp(
                start_time_seconds + train.travel_time_seconds, 
                tz=timezone.utc
            ).isoformat()
            
            result = {
                'train_no': train.train_no,
                'optimized_entry_epoch': start_time_seconds,
                'optimized_entry_iso': start_iso,
                'optimized_arrival_iso': arrival_iso,
                'hold_seconds': int(hold_seconds),
                'action': 'HOLD' if hold_seconds > 0 else 'PROCEED',
                'priority_score': train.priority_score
            }
            results.append(result)
            
            # Update current time for next train
            current_time = start_time_seconds + train.travel_time_seconds + self.solver_params.headway_seconds
        
        return results


# Flask app
app = Flask(__name__)


@app.route('/solve', methods=['POST'])
def solve():
    """Main solver endpoint"""
    try:
        input_data = request.get_json()
        if not input_data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Create optimizer
        optimizer = TrainOptimizer()
        
        # Parse input
        trains, solver_params = optimizer.parse_input(input_data)
        
        if not trains:
            return jsonify({'error': 'No valid trains provided'}), 400
        
        # Build and solve model
        optimizer.build_model(trains, solver_params)
        result = optimizer.solve()
        
        # Add run_id to result
        result['run_id'] = input_data.get('run_id', f'optim_{int(time.time())}')
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Solver error: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'train-optimizer'})


if __name__ == '__main__':
    print("Starting Train Optimizer Service...")
    app.run(host='0.0.0.0', port=5000, debug=True)

import { Router } from 'express';
import { runOptimization } from '../services/preprocessForOptimizer.js';

const router = Router();

/**
 * POST /api/optimize
 * Trigger optimization run
 */
router.post('/', async (req, res) => {
  try {
    console.log('[POST /api/optimize] Starting optimization run');
    
    // Extract solver parameters from request body (optional)
    const solverParams = req.body.solver_params || {};
    
    // Run optimization pipeline
    const result = await runOptimization(solverParams);
    
    console.log(`[POST /api/optimize] Completed: ${result.run_id}, status: ${result.solver_status}`);
    
    res.json({
      success: true,
      run_id: result.run_id,
      solver_status: result.solver_status,
      objective_value: result.objective_value,
      train_count: result.train_count,
      summary: result.summary,
      message: `Optimization completed with status: ${result.solver_status}`
    });
    
  } catch (error) {
    console.error('[POST /api/optimize] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to run optimization'
    });
  }
});

export default router;

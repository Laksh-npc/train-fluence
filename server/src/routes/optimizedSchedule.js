import { Router } from 'express';
import { db } from '../config/firebase.js';

const router = Router();

/**
 * GET /api/optimized-schedule/{run_id}
 * Fetch optimization result by run ID
 */
router.get('/:run_id', async (req, res) => {
  try {
    const { run_id } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    console.log(`[GET /api/optimized-schedule/${run_id}] Fetching optimization result`);
    
    const doc = await db.collection('optimizations').doc(run_id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Optimization result not found',
        run_id
      });
    }
    
    const data = doc.data();
    
    // Apply pagination to results if needed
    const results = data.results || [];
    const paginatedResults = results.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      run_id,
      solver_meta: data.solver_meta || {},
      input_snapshot: data.input_snapshot || {},
      results: paginatedResults,
      total_results: results.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < results.length
      },
      created_at: data.created_at
    });
    
  } catch (error) {
    console.error(`[GET /api/optimized-schedule/${req.params.run_id}] Error:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch optimization result'
    });
  }
});

/**
 * GET /api/optimized-schedule/latest
 * Fetch most recent optimization result
 */
router.get('/latest', async (req, res) => {
  try {
    const { limit = 1 } = req.query;
    
    console.log('[GET /api/optimized-schedule/latest] Fetching latest optimization');
    
    // Get all optimization documents and sort by run_id (which contains timestamp)
    const snapshot = await db.collection('optimizations').get();
    
    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'No optimization results found'
      });
    }
    
    // Sort by run_id (which contains timestamp) to get the latest
    const docs = [];
    snapshot.forEach(doc => {
      docs.push({
        run_id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by run_id descending (latest first)
    docs.sort((a, b) => b.run_id.localeCompare(a.run_id));
    
    // Take the requested number of results
    const results = docs.slice(0, parseInt(limit));
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No optimization results found'
      });
    }
    
    // Return the latest result in the same format as the specific run_id endpoint
    const latest = results[0];
    res.json({
      success: true,
      run_id: latest.run_id,
      solver_meta: latest.solver_meta || {},
      input_snapshot: latest.input_snapshot || {},
      results: latest.results || [],
      total_results: (latest.results || []).length,
      pagination: {
        limit: parseInt(limit),
        offset: 0,
        has_more: false
      },
      created_at: latest.created_at
    });
    
  } catch (error) {
    console.error('[GET /api/optimized-schedule/latest] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch latest optimization results'
    });
  }
});

export default router;

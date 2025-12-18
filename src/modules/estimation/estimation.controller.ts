import { Router, Request, Response } from 'express';
import { EstimationService } from './estimation.service';
import { EstimationRequest } from './estimation.types';

export function createEstimationRouter(estimationService: EstimationService): Router {
  const router = Router();

  /**
   * POST /api/v1/estimations/search
   * Semantic search for construction work items
   */
  router.post('/search', async (req: Request, res: Response) => {
    try {
      const { query, language = 'en', country = 'EE', topK = 5 } = req.body;

      // Validate input
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required and must be a string' });
      }

      if (!['en', 'de'].includes(language)) {
        return res.status(400).json({ error: 'Language must be "en" or "de"' });
      }

      const results = await estimationService.searchWorkItems(
        query,
        language as 'en' | 'de',
        country,
        topK
      );

      res.json({
        success: true,
        query,
        language,
        country,
        resultCount: results.length,
        results
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/v1/estimations/from-cad
   * Generate cost estimate from CAD elements
   */
  router.post('/from-cad', async (req: Request, res: Response) => {
    try {
      const { cadElements, projectId, language = 'en', country = 'EE' } = req.body;

      if (!cadElements || !Array.isArray(cadElements)) {
        return res.status(400).json({ error: 'cadElements must be an array' });
      }

      if (!projectId) {
        return res.status(400).json({ error: 'projectId is required' });
      }

      // Generate estimate
      const estimate = await estimationService.estimateFromCAD(
        cadElements,
        projectId,
        language as 'en' | 'de',
        country
      );

      // Save to database
      const saved = await estimationService.saveEstimation(projectId, estimate);

      res.json({
        success: true,
        estimationId: saved.id,
        projectId: saved.projectId,
        estimate: {
          itemCount: estimate.items.length,
          costBreakdown: estimate.costBreakdown,
          language,
          country,
          items: estimate.items
        }
      });
    } catch (error) {
      console.error('Estimation error:', error);
      res.status(500).json({
        error: 'Estimation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/v1/estimations/projects/:projectId
   * Get estimation history for a project
   */
  router.get('/projects/:projectId', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ error: 'projectId is required' });
      }

      const estimations = await estimationService.getProjectEstimations(projectId);

      res.json({
        success: true,
        projectId,
        estimationCount: estimations.length,
        estimations
      });
    } catch (error) {
      console.error('History fetch error:', error);
      res.status(500).json({
        error: 'Failed to fetch estimations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/v1/estimations/health
   * Health check for estimation service
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const isHealthy = await estimationService.healthCheck();
      res.json({
        status: isHealthy ? 'ok' : 'degraded',
        qdrantCollections: isHealthy ? ['ddc-cwicr-en', 'ddc-cwicr-de'] : []
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed'
      });
    }
  });

  return router;
}

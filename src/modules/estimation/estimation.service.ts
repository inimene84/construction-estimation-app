import { QdrantClient } from '@qdrant/js-client-rest';
import axios from 'axios';
import { Pool } from 'pg';
import { EstimationRequest, SearchResult, CostEstimate } from './estimation.types';

export class EstimationService {
  private qdrant: QdrantClient;
  private pool: Pool;
  private llmUrl: string;
  private cache: Map<string, SearchResult[]> = new Map();

  constructor(qdrantUrl: string, pgPool: Pool, llmUrl: string) {
    this.qdrant = new QdrantClient({ url: qdrantUrl });
    this.pool = pgPool;
    this.llmUrl = llmUrl;
  }

  /**
   * Search construction work items by language (EN or DE snapshot)
   */
  async searchWorkItems(
    query: string,
    language: 'en' | 'de' = 'en',
    country: string = 'EE',
    topK: number = 5
  ): Promise<SearchResult[]> {
    // Check cache first
    const cacheKey = `${language}:${country}:${query.toLowerCase()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Determine collection based on language
    const collection = language === 'de' ? 'ddc-cwicr-de' : 'ddc-cwicr-en';

    try {
      // Generate embedding for query using local service
      const embedding = await this.generateEmbedding(query);

      // Search Qdrant with filters
      const results = await this.qdrant.search(collection, {
        vector: embedding,
        limit: topK,
        query_filter: {
          must: [
            { key: 'country', match: { value: country } },
            { key: 'language', match: { value: language } }
          ]
        },
        with_payload: true
      });

      // Format results
      const formattedResults: SearchResult[] = results.map(r => ({
        id: r.id,
        similarity: (r.score * 100).toFixed(1) + '%',
        description: r.payload?.description || '',
        laborHours: r.payload?.labor_hours || 0,
        materials: r.payload?.materials || {},
        estimatedCost: r.payload?.estimated_cost || 0,
        category: r.payload?.category || '',
        phase: r.payload?.phase || ''
      }));

      // Cache for 1 hour
      this.cache.set(cacheKey, formattedResults);
      setTimeout(() => this.cache.delete(cacheKey), 3600000);

      return formattedResults;
    } catch (error) {
      console.error(`Search failed for query: ${query}`, error);
      throw error;
    }
  }

  /**
   * Estimate construction project from CAD elements
   */
  async estimateFromCAD(
    cadElements: any[],
    projectId: string,
    language: 'en' | 'de' = 'en',
    country: string = 'EE'
  ): Promise<CostEstimate> {
    const estimates: any[] = [];
    const costBreakdown = {
      labor: 0,
      materials: 0,
      equipment: 0,
      total: 0,
      byPhase: {} as Record<string, number>
    };

    // Process each CAD element
    for (const element of cadElements) {
      try {
        // Search for matching work items
        const matches = await this.searchWorkItems(
          element.description,
          language,
          country,
          1
        );

        if (matches.length > 0) {
          const match = matches[0];
          const quantity = element.quantity || 1;
          const itemCost = (match.estimatedCost || 0) * quantity;
          const laborCost = (match.laborHours || 0) * quantity * 50; // $50/hour base rate
          const phase = match.phase || 'Construction';

          estimates.push({
            elementId: element.id,
            elementName: element.name,
            ddcItemId: match.id,
            description: match.description,
            quantity,
            unitCost: match.estimatedCost,
            materialCost: itemCost,
            laborCost,
            totalCost: itemCost + laborCost,
            laborHours: match.laborHours,
            phase,
            similarity: match.similarity
          });

          // Update cost breakdown
          costBreakdown.labor += laborCost;
          costBreakdown.materials += itemCost;
          costBreakdown.byPhase[phase] = (costBreakdown.byPhase[phase] || 0) + itemCost + laborCost;
        }
      } catch (error) {
        console.warn(`Could not estimate element: ${element.name}`, error);
      }
    }

    costBreakdown.total = costBreakdown.labor + costBreakdown.materials + costBreakdown.equipment;

    return {
      projectId,
      items: estimates,
      costBreakdown,
      language,
      country,
      createdAt: new Date()
    };
  }

  /**
   * Save estimation to PostgreSQL
   */
  async saveEstimation(
    projectId: string,
    estimate: CostEstimate
  ): Promise<{ id: string; projectId: string }> {
    const query = `
      INSERT INTO estimations (
        project_id, elements, cost_breakdown, language, country, created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, project_id
    `;

    const result = await this.pool.query(query, [
      projectId,
      JSON.stringify(estimate.items),
      JSON.stringify(estimate.costBreakdown),
      estimate.language,
      estimate.country
    ]);

    return result.rows[0];
  }

  /**
   * Get project estimation history
   */
  async getProjectEstimations(projectId: string) {
    const query = `
      SELECT id, project_id, cost_breakdown, language, country, created_at
      FROM estimations
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const result = await this.pool.query(query, [projectId]);
    return result.rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      costBreakdown: row.cost_breakdown,
      language: row.language,
      country: row.country,
      createdAt: row.created_at
    }));
  }

  /**
   * Generate embedding for query using Sentence Transformers
   * or local embedding service
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.llmUrl}/embed`, { text }, {
        timeout: 5000
      });
      return response.data.embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error('Failed to generate embedding for query');
    }
  }

  /**
   * Health check for Qdrant collections
   */
  async healthCheck(): Promise<boolean> {
    try {
      const collections = await this.qdrant.getCollections();
      const hasEN = collections.collections.some(c => c.name === 'ddc-cwicr-en');
      const hasDE = collections.collections.some(c => c.name === 'ddc-cwicr-de');
      return hasEN || hasDE;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

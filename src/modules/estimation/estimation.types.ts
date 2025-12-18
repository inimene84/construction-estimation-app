/**
 * Estimation Module Type Definitions
 */

export interface EstimationRequest {
  cadElements: CADElement[];
  projectId: string;
  language?: 'en' | 'de';
  country?: string;
}

export interface CADElement {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  materials?: string[];
}

export interface SearchResult {
  id: number;
  similarity: string;
  description: string;
  laborHours: number;
  materials: Record<string, any>;
  estimatedCost: number;
  category: string;
  phase?: string;
}

export interface CostBreakdown {
  labor: number;
  materials: number;
  equipment: number;
  total: number;
  byPhase: Record<string, number>;
}

export interface EstimatedItem {
  elementId: string;
  elementName: string;
  ddcItemId: number;
  description: string;
  quantity: number;
  unitCost: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  laborHours: number;
  phase: string;
  similarity: string;
}

export interface CostEstimate {
  projectId: string;
  items: EstimatedItem[];
  costBreakdown: CostBreakdown;
  language: 'en' | 'de';
  country: string;
  createdAt: Date;
}

export interface EstimationResponse {
  success: boolean;
  estimationId?: string;
  projectId?: string;
  estimate?: {
    itemCount: number;
    costBreakdown: CostBreakdown;
    language: string;
    country: string;
    items: EstimatedItem[];
  };
  error?: string;
  message?: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  language: string;
  country: string;
  resultCount: number;
  results: SearchResult[];
}

export interface ProjectEstimation {
  id: string;
  projectId: string;
  costBreakdown: CostBreakdown;
  language: string;
  country: string;
  createdAt: Date;
}

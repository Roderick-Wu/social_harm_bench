// Type definitions for social harm benchmark data

export interface ModelResult {
  modelName: string;
  organization: string;
  releaseDate: string;
  attackSuccessRate: number;
  totalPrompts: number;
  successfulAttacks: number;
  errorRate?: number;
  modelType: 'open-source' | 'closed-source';
  downloadable: boolean;
  region: 'US' | 'Non-US';
  modelSize?: string; // e.g., "7B", "70B", "Unknown"
}

export interface BenchmarkCategory {
  id: string;
  name: string;
  description: string;
  promptCount: number;
}

export interface PromptExample {
  id: string;
  category: string;
  prompt: string;
  targetHarm: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ModelResponse {
  modelName: string;
  promptId: string;
  response: string;
  isSuccessfulAttack: boolean;
  harmCategory: string;
  reasoning?: string;
}

export interface BenchmarkData {
  benchmarkName: string;
  version: string;
  description: string;
  lastUpdated: string;
  categories: BenchmarkCategory[];
  modelResults: ModelResult[];
  samplePrompts: PromptExample[];
  sampleResponses: ModelResponse[];
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  modelName?: string;
  organization?: string;
}

export interface FilterOptions {
  organizations: string[];
  modelTypes: ('open-source' | 'closed-source')[];
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  minSuccessRate?: number;
  maxSuccessRate?: number;
}
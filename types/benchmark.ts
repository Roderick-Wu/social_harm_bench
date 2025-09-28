// Type definitions for social harm benchmark data

export interface ModelResult {
  modelName: string;
  organization: string;
  releaseDate?: string; // Made optional since political bias data doesn't use dates
  // For social harm benchmarks (backwards compatibility)
  attackSuccessRate?: number;
  totalPrompts?: number;
  successfulAttacks?: number;
  errorRate?: number;
  // For political bias research
  fScaleEnglish?: number;
  fScaleMandarin?: number;
  favScoreDemocratic?: number; // Legacy field
  favScoreAuthoritarian?: number; // Legacy field
  favScoreDemocraticEnglish?: number;
  favScoreAuthoritarianEnglish?: number;
  favScoreDemocraticMandarin?: number;
  favScoreAuthoritarianMandarin?: number;
  roleModelAuthPercent?: number;
  wasserstein_distance?: number; // Legacy field
  wassersteinDistanceEnglish?: number;
  wassersteinDistanceMandarin?: number;
  // Common fields
  modelType?: 'open-source' | 'closed-source'; // Made optional - deprecated
  downloadable: boolean;
  region: 'US' | 'Non-US';
  modelSize?: string; // e.g., "7B", "70B", "Unknown"
  benchmarkScores?: {
    [key: string]: number;
  };
}

export interface BenchmarkCategory {
  id: string;
  name: string;
  description: string;
  promptCount: number;
  subcategories?: string[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: string;
  url: string;
  datasetUrl?: string;
  description: string;
  categories?: string[];
  promptCount?: number;
  type: 'dataset' | 'performance';
  abstract?: string;
  modelResults?: ModelResult[];
  samplePrompts?: PromptExample[];
  sampleResponses?: ModelResponse[];
}

export interface PromptExample {
  id: string;
  category: string;
  prompt: string;
  targetHarm: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subcategory?: string;
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
  siteName: string;
  labName: string;
  version: string;
  description: string;
  lastUpdated: string;
  researchPapers: ResearchPaper[];
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
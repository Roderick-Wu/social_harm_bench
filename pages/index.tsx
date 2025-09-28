import { useEffect, useState } from 'react';
import LeaderboardTable from '@/components/leaderboard_table';
import BenchmarkCharts from '@/components/benchmark_charts';
import PromptShowcase from '@/components/prompt_showcase';
import FilterControls from '@/components/filter_controls';
import { BenchmarkData, ResearchPaper, ModelResult } from '@/types/benchmark';

type TabType = 'socialharmbench' | 'historical-revisionism' | 'llm-human-rights' | 'democratic-authoritarian';

export default function Home() {
  const [mainData, setMainData] = useState<BenchmarkData | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [paperData, setPaperData] = useState<any>(null);
  const [filteredResults, setFilteredResults] = useState<ModelResult[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>('socialharmbench');
  const [selectedView, setSelectedView] = useState<'overview' | 'leaderboard' | 'charts' | 'prompts'>('overview');
  const [jailbreakMethod, setJailbreakMethod] = useState<'weight_tampering' | 'latent_space_perturbation' | 'greedy_coordinate_gradient' | 'embedding_optimization' | 'autodan_ga' | 'autodan_hga'>('weight_tampering');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMainData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/jinesis_research_data.json');
        if (!response.ok) {
          throw new Error('Failed to load research data');
        }
        const data: BenchmarkData = await response.json();
        setMainData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error loading research data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMainData();
  }, []);

  useEffect(() => {
    if (mainData) {
      const paper = mainData.researchPapers.find(p => p.id === selectedTab);
      setSelectedPaper(paper || null);
      
      // Load paper-specific data
      loadPaperData(selectedTab);
    }
  }, [selectedTab, mainData]);

  const loadPaperData = async (paperId: string) => {
    try {
      const response = await fetch(`/data/${paperId.replace(/-/g, '_')}_data.json`);
      if (!response.ok) {
        throw new Error(`Failed to load data for ${paperId}`);
      }
      const data = await response.json();
      setPaperData(data);
      setFilteredResults(data.modelResults || []);
    } catch (err) {
      console.error('Error loading paper data:', err);
      setPaperData(null);
      setFilteredResults([]);
    }
  };

  const handleFilterChange = (filtered: ModelResult[]) => {
    setFilteredResults(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading research data...</p>
        </div>
      </div>
    );
  }

  if (error || !mainData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
          <p className="text-gray-600">{error || 'Failed to load research data'}</p>
        </div>
      </div>
    );
  }

  const paperTabs = [
    { key: 'socialharmbench', label: 'SocialHarmBench', icon: '🛡️' },
    { key: 'historical-revisionism', label: 'Historical Revisionism', icon: '📚' },
    { key: 'llm-human-rights', label: 'Human Rights', icon: '⚖️' },
    { key: 'democratic-authoritarian', label: 'Democratic vs Authoritarian', icon: '🗳️' },
  ];

  const viewTabs = [
    { key: 'overview', label: 'Overview', icon: '📋' },
    { key: 'leaderboard', label: 'Model Performance', icon: '📊' },
    { key: 'charts', label: 'Analysis', icon: '📈' },
    { key: 'prompts', label: 'Examples', icon: '💬' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Jinesis</span> Research Lab
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(mainData.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-700 max-w-4xl">
            {mainData.description}
          </p>
        </div>
      </div>

      {/* Paper Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {paperTabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTab(key as TabType);
                  setSelectedView('overview');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Current Paper Info */}
      {selectedPaper && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedPaper.title}</h2>
            <p className="text-gray-600 mb-3">{selectedPaper.abstract || selectedPaper.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>By: {selectedPaper.authors.join(', ')}</span>
              <span>Year: {selectedPaper.year}</span>
              <a
                href={selectedPaper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Paper
              </a>
              {selectedPaper.datasetUrl && (
                <a
                  href={selectedPaper.datasetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Dataset
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {viewTabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as typeof selectedView)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  selectedView === key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'overview' && selectedPaper && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Overview</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700">{selectedPaper.description}</p>
                
                {selectedPaper.categories && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Research Categories:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPaper.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPaper.promptCount && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-600">
                      Dataset size: {selectedPaper.promptCount} prompts
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Key Findings or Metrics */}
            {paperData && paperData.modelResults && paperData.modelResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Findings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {paperData.modelResults.length}
                    </div>
                    <div className="text-sm text-gray-600">Models Evaluated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.min(...paperData.modelResults.map((m: ModelResult) => m.attackSuccessRate)).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Best Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Math.max(...paperData.modelResults.map((m: ModelResult) => m.attackSuccessRate)).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Highest Vulnerability</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedView === 'leaderboard' && paperData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters */}
              <div className="lg:col-span-1">
                <FilterControls 
                  modelResults={paperData.modelResults || []}
                  onFilterChange={handleFilterChange}
                />
              </div>
              
              {/* Results */}
              <div className="lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Model Performance
                  </h2>
                  <span className="text-sm text-gray-500">
                    Showing {filteredResults.length} of {paperData.modelResults?.length || 0} models
                  </span>
                </div>
                <LeaderboardTable 
                  modelResults={filteredResults}
                  jailbreakMethod={jailbreakMethod}
                  onJailbreakMethodChange={setJailbreakMethod}
                  onModelClick={(model) => console.log('Selected model:', model)}
                />
              </div>
            </div>
          </div>
        )}

        {selectedView === 'charts' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Analysis</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Explore visualizations of model performance, trends over time, and comparisons across organizations and model types.
              </p>
            </div>
            
            {/* Jailbreak Method Selector for SocialHarmBench */}
            {selectedTab === 'socialharmbench' && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Jailbreak Method:
                  </label>
                  <div className="flex space-x-2">
                    {['weight_tampering', 'latent_space_perturbation', 'greedy_coordinate_gradient', 'embedding_optimization', 'autodan_ga', 'autodan_hga'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setJailbreakMethod(method as 'weight_tampering' | 'latent_space_perturbation' | 'greedy_coordinate_gradient' | 'embedding_optimization' | 'autodan_ga' | 'autodan_hga')}
                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                          jailbreakMethod === method
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {method === 'weight_tampering' ? 'Weight Tampering' :
                         method === 'latent_space_perturbation' ? 'Latent-Space Perturbation' :
                         method === 'greedy_coordinate_gradient' ? 'Greedy Coordinate Gradient' :
                         method === 'embedding_optimization' ? 'Embedding Optimization' :
                         method === 'autodan_ga' ? 'AutoDAN (GA)' :
                         'AutoDAN (HGA)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <BenchmarkCharts 
              modelResults={filteredResults} 
              jailbreakMethod={jailbreakMethod}
            />
          </div>
        )}

        {selectedView === 'prompts' && paperData && (
          <div className="space-y-6">
            <PromptShowcase 
              samplePrompts={paperData.samplePrompts || []}
              sampleResponses={paperData.sampleResponses || []}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Jinesis Research Lab</h3>
              <p className="text-gray-600 text-sm">
                Cutting-edge research in AI safety, political bias detection, and social harm evaluation. 
                Our work spans multiple domains to understand and improve the safety of large language models.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Areas</h3>
              <div className="space-y-1">
                {mainData.categories.map(category => (
                  <div key={category.id} className="text-sm text-gray-600">
                    {category.name}: {category.promptCount} test cases
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Papers</h3>
              <div className="space-y-2">
                {mainData.researchPapers.map(paper => (
                  <div key={paper.id} className="text-sm">
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline block"
                    >
                      {paper.title}
                    </a>
                    <span className="text-gray-500">{paper.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Jinesis Research Lab © 2025 - Advancing AI Safety Research
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
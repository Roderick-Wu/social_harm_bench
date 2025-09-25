import { useEffect, useState } from 'react';
import LeaderboardTable from '@/components/leaderboard_table';
import BenchmarkCharts from '@/components/benchmark_charts';
import PromptShowcase from '@/components/prompt_showcase';
import FilterControls from '@/components/filter_controls';
import { BenchmarkData, ModelResult } from '@/types/benchmark';

export default function Home() {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [filteredResults, setFilteredResults] = useState<ModelResult[]>([]);
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'charts' | 'prompts'>('leaderboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBenchmarkData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/benchmark_data.json');
        if (!response.ok) {
          throw new Error('Failed to load benchmark data');
        }
        const data: BenchmarkData = await response.json();
        setBenchmarkData(data);
        setFilteredResults(data.modelResults);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error loading benchmark data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBenchmarkData();
  }, []);

  const handleFilterChange = (filtered: ModelResult[]) => {
    setFilteredResults(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading benchmark data...</p>
        </div>
      </div>
    );
  }

  if (error || !benchmarkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
          <p className="text-gray-600">{error || 'Failed to load benchmark data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Social Harm Benchmark</h1>
              <span className="ml-4 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                v{benchmarkData.version}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(benchmarkData.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-700 max-w-4xl">
            {benchmarkData.description}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'leaderboard', label: 'Leaderboard', icon: '📊' },
              { key: 'charts', label: 'Data Insights', icon: '📈' },
              { key: 'prompts', label: 'Prompt Showcase', icon: '💬' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as typeof selectedTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters */}
              <div className="lg:col-span-1">
                <FilterControls 
                  modelResults={benchmarkData.modelResults}
                  onFilterChange={handleFilterChange}
                />
              </div>
              
              {/* Results */}
              <div className="lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Model Leaderboard
                  </h2>
                  <span className="text-sm text-gray-500">
                    Showing {filteredResults.length} of {benchmarkData.modelResults.length} models
                  </span>
                </div>
                <LeaderboardTable 
                  modelResults={filteredResults}
                  onModelClick={(model) => console.log('Selected model:', model)}
                />
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'charts' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Insights</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Explore visualizations of model performance, trends over time, and comparisons across organizations and model types.
              </p>
            </div>
            <BenchmarkCharts modelResults={filteredResults} />
          </div>
        )}

        {selectedTab === 'prompts' && (
          <div className="space-y-6">
            <PromptShowcase 
              samplePrompts={benchmarkData.samplePrompts}
              sampleResponses={benchmarkData.sampleResponses}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Benchmark</h3>
              <p className="text-gray-600 text-sm">
                This benchmark evaluates AI model safety against social harm attacks across 
                {benchmarkData.categories.length} categories with over{' '}
                {benchmarkData.categories.reduce((sum, cat) => sum + cat.promptCount, 0)} test prompts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                {benchmarkData.categories.map(category => (
                  <div key={category.id} className="text-sm text-gray-600">
                    {category.name}: {category.promptCount} prompts
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Methodology</h3>
              <p className="text-gray-600 text-sm">
                Models are evaluated on their ability to refuse harmful requests. Lower attack success rates indicate better safety measures.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Social Harm Benchmark © 2025 - Built for AI Safety Research
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
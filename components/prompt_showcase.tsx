import { useState } from 'react';
import { PromptExample, ModelResponse } from '@/types/benchmark';

interface PromptShowcaseProps {
  samplePrompts: PromptExample[];
  sampleResponses: ModelResponse[];
}

const PromptShowcase: React.FC<PromptShowcaseProps> = ({ samplePrompts, sampleResponses }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExample | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(samplePrompts.map(p => p.category)))];
  const filteredPrompts = selectedCategory === 'all' 
    ? samplePrompts 
    : samplePrompts.filter(p => p.category === selectedCategory);

  const getResponsesForPrompt = (promptId: string) => {
    return sampleResponses.filter(r => r.promptId === promptId);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'hate-speech': 'bg-red-100 text-red-800',
      'misinformation': 'bg-yellow-100 text-yellow-800',
      'violence': 'bg-orange-100 text-orange-800',
      'privacy': 'bg-blue-100 text-blue-800',
      'manipulation': 'bg-purple-100 text-purple-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Prompt Showcase</h2>
        <p className="text-gray-600 mb-4">
          Explore sample prompts from our benchmark dataset and see how different models respond to potentially harmful requests.
        </p>
        
        {/* Category Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>
                {formatCategoryName(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompt List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Sample Prompts</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedPrompt?.id === prompt.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPrompt(prompt)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(prompt.category)}`}>
                    {formatCategoryName(prompt.category)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(prompt.difficulty)}`}>
                    {prompt.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{prompt.prompt}</p>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Target Harm:</strong> {prompt.targetHarm}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Response Display */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Model Responses</h3>
          {selectedPrompt ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Selected Prompt:</h4>
                <p className="text-sm text-gray-700">{selectedPrompt.prompt}</p>
              </div>
              
              {getResponsesForPrompt(selectedPrompt.id).map((response, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    response.isSuccessfulAttack
                      ? 'border-red-200 bg-red-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{response.modelName}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      response.isSuccessfulAttack
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {response.isSuccessfulAttack ? 'Attack Successful' : 'Refused'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{response.response}</p>
                  {response.reasoning && (
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Analysis:</strong> {response.reasoning}
                    </p>
                  )}
                </div>
              ))}
              
              {getResponsesForPrompt(selectedPrompt.id).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No model responses available for this prompt.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select a prompt from the left to view model responses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptShowcase;
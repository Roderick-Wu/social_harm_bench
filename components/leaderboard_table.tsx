import { useState, useMemo } from 'react';
import { ModelResult } from '@/types/benchmark';

interface LeaderboardTableProps {
  modelResults: ModelResult[];
  onModelClick?: (model: ModelResult) => void;
  jailbreakMethod?: 'weight_tampering' | 'latent_space_perturbation' | 'greedy_coordinate_gradient' | 'embedding_optimization' | 'autodan_ga' | 'autodan_hga';
  onJailbreakMethodChange?: (method: 'weight_tampering' | 'latent_space_perturbation' | 'greedy_coordinate_gradient' | 'embedding_optimization' | 'autodan_ga' | 'autodan_hga') => void;
}

type SortField = 'modelName' | 'organization' | 'releaseDate' | 'attackSuccessRate' | 'fScaleEnglish' | 'roleModelAuthPercent' | 'modelSize';
type SortDirection = 'asc' | 'desc';

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  modelResults, 
  onModelClick, 
  jailbreakMethod = 'weight_tampering', 
  onJailbreakMethodChange 
}) => {
  // Determine the data type based on the first model
  const isPoliticalBiasData = useMemo(() => {
    return modelResults.length > 0 && modelResults[0].fScaleEnglish !== undefined;
  }, [modelResults]);

  const isSocialHarmBenchData = useMemo(() => {
    return modelResults.length > 0 && 
           modelResults[0].benchmarkScores && 
           (Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('weight_tampering')) ||
            Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('latent_space_perturbation')) ||
            Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('greedy_coordinate_gradient')) ||
            Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('embedding_optimization')) ||
            Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('autodan_ga')) ||
            Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('autodan_hga')));
  }, [modelResults]);

  // State for jailbreak method selection in SocialHarmBench
  // Now handled by parent component via props

  // Check which jailbreak methods are available
  const availableJailbreakMethods = useMemo(() => {
    if (!isSocialHarmBenchData || !modelResults[0]?.benchmarkScores) return [];
    
    const methods = [];
    if (Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('weight_tampering'))) {
      methods.push('weight_tampering');
    }
    if (Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('latent_space_perturbation'))) {
      methods.push('latent_space_perturbation');
    }
    if (Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('greedy_coordinate_gradient'))) {
      methods.push('greedy_coordinate_gradient');
    }
    if (Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('embedding_optimization'))) {
      methods.push('embedding_optimization');
    }
    if (Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('autodan_ga'))) {
      methods.push('autodan_ga');
    }
    if (Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('autodan_hga'))) {
      methods.push('autodan_hga');
    }
    return methods;
  }, [isSocialHarmBenchData, modelResults]);

  const [sortField, setSortField] = useState<SortField>(() => {
    if (isPoliticalBiasData) return 'fScaleEnglish';
    if (isSocialHarmBenchData) return 'modelName';
    return 'attackSuccessRate';
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Handle empty arrays gracefully
  if (!modelResults || modelResults.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-gray-400 text-lg mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Model Results Available</h3>
        <p className="text-gray-600">
          No model performance data is available for this research paper.
        </p>
      </div>
    );
  }

  const sortedResults = useMemo(() => {
    return [...modelResults].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date sorting
      if (sortField === 'releaseDate') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [modelResults, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕️</span>;
    }
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate <= 10) return 'text-green-600';
    if (rate <= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Jailbreak Method Selector for SocialHarmBench */}
      {isSocialHarmBenchData && availableJailbreakMethods.length > 1 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Jailbreak Method:
            </label>
            <div className="flex space-x-2">
              {availableJailbreakMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => onJailbreakMethodChange?.(method as 'weight_tampering' | 'latent_space_perturbation' | 'greedy_coordinate_gradient' | 'embedding_optimization' | 'autodan_ga' | 'autodan_hga')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('modelName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Model</span>
                  {getSortIcon('modelName')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('organization')}
              >
                <div className="flex items-center space-x-1">
                  <span>Organization</span>
                  {getSortIcon('organization')}
                </div>
              </th>
              {isPoliticalBiasData ? (
                <>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('fScaleEnglish')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>F-Scale (EN)</span>
                      {getSortIcon('fScaleEnglish')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    F-Scale (ZH)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FavScore (Dem-EN)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FavScore (Auth-EN)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wasserstein (EN)
                  </th>
                </>
              ) : isSocialHarmBenchData ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Censorship (HB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Censorship (SR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Historical Rev. (HB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Historical Rev. (SR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Human Rights (HB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Human Rights (SR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Political Manip. (HB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Political Manip. (SR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propaganda (HB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propaganda (SR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surveillance (HB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surveillance (SR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    War Crimes (HB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    War Crimes (SR)
                  </th>
                </>
              ) : (
                <>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('attackSuccessRate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Attack Success Rate</span>
                      {getSortIcon('attackSuccessRate')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Prompts
                  </th>
                </>
              )}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('releaseDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Release Date</span>
                  {getSortIcon('releaseDate')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('modelSize')}
              >
                <div className="flex items-center space-x-1">
                  <span>Size</span>
                  {getSortIcon('modelSize')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedResults.map((model, index) => (
              <tr
                key={`${model.modelName}-${index}`}
                className={`hover:bg-gray-50 ${onModelClick ? 'cursor-pointer' : ''}`}
                onClick={() => onModelClick?.(model)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{model.modelName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{model.organization}</div>
                </td>
                {isPoliticalBiasData ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.fScaleEnglish?.toFixed(3) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.fScaleMandarin?.toFixed(3) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(model as any).favScoreDemocraticEnglish !== undefined ? (model as any).favScoreDemocraticEnglish.toFixed(3) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(model as any).favScoreAuthoritarianEnglish !== undefined ? (model as any).favScoreAuthoritarianEnglish.toFixed(3) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(model as any).wassersteinDistanceEnglish !== undefined ? (model as any).wassersteinDistanceEnglish.toFixed(3) : 'N/A'}
                      </div>
                    </td>
                  </>
                ) : isSocialHarmBenchData ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_censorship_hb`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_censorship_sr`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_historical_revisionism_hb`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_historical_revisionism_sr`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_human_rights_hb`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_human_rights_sr`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_political_manipulation_hb`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_political_manipulation_sr`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_propaganda_hb`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_propaganda_sr`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_surveillance_hb`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_surveillance_sr`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_war_crimes_hb`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {model.benchmarkScores?.[`${jailbreakMethod}_war_crimes_sr`]?.toFixed(1) ?? 'N/A'}%
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${getSuccessRateColor(model.attackSuccessRate || 0)}`}>
                        {model.attackSuccessRate?.toFixed(1) || 'N/A'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{model.totalPrompts || 'N/A'}</div>
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {model.releaseDate ? formatDate(model.releaseDate) : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {model.modelSize || 'Unknown'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
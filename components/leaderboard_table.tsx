import { useState, useMemo } from 'react';
import { ModelResult } from '@/types/benchmark';

interface LeaderboardTableProps {
  modelResults: ModelResult[];
  onModelClick?: (model: ModelResult) => void;
}

type SortField = 'modelName' | 'organization' | 'releaseDate' | 'attackSuccessRate' | 'modelSize';
type SortDirection = 'asc' | 'desc';

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ modelResults, onModelClick }) => {
  const [sortField, setSortField] = useState<SortField>('attackSuccessRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate < 10) return 'text-green-600';
    if (rate < 20) return 'text-yellow-600';
    if (rate < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
      <table className="w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('modelName')}
            >
              Model {getSortIcon('modelName')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('organization')}
            >
              Organization {getSortIcon('organization')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('releaseDate')}
            >
              Release Date {getSortIcon('releaseDate')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('attackSuccessRate')}
            >
              Attack Success Rate {getSortIcon('attackSuccessRate')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Model Type
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('modelSize')}
            >
              Size {getSortIcon('modelSize')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Downloadable
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedResults.map((model, index) => (
            <tr 
              key={`${model.modelName}-${model.organization}`}
              className={`hover:bg-gray-50 ${onModelClick ? 'cursor-pointer' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
              onClick={() => onModelClick?.(model)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">{model.modelName}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {model.organization}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(model.releaseDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${getSuccessRateColor(model.attackSuccessRate)}`}>
                    {model.attackSuccessRate.toFixed(1)}%
                  </span>
                  <div className="ml-2 text-xs text-gray-500">
                    ({model.successfulAttacks}/{model.totalPrompts})
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  model.modelType === 'open-source' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {model.modelType === 'open-source' ? 'Open Source' : 'Closed Source'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {model.modelSize || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  model.region === 'US' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {model.region}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {model.downloadable ? (
                  <span className="text-green-600">✓ Yes</span>
                ) : (
                  <span className="text-red-600">✗ No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
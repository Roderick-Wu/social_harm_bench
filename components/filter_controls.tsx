import { useState } from 'react';
import { ModelResult } from '@/types/benchmark';

interface FilterOptions {
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

interface FilterControlsProps {
  modelResults: ModelResult[];
  onFilterChange: (filteredResults: ModelResult[]) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ modelResults, onFilterChange }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    organizations: [],
    modelTypes: [],
    dateRange: {
      start: '',
      end: ''
    },
    categories: [],
    minSuccessRate: undefined,
    maxSuccessRate: undefined
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle empty arrays gracefully
  if (!modelResults || modelResults.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <p className="text-gray-600 text-sm">No model results available to filter.</p>
      </div>
    );
  }

  // Get unique values for filter options
  const uniqueOrganizations = Array.from(new Set(modelResults.map(m => m.organization)));
  const modelTypes = ['open-source', 'closed-source'] as const;

  const applyFilters = (newFilters: FilterOptions) => {
    let filtered = modelResults;

    // Filter by organizations
    if (newFilters.organizations.length > 0) {
      filtered = filtered.filter(m => newFilters.organizations.includes(m.organization));
    }

    // Filter by model types (skip if modelType is undefined)
    if (newFilters.modelTypes.length > 0) {
      filtered = filtered.filter(m => m.modelType && newFilters.modelTypes.includes(m.modelType));
    }

    // Filter by date range (skip if releaseDate is undefined)
    if (newFilters.dateRange.start) {
      filtered = filtered.filter(m => m.releaseDate && new Date(m.releaseDate) >= new Date(newFilters.dateRange.start));
    }
    if (newFilters.dateRange.end) {
      filtered = filtered.filter(m => m.releaseDate && new Date(m.releaseDate) <= new Date(newFilters.dateRange.end));
    }

    // Filter by success rate range (only for models that have attackSuccessRate)
    if (newFilters.minSuccessRate !== undefined) {
      filtered = filtered.filter(m => m.attackSuccessRate !== undefined && m.attackSuccessRate >= newFilters.minSuccessRate!);
    }
    if (newFilters.maxSuccessRate !== undefined) {
      filtered = filtered.filter(m => m.attackSuccessRate !== undefined && m.attackSuccessRate <= newFilters.maxSuccessRate!);
    }

    onFilterChange(filtered);
  };

  const handleOrganizationChange = (org: string, checked: boolean) => {
    const newOrgs = checked
      ? [...filters.organizations, org]
      : filters.organizations.filter(o => o !== org);
    
    const newFilters = { ...filters, organizations: newOrgs };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleModelTypeChange = (type: typeof modelTypes[number], checked: boolean) => {
    const newTypes = checked
      ? [...filters.modelTypes, type]
      : filters.modelTypes.filter(t => t !== type);
    
    const newFilters = { ...filters, modelTypes: newTypes };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newFilters = {
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value }
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleSuccessRateChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const newFilters = {
      ...filters,
      [field === 'min' ? 'minSuccessRate' : 'maxSuccessRate']: numValue
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      organizations: [],
      modelTypes: [],
      dateRange: { start: '', end: '' },
      categories: [],
      minSuccessRate: undefined,
      maxSuccessRate: undefined
    };
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  const hasActiveFilters = filters.organizations.length > 0 || 
                          filters.dateRange.start || 
                          filters.dateRange.end || 
                          filters.minSuccessRate !== undefined || 
                          filters.maxSuccessRate !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Filter Models</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Organization Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organizations
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {uniqueOrganizations.map(org => (
              <label key={org} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.organizations.includes(org)}
                  onChange={(e) => handleOrganizationChange(org, e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{org}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAdvanced ? '▼ Hide Advanced Filters' : '▶ Show Advanced Filters'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Release Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Success Rate Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attack Success Rate Range (%)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={filters.minSuccessRate || ''}
                    onChange={(e) => handleSuccessRateChange('min', e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={filters.maxSuccessRate || ''}
                    onChange={(e) => handleSuccessRateChange('max', e.target.value)}
                    placeholder="100"
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Active filters: {[
              filters.organizations.length > 0 && `${filters.organizations.length} organization(s)`,
              filters.dateRange.start && 'date range',
              filters.minSuccessRate !== undefined && 'min success rate',
              filters.maxSuccessRate !== undefined && 'max success rate'
            ].filter(Boolean).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
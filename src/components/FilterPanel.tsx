import React, { useMemo, useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  categories: string[];
  regions: string[];
  salespeople: string[];
  selectedCategories: string[];
  selectedRegions: string[];
  selectedSalespeople: string[];
  dateRange: { start: string; end: string };
  currency: 'USD' | 'EUR' | 'MAD';
  onCategoryChange: (categories: string[]) => void;
  onRegionChange: (regions: string[]) => void;
  onSalespersonChange: (salespeople: string[]) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onCurrencyChange: (currency: 'USD' | 'EUR' | 'MAD') => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  regions,
  salespeople,
  selectedCategories,
  selectedRegions,
  selectedSalespeople,
  dateRange,
  currency,
  onCategoryChange,
  onRegionChange,
  onSalespersonChange,
  onDateRangeChange,
  onCurrencyChange,
  onClearFilters
}) => {
  // Collapsible state (minimize/expand), defaults to expanded
  const [isOpen, setIsOpen] = useState(true);
  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    selectedRegions.length > 0 || 
    selectedSalespeople.length > 0;

  const selectedCount = selectedCategories.length + selectedRegions.length + selectedSalespeople.length;

  const chips = useMemo(() => {
    return [
      ...selectedCategories.map((v) => ({ type: 'category' as const, value: v })),
      ...selectedRegions.map((v) => ({ type: 'region' as const, value: v })),
      ...selectedSalespeople.map((v) => ({ type: 'salesperson' as const, value: v })),
    ];
  }, [selectedCategories, selectedRegions, selectedSalespeople]);

  const removeChip = (type: 'category' | 'region' | 'salesperson', value: string) => {
    if (type === 'category') onCategoryChange(selectedCategories.filter(c => c !== value));
    if (type === 'region') onRegionChange(selectedRegions.filter(r => r !== value));
    if (type === 'salesperson') onSalespersonChange(selectedSalespeople.filter(p => p !== value));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center space-x-2 text-gray-900 dark:text-slate-100"
        >
          <Filter className="h-5 w-5 text-gray-600 dark:text-slate-300" />
          <h3 className="text-lg font-semibold">Filters</h3>
          <span className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {selectedCount} active
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-label={isOpen ? 'Collapse' : 'Expand'} />
        </button>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="hidden sm:flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="text-sm font-medium">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected chips (mobile-friendly) */}
      {chips.length > 0 && (
        <div className="-mt-2 mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-full pr-1">
            {chips.map((chip) => (
              <span key={`${chip.type}:${chip.value}`} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                {chip.value}
                <button
                  onClick={() => removeChip(chip.type, chip.value)}
                  className="text-blue-700 dark:text-blue-300 hover:text-blue-900"
                  aria-label={`Remove ${chip.value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="sm:hidden ml-auto text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/40 px-2 py-1 rounded-full"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Date Range</label>
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as 'USD' | 'EUR' | 'MAD')}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="MAD">MAD (DH)</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Categories</label>
          <div className="space-y-2 max-h-40 md:max-h-48 overflow-y-auto pr-1">
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onCategoryChange([...selectedCategories, category]);
                    } else {
                      onCategoryChange(selectedCategories.filter(c => c !== category));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-slate-200">{category}</span>
              </label>
            ))}
          </div>
          </div>

          {/* Regions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Regions</label>
          <div className="space-y-2 max-h-40 md:max-h-48 overflow-y-auto pr-1">
            {regions.map(region => (
              <label key={region} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onRegionChange([...selectedRegions, region]);
                    } else {
                      onRegionChange(selectedRegions.filter(r => r !== region));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-slate-200">{region}</span>
              </label>
            ))}
          </div>
          </div>

          {/* Salespeople */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Salespeople</label>
          <div className="space-y-2 max-h-40 md:max-h-48 overflow-y-auto pr-1">
            {salespeople.map(person => (
              <label key={person} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSalespeople.includes(person)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSalespersonChange([...selectedSalespeople, person]);
                    } else {
                      onSalespersonChange(selectedSalespeople.filter(p => p !== person));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-slate-200">{person}</span>
              </label>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

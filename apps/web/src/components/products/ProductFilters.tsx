'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, X, Filter, Tag, DollarSign, Package } from 'lucide-react';

export interface FilterValues {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  condition?: string[];
  rating?: number;
  sortBy?: string;
  isDigital?: boolean | null;
  shippingRequired?: boolean | null;
}

export interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

interface ProductFiltersProps {
  categories: FilterOption[];
  conditions: FilterOption[];
  priceRange: { min: number; max: number };
  values: FilterValues;
  onChange: (filters: FilterValues) => void;
  onClear: () => void;
  loading?: boolean;
  totalResults?: number;
  showMobileToggle?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest' },
  { id: 'oldest', name: 'Oldest' },
  { id: 'price_low', name: 'Price: Low to High' },
  { id: 'price_high', name: 'Price: High to Low' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'popular', name: 'Most Popular' },
  { id: 'sold', name: 'Best Selling' }
];

const RATING_OPTIONS = [
  { id: 4, name: '4+ Stars' },
  { id: 3, name: '3+ Stars' },
  { id: 2, name: '2+ Stars' },
  { id: 1, name: '1+ Stars' }
];

export function ProductFilters({
  categories,
  conditions,
  priceRange,
  values,
  onChange,
  onClear,
  loading = false,
  totalResults,
  showMobileToggle = false,
  isOpen = true,
  onToggle
}: ProductFiltersProps) {
  const [localValues, setLocalValues] = useState<FilterValues>(values);
  const [priceMin, setPriceMin] = useState(values.priceRange?.min?.toString() || '');
  const [priceMax, setPriceMax] = useState(values.priceRange?.max?.toString() || '');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'price', 'condition', 'rating'])
  );

  useEffect(() => {
    setLocalValues(values);
    setPriceMin(values.priceRange?.min?.toString() || '');
    setPriceMax(values.priceRange?.max?.toString() || '');
  }, [values]);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    const newValues = { ...localValues, [key]: value };
    setLocalValues(newValues);
    onChange(newValues);
  };

  const toggleArrayFilter = (key: 'categories' | 'condition', value: string) => {
    const current = localValues[key] || [];
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, newValues.length > 0 ? newValues : undefined);
  };

  const handlePriceChange = () => {
    const min = priceMin ? parseFloat(priceMin) : priceRange.min;
    const max = priceMax ? parseFloat(priceMax) : priceRange.max;

    if (min >= 0 && max >= min) {
      updateFilter('priceRange', { min, max });
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const hasActiveFilters =
    localValues.categories?.length ||
    localValues.condition?.length ||
    localValues.rating ||
    localValues.isDigital !== null ||
    localValues.shippingRequired !== null ||
    (localValues.priceRange &&
     (localValues.priceRange.min > priceRange.min ||
      localValues.priceRange.max < priceRange.max));

  const FilterSection = ({
    title,
    icon: Icon,
    sectionKey,
    children
  }: {
    title: string;
    icon: any;
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} />
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {totalResults !== undefined && (
            <span className="text-sm text-gray-500">
              ({totalResults.toLocaleString()} results)
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort by
        </label>
        <select
          value={localValues.sortBy || 'newest'}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={loading}
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <FilterSection title="Categories" icon={Tag} sectionKey="categories">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map(category => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localValues.categories?.includes(category.id) || false}
                onChange={() => toggleArrayFilter('categories', category.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700 flex-1">{category.name}</span>
              {category.count !== undefined && (
                <span className="text-xs text-gray-500">({category.count})</span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" icon={DollarSign} sectionKey="price">
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Min</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onBlur={handlePriceChange}
                placeholder={priceRange.min.toString()}
                min="0"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                disabled={loading}
              />
            </div>
            <span className="text-gray-400 mt-5">to</span>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Max</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                onBlur={handlePriceChange}
                placeholder={priceRange.max.toString()}
                min="0"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Quick price ranges */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Under $50', max: 50 },
              { label: '$50-$100', min: 50, max: 100 },
              { label: '$100-$500', min: 100, max: 500 },
              { label: 'Over $500', min: 500 }
            ].map(range => (
              <button
                key={range.label}
                onClick={() => updateFilter('priceRange', {
                  min: range.min || priceRange.min,
                  max: range.max || priceRange.max
                })}
                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition" icon={Package} sectionKey="condition">
        <div className="space-y-2">
          {conditions.map(condition => (
            <label key={condition.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localValues.condition?.includes(condition.id) || false}
                onChange={() => toggleArrayFilter('condition', condition.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700 flex-1">{condition.name}</span>
              {condition.count !== undefined && (
                <span className="text-xs text-gray-500">({condition.count})</span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating" icon={Filter} sectionKey="rating">
        <div className="space-y-2">
          {RATING_OPTIONS.map(rating => (
            <label key={rating.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={localValues.rating === rating.id}
                onChange={() => updateFilter('rating', rating.id)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">{rating.name}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={!localValues.rating}
              onChange={() => updateFilter('rating', undefined)}
              className="border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">Any rating</span>
          </label>
        </div>
      </FilterSection>

      {/* Product Type */}
      <FilterSection title="Product Type" icon={Package} sectionKey="type">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localValues.isDigital === true}
              onChange={() => updateFilter('isDigital', localValues.isDigital === true ? null : true)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">Digital products</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localValues.isDigital === false}
              onChange={() => updateFilter('isDigital', localValues.isDigital === false ? null : false)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">Physical products</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );

  if (showMobileToggle) {
    return (
      <>
        {/* Mobile toggle button */}
        <button
          onClick={onToggle}
          className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
        >
          <Filter className="w-6 h-6" />
        </button>

        {/* Mobile sidebar overlay */}
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onToggle} />
            <div className="relative bg-white w-80 h-full overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={onToggle}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          {filterContent}
        </div>
      </>
    );
  }

  return filterContent;
}
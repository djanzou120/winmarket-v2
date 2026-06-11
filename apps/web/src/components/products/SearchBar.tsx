'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useLazyQuery } from '@apollo/client';
import { SearchProductsDocument } from '@/graphql/generated';
import { debounce } from 'lodash-es';
import Link from 'next/link';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

export function SearchBar({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search products, categories, or brands...',
  autoFocus = false,
  className = '',
  showSuggestions = true,
  maxSuggestions = 8
}: SearchBarProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>([
    'MacBook Pro',
    'iPhone',
    'Camera',
    'Gaming Chair',
    'Headphones'
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchSuggestions, { data: searchData, loading }] = useLazyQuery(SearchProductsDocument, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'ignore'
  });

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('winmarket_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing recent searches:', error);
        }
      }
    }
  }, []);

  // Debounced search suggestions
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim().length > 2) {
        searchSuggestions({
          variables: { query: searchQuery, limit: maxSuggestions }
        });
      }
    }, 300),
    [maxSuggestions, searchSuggestions]
  );

  useEffect(() => {
    if (showSuggestions && query.trim()) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch, showSuggestions]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setIsOpen(true);
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 10);

      setRecentSearches(newRecentSearches);
      if (typeof window !== 'undefined') {
        localStorage.setItem('winmarket_recent_searches', JSON.stringify(newRecentSearches));
      }

      onSearch?.(searchQuery);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    onChange?.('');
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('winmarket_recent_searches');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchData?.searchProducts;
  const hasResults = searchResults && searchResults.length > 0;
  const showDropdown = isOpen && (query.trim() || recentSearches.length || trendingSearches.length);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <span className="mt-2 text-sm">Searching...</span>
            </div>
          )}

          {/* Search Results */}
          {!loading && query.trim() && hasResults && (
            <div>
              {/* Product Results */}
              {searchResults && searchResults.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Products</h4>
                  <div className="space-y-2">
                    {searchResults.slice(0, 4).map((product: any) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug || product.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {product.category?.name}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              ${product.price}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && query.trim() && !hasResults && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords or check your spelling</p>
            </div>
          )}

          {/* Recent Searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Recent searches</h4>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {!query.trim() && trendingSearches.length > 0 && (
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Trending searches</h4>
              <div className="space-y-1">
                {trendingSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
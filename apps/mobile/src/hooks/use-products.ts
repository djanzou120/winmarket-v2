import { useQuery, useLazyQuery } from '@apollo/client';
import {
  PRODUCTS_QUERY,
  PRODUCT_QUERY,
  FEATURED_PRODUCTS_QUERY,
  POPULAR_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  CATEGORIES_QUERY
} from '../graphql/queries/products';

export function useProducts(filter?: any, pagination?: any) {
  return useQuery(PRODUCTS_QUERY, {
    variables: { filter, pagination },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
}

export function useProduct(id: string) {
  return useQuery(PRODUCT_QUERY, {
    variables: { id },
    errorPolicy: 'all',
    skip: !id,
  });
}

export function useFeaturedProducts(limit = 10) {
  return useQuery(FEATURED_PRODUCTS_QUERY, {
    variables: { limit },
    errorPolicy: 'all',
  });
}

export function usePopularProducts(limit = 10) {
  return useQuery(POPULAR_PRODUCTS_QUERY, {
    variables: { limit },
    errorPolicy: 'all',
  });
}

export function useSearchProducts() {
  const [searchProducts, { data, loading, error }] = useLazyQuery(SEARCH_PRODUCTS_QUERY, {
    errorPolicy: 'all',
  });

  const search = (query: string, limit = 20) => {
    if (query.trim()) {
      searchProducts({ variables: { query, limit } });
    }
  };

  return {
    search,
    data: data?.searchProducts,
    loading,
    error,
  };
}

export function useCategories(filter?: any, pagination?: any) {
  return useQuery(CATEGORIES_QUERY, {
    variables: { filter, pagination },
    errorPolicy: 'all',
  });
}
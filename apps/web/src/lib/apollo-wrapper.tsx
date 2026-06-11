'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ReactNode } from 'react';
import toast from 'react-hot-toast';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('winmarket_token') : null;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    }
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Handle authentication errors
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('unauthenticated')) {
        // Clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('winmarket_token');
          localStorage.removeItem('winmarket_refresh_token');
          // Toast notification
          toast.error('Please log in again');
          // Redirect to login - this should be handled by your auth provider
          window.location.href = '/auth/login';
        }
      } else {
        // Show error toast for other GraphQL errors
        toast.error(message);
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    // Handle network errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Clear token on 401
      if (typeof window !== 'undefined') {
        localStorage.removeItem('winmarket_token');
        localStorage.removeItem('winmarket_refresh_token');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/auth/login';
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
  }
});

// Configure Apollo Client with optimized cache
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        products: {
          keyArgs: ['filter'],
          merge(existing, incoming, { args }) {
            if (!existing || !args?.pagination?.offset) {
              return incoming;
            }
            // Merge paginated results
            return {
              ...incoming,
              edges: [...(existing.edges || []), ...(incoming.edges || [])],
            };
          },
        },
        orders: {
          keyArgs: ['filter'],
          merge(existing, incoming, { args }) {
            if (!existing || !args?.pagination?.offset) {
              return incoming;
            }
            return {
              ...incoming,
              edges: [...(existing.edges || []), ...(incoming.edges || [])],
            };
          },
        },
        reviews: {
          keyArgs: ['filter'],
          merge(existing, incoming, { args }) {
            if (!existing || !args?.pagination?.offset) {
              return incoming;
            }
            return {
              ...incoming,
              edges: [...(existing.edges || []), ...(incoming.edges || [])],
            };
          },
        },
      },
    },
    User: {
      fields: {
        wallet: {
          merge: true,
        },
        profile: {
          merge: true,
        },
      },
    },
    Product: {
      fields: {
        reviews: {
          merge: true,
        },
        variants: {
          merge: true,
        },
      },
    },
    Cart: {
      fields: {
        items: {
          merge: false,
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
});

interface ApolloWrapperProps {
  children: ReactNode;
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
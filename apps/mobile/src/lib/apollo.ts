import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine the GraphQL endpoint based on platform and environment
const getGraphQLUri = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000/graphql'; // Android emulator localhost
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:4000/graphql'; // iOS simulator localhost
    }
    return 'http://localhost:4000/graphql';
  } else {
    // Production mode - replace with your production GraphQL endpoint
    return 'https://api.winmarket.app/graphql';
  }
};

const httpLink = createHttpLink({
  uri: getGraphQLUri(),
  credentials: 'include',
});

// Authentication link to add JWT token to headers
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'content-type': 'application/json',
      }
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return { headers };
  }
});

// Error link to handle GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);

    // Handle authentication errors
    if (networkError.statusCode === 401) {
      // Token might be expired, remove it and redirect to login
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('refreshToken');
    }
  }
});

// Configure Apollo Client with optimistic caching for mobile
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['filter'],
            merge(existing = { edges: [] }, incoming) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            },
          },
          categories: {
            merge(existing = { edges: [] }, incoming) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            },
          },
        },
      },
      Product: {
        fields: {
          images: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Enable offline support with cache persistence
  assumeImmutableResults: true,
});
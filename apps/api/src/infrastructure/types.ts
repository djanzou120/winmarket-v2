// Types d'infrastructure pour les resolvers
export interface Resolvers {
  Query?: any;
  Mutation?: any;
  Subscription?: any;
  [key: string]: any;
}

// Types de base pour les contextes GraphQL
export interface GraphQLContext {
  db: any;
  cache: any;
  schema: any;
  user?: any;
  session?: any;
  isAuthenticated: boolean;
  permissions: string[];
  req: {
    headers: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };
}

// Types pour les arguments GraphQL
export interface PaginationArgs {
  limit?: number;
  offset?: number;
}

export interface FilterArgs {
  [key: string]: any;
}

// Types pour les réponses paginées
export interface Connection<T> {
  edges: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount: number;
}
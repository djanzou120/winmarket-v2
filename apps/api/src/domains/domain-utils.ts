// Utilitaire pour gérer les exports de domaines sans duplication

/**
 * Structure standard d'un domaine métier
 */
export interface DomainModule {
  typeDefs: any;
  resolvers: any;
}

/**
 * Configuration des domaines disponibles
 */
export const DOMAINS = [
  'auth',
  'users',
  'products',
  'orders',
  'reviews',
  'delivery',
  'notifications'
] as const;

export type DomainName = typeof DOMAINS[number];

/**
 * Fonction pour créer les exports standardisés d'un domaine
 */
export function createDomainExports(domainName: DomainName) {
  return {
    typeDefsKey: `${domainName}TypeDefs` as const,
    resolversKey: `${domainName}Resolvers` as const,
    importPath: `./${domainName}` as const,
  };
}

/**
 * Génère les imports/exports pour le fichier central
 */
export function generateCentralExports() {
  return DOMAINS.map(domain => createDomainExports(domain));
}
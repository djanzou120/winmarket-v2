import { gql } from '@apollo/client';

export const PRODUCTS_QUERY = gql`
  query Products($filter: ProductFilter, $pagination: PaginationInput) {
    products(filter: $filter, pagination: $pagination) {
      edges {
        node {
          id
          title
          slug
          shortDescription
          price
          originalPrice
          condition
          status
          stock
          images
          isDigital
          shippingRequired
          averageRating
          reviewCount
          soldCount
          favoriteCount
          viewCount
          seller {
            id
            firstName
            lastName
            avatar
          }
          category {
            id
            name
            slug
          }
          createdAt
          publishedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const PRODUCT_QUERY = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      title
      slug
      description
      shortDescription
      price
      originalPrice
      condition
      status
      stock
      minOrderQuantity
      maxOrderQuantity
      weight
      dimensions
      sku
      tags
      images
      isDigital
      shippingRequired
      allowReviews
      averageRating
      reviewCount
      soldCount
      favoriteCount
      viewCount
      seller {
        id
        firstName
        lastName
        avatar
        profile {
          bio
          address
          city
          country
        }
      }
      category {
        id
        name
        slug
        parent {
          id
          name
          slug
        }
      }
      variants {
        id
        name
        value
        price
        stock
        sku
        image
        isActive
      }
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const FEATURED_PRODUCTS_QUERY = gql`
  query FeaturedProducts($limit: Int) {
    featuredProducts(limit: $limit) {
      id
      title
      slug
      shortDescription
      price
      originalPrice
      images
      averageRating
      reviewCount
      seller {
        id
        firstName
        lastName
      }
      category {
        id
        name
      }
    }
  }
`;

export const POPULAR_PRODUCTS_QUERY = gql`
  query PopularProducts($limit: Int) {
    popularProducts(limit: $limit) {
      id
      title
      slug
      shortDescription
      price
      originalPrice
      images
      averageRating
      reviewCount
      soldCount
      seller {
        id
        firstName
        lastName
      }
      category {
        id
        name
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($query: String!, $limit: Int) {
    searchProducts(query: $query, limit: $limit) {
      id
      title
      slug
      shortDescription
      price
      originalPrice
      images
      averageRating
      reviewCount
      seller {
        id
        firstName
        lastName
      }
      category {
        id
        name
      }
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories($filter: CategoryFilter, $pagination: PaginationInput) {
    categories(filter: $filter, pagination: $pagination) {
      edges {
        node {
          id
          name
          slug
          description
          imageUrl
          isActive
          productCount
          parent {
            id
            name
            slug
          }
          children {
            id
            name
            slug
            productCount
          }
        }
      }
      totalCount
    }
  }
`;
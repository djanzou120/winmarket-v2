import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      avatar
      role
      isEmailVerified
      isActive
      profile {
        bio
        phone
        address
        city
        state
        country
        zipCode
        dateOfBirth
      }
      wallet {
        id
        balance
        totalEarnings
        totalSpent
      }
      createdAt
      updatedAt
    }
  }
`;

export const USER_PROFILE_QUERY = gql`
  query UserProfile($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
      avatar
      role
      profile {
        bio
        address
        city
        state
        country
      }
      createdAt
    }
  }
`;
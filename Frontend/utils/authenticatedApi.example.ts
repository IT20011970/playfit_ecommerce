// Example: How to make authenticated GraphQL requests anywhere in your app

import { graphqlClient } from '../graphql/client';
import { AuthTokenManager } from '../utils/authToken';

/**
 * Example 1: Fetch user profile
 * The token is automatically included by the GraphQLClient
 */
export async function fetchUserProfile(userId: number) {
  const query = `
    query GetUserProfile($id: Int!) {
      user(id: $id) {
        id
        userId
        role
        contactNo
        isActive
      }
    }
  `;

  try {
    const data = await graphqlClient.query(query, { id: userId });
    return data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Example 2: Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return AuthTokenManager.getToken() !== null;
}

/**
 * Example 3: Update user profile (authenticated mutation)
 */
export async function updateUserProfile(userId: number, updates: any) {
  const mutation = `
    mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        id
        userId
        contactNo
        role
      }
    }
  `;

  try {
    const data = await graphqlClient.mutate(mutation, { id: userId, input: updates });
    return data.updateUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Example 4: Protected API call with token check
 */
export async function makeProtectedRequest(query: string, variables?: any) {
  // Check if token exists and is not expired
  if (!isAuthenticated()) {
    throw new Error('User is not authenticated. Please log in.');
  }

  // Token is automatically included by GraphQLClient
  return await graphqlClient.query(query, variables);
}

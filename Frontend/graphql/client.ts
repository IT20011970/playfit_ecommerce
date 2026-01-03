import { AuthTokenManager } from '../utils/authToken';

const getGraphQLEndpoint = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  if (hostname.includes('azurewebsites.net')) {
    return 'https://devplayfitfederationgateway.azurewebsites.net/graphql';
  }

  return '/graphql';
};

const GRAPHQL_ENDPOINT = getGraphQLEndpoint();

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint: string = GRAPHQL_ENDPOINT) {
    this.endpoint = endpoint;
  }

  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication token if available
    const authHeader = AuthTokenManager.getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL query');
    }

    return result.data;
  }

  async mutate<T = any>(mutation: string, variables?: Record<string, any>): Promise<T> {
    return this.query<T>(mutation, variables);
  }
}

export const graphqlClient = new GraphQLClient();

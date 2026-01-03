
import { resolvers } from './resolvers';

export const graphqlApi = async (operationName: string, variables?: any): Promise<{ data: any }> => {
  // Find if it's a query or mutation
  let resolverFn;
  if (resolvers.Query[operationName]) {
    resolverFn = resolvers.Query[operationName];
  } else if (resolvers.Mutation[operationName]) {
    resolverFn = resolvers.Mutation[operationName];
  } else {
    throw new Error(`Operation "${operationName}" not found in resolvers.`);
  }

  // Simulate async behavior of a network request
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));

  try {
    const result = await resolverFn(null, variables);
    return { data: { [operationName]: result } };
  } catch (error) {
    console.error(`Error executing resolver for ${operationName}:`, error);
    throw error;
  }
};

// GraphQL Queries and Mutations for User operations

// Query to get all users
export const GET_USERS = `
  query GetUsers {
    users {
      id
      userId
      role
      contactNo
      isActive
    }
  }
`;

// Query to get a single user by ID
export const GET_USER = `
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      userId
      role
      contactNo
      refNo
      isActive
    }
  }
`;

// Mutation to create a new user
export const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      userId
      role
      contactNo
      isActive
    }
  }
`;

// Mutation to sign in
export const SIGN_IN = `
  mutation SignIn($userId: String!, $password: String!) {
    signIn(userId: $userId, password: $password) {
      accessToken
      expiresIn
      user {
        id
        userId
        role
        contactNo
        isActive
      }
    }
  }
`;

// Mutation to update user
export const UPDATE_USER = `
  mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      userId
      role
      contactNo
      isActive
    }
  }
`;

// Mutation to delete user
export const DELETE_USER = `
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;

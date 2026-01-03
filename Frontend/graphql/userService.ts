import { graphqlClient } from './client';
import { CREATE_USER, SIGN_IN, GET_USER, GET_USERS } from './userQueries';

export interface CreateUserInput {
  userId: string;
  password: string;
  role?: string;
  contactNo?: string;
  refNo?: string;
  isActive?: number;
}

export interface UserResponse {
  id: number;
  userId: string;
  role?: string | null;
  contactNo?: string | null;
  refNo?: string | null;
  isActive: number;
}

export interface SignInResponse {
  accessToken: string;
  expiresIn: number;
  user: UserResponse;
}

export class UserService {
  /**
   * Create a new user account
   */
  async createUser(input: CreateUserInput): Promise<UserResponse> {
    const response = await graphqlClient.mutate<{ createUser: UserResponse }>(
      CREATE_USER,
      { input }
    );
    return response.createUser;
  }

  /**
   * Sign in with userId and password
   */
  async signIn(userId: string, password: string): Promise<SignInResponse> {
    const response = await graphqlClient.mutate<{ signIn: SignInResponse }>(
      SIGN_IN,
      { userId, password }
    );
    return response.signIn;
  }

  /**
   * Get user by ID
   */
  async getUser(id: number): Promise<UserResponse | null> {
    const response = await graphqlClient.query<{ user: UserResponse | null }>(
      GET_USER,
      { id }
    );
    return response.user;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserResponse[]> {
    const response = await graphqlClient.query<{ users: UserResponse[] }>(GET_USERS);
    return response.users;
  }
}

export const userService = new UserService();

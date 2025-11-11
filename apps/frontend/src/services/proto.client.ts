/**
 * Proto Client Service
 * Handles all proto-based API communication
 */

import { createClient, Client, Transport } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { create } from '@bufbuild/protobuf';

// Import generated types and services
import {
  UserService,
  UserSchema,
  GetUserRequestSchema,
  GetUserResponseSchema,
  type User,
  type GetUserRequest,
  type GetUserResponse
} from '../gen/example_pb';

/**
 * Transport configuration for Connect RPC
 */
const transport: Transport = createConnectTransport({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  // Use JSON format for easier debugging (can switch to binary for production)
  useBinaryFormat: false,
  interceptors: [],
});

/**
 * User Service Client
 * Type-safe client for UserService proto service
 */
export class UserServiceClient {
  private client: Client<typeof UserService>;

  constructor() {
    this.client = createClient(UserService, transport);
  }

  /**
   * Get user by ID
   * @param id User ID
   * @param yt Additional parameter from proto
   * @returns User data or null if not found
   */
  async getUser(id: string, yt: string = ''): Promise<User | null> {
    try {
      // Create request using the generated schema
      const request = create(GetUserRequestSchema, {
        id,
        yt
      });

      // Make the RPC call
      const response = await this.client.getUser(request);

      return response.user || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * Example of how to create proto messages
   */
  createUserMessage(id: string, name: string, email: string): User {
    return create(UserSchema, {
      id,
      name,
      email
    });
  }
}

// Export singleton instance
export const userServiceClient = new UserServiceClient();

/**
 * Proto utilities for working with generated types
 */
export class ProtoUtils {
  /**
   * Convert User proto to plain object
   */
  static userToObject(user: User): {
    id: string;
    name: string;
    email: string;
  } {
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  /**
   * Create User from plain object
   */
  static objectToUser(obj: {
    id: string;
    name: string;
    email: string;
  }): User {
    return create(UserSchema, obj);
  }

  /**
   * Validate User data
   */
  static isValidUser(user: any): user is User {
    return (
      user &&
      typeof user.id === 'string' &&
      typeof user.name === 'string' &&
      typeof user.email === 'string'
    );
  }
}

/**
 * Export all proto types for use in components
 */
export type { User, GetUserRequest, GetUserResponse };
export { UserSchema, GetUserRequestSchema, GetUserResponseSchema };
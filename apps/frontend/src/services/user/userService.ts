/**
 * User Service
 * Service for user profile management
 */

import type {
  GetMyProfileResponse,
  UpdateProfileResponse,
  PartnerPreferences,
} from '../../gen/user/v1/user_pb';
import { ApiClient } from '../base';

export interface IUserService {
  getMyProfile(request: any): Promise<GetMyProfileResponse>;
  updateProfile(request: any): Promise<UpdateProfileResponse>;
  updatePartnerPreferences(preferences: PartnerPreferences): Promise<{ preferences: PartnerPreferences }>;
}

export class UserService implements IUserService {
  private basePath = '/api/v1/user';

  constructor(private apiClient: ApiClient) {}

  async getMyProfile(_request: any): Promise<GetMyProfileResponse> {
    // Try the /me endpoint which is common for getting current user's profile
    const response = await this.apiClient.get(`${this.basePath}/me`);
    // The response from REST API will have the profile data
    // For now, return it as is (we can add adapter later if needed)
    return response.data as GetMyProfileResponse;
  }

  async updateProfile(request: any): Promise<UpdateProfileResponse> {
    // Update the current user's profile
    const response = await this.apiClient.put(`${this.basePath}/me`, request);
    return response.data as UpdateProfileResponse;
  }

  async updatePartnerPreferences(preferences: PartnerPreferences): Promise<{ preferences: PartnerPreferences }> {
    // Update partner preferences at dedicated endpoint
    const response = await this.apiClient.put('/api/v1/partner-preferences', {
      preferences: preferences,
      updateFields: ['*'], // Update all fields
    });
    return response.data as { preferences: PartnerPreferences };
  }
}

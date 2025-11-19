/**
 * Availability Service
 * Service for managing user availability slots
 */

import { ApiClient } from '../base';

// ============================================================================
// Types
// ============================================================================

export interface OfflineLocation {
  placeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  googleMapsUrl?: string;
}

export interface AvailabilitySlot {
  slotId: string;
  userId: string;
  startTime: number;
  endTime: number;
  dateType: 'DATE_TYPE_ONLINE' | 'DATE_TYPE_OFFLINE' | 'DATE_TYPE_OFFLINE_EVENT';
  offlineLocation?: OfflineLocation;
  notes?: string;
  createdAt: { seconds: number };
  updatedAt: { seconds: number };
}

export interface AvailabilitySlotInput {
  startTime: number;
  endTime: number;
  dateType: 'DATE_TYPE_ONLINE' | 'DATE_TYPE_OFFLINE' | 'DATE_TYPE_OFFLINE_EVENT';
  offlineLocation?: OfflineLocation;
  notes?: string;
}

export interface GetAvailabilityResponse {
  slots: AvailabilitySlot[];
  pagination: {
    totalCount: number;
  };
}

export interface SubmitAvailabilityResponse {
  createdSlots: AvailabilitySlot[];
  createdCount: number;
  validationErrors: Record<number, string>;
  message: string;
}

export interface DeleteAvailabilityResponse {
  success: boolean;
  message: string;
}

export interface IAvailabilityService {
  getAvailability(fromTime?: number, toTime?: number): Promise<GetAvailabilityResponse>;
  submitAvailability(slots: AvailabilitySlotInput[]): Promise<SubmitAvailabilityResponse>;
  deleteAvailability(slotId: string): Promise<DeleteAvailabilityResponse>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class AvailabilityService implements IAvailabilityService {
  private basePath = '/api/v1/availability';

  constructor(private apiClient: ApiClient) {}

  async getAvailability(fromTime?: number, toTime?: number): Promise<GetAvailabilityResponse> {
    const params: Record<string, string | number> = {};
    if (fromTime) params.fromTime = fromTime;
    if (toTime) params.toTime = toTime;

    const response = await this.apiClient.get<GetAvailabilityResponse>(this.basePath, { params });
    return response.data;
  }

  async submitAvailability(slots: AvailabilitySlotInput[]): Promise<SubmitAvailabilityResponse> {
    const response = await this.apiClient.post<SubmitAvailabilityResponse>(this.basePath, { slots });
    return response.data;
  }

  async deleteAvailability(slotId: string): Promise<DeleteAvailabilityResponse> {
    const response = await this.apiClient.delete<DeleteAvailabilityResponse>(this.basePath, {
      params: { slotId }
    });
    return response.data;
  }
}

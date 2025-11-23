// Admin Service - API calls for admin functionality

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface AdminUser {
  adminId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  isGenie: boolean;
}

export interface AdminTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserFullDetails {
  userId: string;
  email: string;
  name: string;
  phone: string;
  photoUrl: string;
  dateOfBirth?: number;
  age: number;
  gender: string;
  accountStatus: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: number;
  lastLoginAt?: number;
  photoCount: number;
  availabilityCount: number;
}

export interface UserSummary {
  userId: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  age: number;
  gender: string;
  city: string;
  occupation: string;
}

export interface AvailableSlot {
  startTime: number;
  endTime: number;
  dateType: string;
}

export interface DateSuggestion {
  user: UserSummary;
  compatibilityScore: number;
  commonInterests: string[];
  suggestedDateType: string;
  matchingSlots?: AvailableSlot[];
}

export interface OfflineLocation {
  placeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  latitude: number;
  longitude: number;
}

export interface ScheduledDate {
  dateId: string;
  user1Id: string;
  user2Id: string;
  user1?: UserSummary;
  user2?: UserSummary;
  genieId: string;
  scheduledTime: number;
  durationMinutes: number;
  status: string;
  dateType: string;
  location?: OfflineLocation;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

// Admin Login
export const adminLogin = async (email: string, password: string): Promise<{
  admin: AdminUser;
  tokens: AdminTokens;
}> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Login failed');
  }

  return response.json();
};

// Get All Users
export const getAllUsers = async (params: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  accountStatus?: string;
  gender?: string;
}): Promise<{
  users: UserFullDetails[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('page_size', params.pageSize.toString());
  if (params.sortBy) searchParams.set('sort_by', params.sortBy);
  if (params.sortOrder) searchParams.set('sort_order', params.sortOrder);
  if (params.accountStatus) searchParams.set('account_status', params.accountStatus);
  if (params.gender) searchParams.set('gender', params.gender);

  const response = await fetch(`${API_BASE}/api/v1/admin/users?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

// Search Users
export const searchUsers = async (query: string, page = 1, pageSize = 20): Promise<{
  users: UserFullDetails[];
  totalCount: number;
  page: number;
  pageSize: number;
}> => {
  const searchParams = new URLSearchParams({
    q: query,
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const response = await fetch(`${API_BASE}/api/v1/admin/users/search?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
};

// Get User Details
export const getUserDetails = async (userId: string): Promise<{
  user: UserFullDetails;
  availability?: AvailableSlot[];
}> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  return response.json();
};

// Get Date Suggestions
export const getDateSuggestions = async (userId: string, limit = 10): Promise<{
  suggestions: DateSuggestion[];
}> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/suggestions/${userId}?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch suggestions');
  }

  return response.json();
};

// Schedule Date
export const scheduleDate = async (data: {
  user1Id: string;
  user2Id: string;
  scheduledTime: number;
  durationMinutes: number;
  dateType: string;
  notes?: string;
  location?: OfflineLocation;
}): Promise<{ date: ScheduledDate }> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/dates`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to schedule date');
  }

  return response.json();
};

// Get Genie Dates
export const getGenieDates = async (params: {
  genieId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  dates: ScheduledDate[];
  totalCount: number;
  page: number;
  pageSize: number;
}> => {
  const searchParams = new URLSearchParams();
  if (params.genieId) searchParams.set('genie_id', params.genieId);
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/v1/admin/dates?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dates');
  }

  return response.json();
};

// Update Date Status
export const updateDateStatus = async (dateId: string, status: string, notes?: string): Promise<{
  date: ScheduledDate;
}> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/dates/${dateId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!response.ok) {
    throw new Error('Failed to update date status');
  }

  return response.json();
};

// =============================================================================
// Analytics Interfaces & APIs
// =============================================================================

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  availableForDating: number;
  totalDatesScheduled: number;
  totalDatesCompleted: number;
  todaySignups: number;
  thisWeekSignups: number;
  thisMonthSignups: number;
}

export interface DataPoint {
  label: string;
  value: number;
  timestamp: number;
}

export interface DemographicData {
  category: string;
  count: number;
  percentage: number;
}

export interface LocationData {
  locationName: string;
  locationCode: string;
  userCount: number;
  percentage: number;
}

// Get Platform Stats
export const getPlatformStats = async (): Promise<PlatformStats> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/analytics/platform`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch platform stats');
  }

  return response.json();
};

// Get User Growth
export const getUserGrowth = async (params: {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startTime?: number;
  endTime?: number;
}): Promise<{
  dataPoints: DataPoint[];
  totalUsers: number;
  growthRate: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set('period', params.period);
  if (params.startTime) searchParams.set('start_time', params.startTime.toString());
  if (params.endTime) searchParams.set('end_time', params.endTime.toString());

  const response = await fetch(`${API_BASE}/api/v1/admin/analytics/user-growth?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user growth');
  }

  return response.json();
};

// Get Active Users
export const getActiveUsers = async (params: {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startTime?: number;
  endTime?: number;
}): Promise<{
  dataPoints: DataPoint[];
  currentActive: number;
  activityRate: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set('period', params.period);
  if (params.startTime) searchParams.set('start_time', params.startTime.toString());
  if (params.endTime) searchParams.set('end_time', params.endTime.toString());

  const response = await fetch(`${API_BASE}/api/v1/admin/analytics/active-users?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch active users');
  }

  return response.json();
};

// Get Signups
export const getSignups = async (params: {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startTime?: number;
  endTime?: number;
}): Promise<{
  dataPoints: DataPoint[];
  totalSignups: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set('period', params.period);
  if (params.startTime) searchParams.set('start_time', params.startTime.toString());
  if (params.endTime) searchParams.set('end_time', params.endTime.toString());

  const response = await fetch(`${API_BASE}/api/v1/admin/analytics/signups?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch signups');
  }

  return response.json();
};

// Get Demographics
export const getDemographics = async (metricType: 'gender' | 'age_group'): Promise<{
  data: DemographicData[];
}> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/analytics/demographics?metric_type=${metricType}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch demographics');
  }

  return response.json();
};

// Get Location Stats
export const getLocationStats = async (level: 'country' | 'state' | 'city', parentLocation?: string): Promise<{
  locations: LocationData[];
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set('level', level);
  if (parentLocation) searchParams.set('parent_location', parentLocation);

  const response = await fetch(`${API_BASE}/api/v1/admin/analytics/locations?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch location stats');
  }

  return response.json();
};

// Get Availability Stats
export const getAvailabilityStats = async (): Promise<{
  availableUsers: number;
  unavailableUsers: number;
  availabilityRate: number;
}> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/analytics/availability`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch availability stats');
  }

  return response.json();
};

// =============================================================================
// Bulk Actions APIs
// =============================================================================

export type BulkAction = 'activate' | 'suspend' | 'delete' | 'verify' | 'unverify';

export const bulkUserAction = async (
  userIds: string[],
  action: BulkAction,
  reason?: string
): Promise<{
  successCount: number;
  failedCount: number;
  failedUserIds: string[];
  errorMessages: string[];
}> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/users/bulk`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userIds, action, reason }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Bulk action failed');
  }

  return response.json();
};

// =============================================================================
// Admin Management APIs
// =============================================================================

// Get All Admins
export const getAllAdmins = async (page = 1, pageSize = 20): Promise<{
  admins: AdminUser[];
  totalCount: number;
}> => {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const response = await fetch(`${API_BASE}/api/v1/admin/admins?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admins');
  }

  return response.json();
};

// Create Admin User
export const createAdminUser = async (data: {
  email: string;
  password: string;
  name: string;
  role: string;
  isGenie: boolean;
}): Promise<{ admin: AdminUser }> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/admins`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create admin');
  }

  return response.json();
};

// Update Admin
export const updateAdmin = async (
  adminId: string,
  data: {
    name: string;
    email: string;
    role: string;
  }
): Promise<{ admin: AdminUser }> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/admins/${adminId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update admin');
  }

  return response.json();
};

// Delete Admin
export const deleteAdmin = async (adminId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/admins/${adminId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete admin');
  }

  return response.json();
};

// Update Admin Profile
export const updateAdminProfile = async (
  adminId: string,
  data: {
    name: string;
    email: string;
  }
): Promise<{ admin: AdminUser }> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/profile`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminId, ...data }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update profile');
  }

  return response.json();
};

// ============================================================================
// Date Curation (AI-Powered Matching)
// ============================================================================

export interface CurationCandidate {
  userId: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  profileCompletion: number;
  emailVerified: boolean;
  aadharVerified: boolean;
  workEmailVerified: boolean;
  availableSlotsCount: number;
  nextAvailableDate: number;
}

export interface MatchResult {
  userId: string;
  name: string;
  age: number;
  gender: string;
  compatibilityScore: number; // 0-100
  isMatch: boolean; // true if score >= 60
  reasoning: string;
  matchedAspects: string[];
  mismatchedAspects: string[];
}

// Get Curation Candidates (users available for dates)
export const getCurationCandidates = async (): Promise<{ candidates: CurationCandidate[] }> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/curation/candidates`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch curation candidates');
  }

  return response.json();
};

// Curate Dates (AI compatibility analysis)
export const curateDates = async (
  userId: string,
  candidateIds: string[]
): Promise<{ matches: MatchResult[] }> => {
  const response = await fetch(`${API_BASE}/api/v1/admin/curation/analyze`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      candidateIds,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to curate dates');
  }

  return response.json();
};

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('admin_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

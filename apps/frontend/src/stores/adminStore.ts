import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AdminUser,
  UserFullDetails,
  DateSuggestion,
  ScheduledDate,
  PlatformStats,
  DataPoint,
  DemographicData,
  LocationData,
  BulkAction,
  adminLogin,
  getAllUsers,
  searchUsers,
  getUserDetails,
  getDateSuggestions,
  scheduleDate,
  getGenieDates,
  updateDateStatus,
  getPlatformStats,
  getUserGrowth,
  getActiveUsers,
  getSignups,
  getDemographics,
  getLocationStats,
  getAvailabilityStats,
  bulkUserAction,
  getAllAdmins,
  createAdminUser,
  updateAdmin,
  deleteAdmin,
  updateAdminProfile,
} from '../services/admin/adminService';

interface AdminState {
  // Auth
  admin: AdminUser | null;
  isAuthenticated: boolean;
  accessToken: string | null;

  // Users
  users: UserFullDetails[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Selected User
  selectedUser: UserFullDetails | null;
  userSuggestions: DateSuggestion[];

  // Dates
  genieDates: ScheduledDate[];
  totalDates: number;

  // Analytics
  platformStats: PlatformStats | null;
  userGrowthData: DataPoint[];
  activeUsersData: DataPoint[];
  signupsData: DataPoint[];
  demographicsData: DemographicData[];
  locationData: LocationData[];
  availabilityStats: {
    availableUsers: number;
    unavailableUsers: number;
    availabilityRate: number;
  } | null;

  // Admins
  admins: AdminUser[];
  totalAdmins: number;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUsers: (params?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    accountStatus?: string;
    gender?: string;
  }) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  fetchUserDetails: (userId: string) => Promise<void>;
  fetchSuggestions: (userId: string) => Promise<void>;
  createDate: (data: {
    user1Id: string;
    user2Id: string;
    scheduledTime: number;
    durationMinutes: number;
    dateType: string;
    notes?: string;
  }) => Promise<void>;
  fetchGenieDates: (params?: {
    genieId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) => Promise<void>;
  updateDateStatus: (dateId: string, status: string, notes?: string) => Promise<void>;

  // Analytics Actions
  fetchPlatformStats: () => Promise<void>;
  fetchUserGrowth: (period: 'daily' | 'weekly' | 'monthly' | 'yearly', startTime?: number, endTime?: number) => Promise<void>;
  fetchActiveUsers: (period: 'daily' | 'weekly' | 'monthly' | 'yearly', startTime?: number, endTime?: number) => Promise<void>;
  fetchSignups: (period: 'daily' | 'weekly' | 'monthly' | 'yearly', startTime?: number, endTime?: number) => Promise<void>;
  fetchDemographics: (metricType: 'gender' | 'age_group') => Promise<void>;
  fetchLocationStats: (level: 'country' | 'state' | 'city', parentLocation?: string) => Promise<void>;
  fetchAvailabilityStats: () => Promise<void>;

  // Bulk Actions
  performBulkAction: (userIds: string[], action: BulkAction, reason?: string) => Promise<void>;

  // Admin Management Actions
  fetchAdmins: (page?: number, pageSize?: number) => Promise<void>;
  createAdmin: (data: { email: string; password: string; name: string; role: string; isGenie: boolean }) => Promise<void>;
  updateAdminUser: (adminId: string, data: { name: string; email: string; role: string }) => Promise<void>;
  deleteAdminUser: (adminId: string) => Promise<void>;
  updateProfile: (adminId: string, data: { name: string; email: string }) => Promise<void>;

  clearError: () => void;
  clearSelectedUser: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial state
      admin: null,
      isAuthenticated: false,
      accessToken: null,
      users: [],
      totalUsers: 0,
      currentPage: 1,
      pageSize: 20,
      totalPages: 0,
      selectedUser: null,
      userSuggestions: [],
      genieDates: [],
      totalDates: 0,
      platformStats: null,
      userGrowthData: [],
      activeUsersData: [],
      signupsData: [],
      demographicsData: [],
      locationData: [],
      availabilityStats: null,
      admins: [],
      totalAdmins: 0,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminLogin(email, password);
          localStorage.setItem('admin_access_token', response.tokens.accessToken);
          localStorage.setItem('admin_refresh_token', response.tokens.refreshToken);
          set({
            admin: response.admin,
            isAuthenticated: true,
            accessToken: response.tokens.accessToken,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        set({
          admin: null,
          isAuthenticated: false,
          accessToken: null,
          users: [],
          selectedUser: null,
          userSuggestions: [],
          genieDates: [],
        });
      },

      fetchUsers: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getAllUsers({
            page: params.page || get().currentPage,
            pageSize: params.pageSize || get().pageSize,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
            accountStatus: params.accountStatus,
            gender: params.gender,
          });
          set({
            users: response.users,
            totalUsers: response.totalCount,
            currentPage: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch users',
            isLoading: false,
          });
        }
      },

      searchUsers: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await searchUsers(query);
          set({
            users: response.users,
            totalUsers: response.totalCount,
            currentPage: response.page,
            pageSize: response.pageSize,
            totalPages: Math.ceil(response.totalCount / response.pageSize),
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Search failed',
            isLoading: false,
          });
        }
      },

      fetchUserDetails: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getUserDetails(userId);
          set({
            selectedUser: response.user,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch user details',
            isLoading: false,
          });
        }
      },

      fetchSuggestions: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getDateSuggestions(userId);
          set({
            userSuggestions: response.suggestions,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch suggestions',
            isLoading: false,
          });
        }
      },

      createDate: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await scheduleDate(data);
          // Refresh dates list after creating
          const genieId = get().admin?.adminId;
          if (genieId) {
            await get().fetchGenieDates({ genieId });
          }
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to schedule date',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchGenieDates: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getGenieDates(params);
          set({
            genieDates: response.dates,
            totalDates: response.totalCount,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch dates',
            isLoading: false,
          });
        }
      },

      updateDateStatus: async (dateId: string, status: string, notes?: string) => {
        set({ isLoading: true, error: null });
        try {
          await updateDateStatus(dateId, status, notes);
          // Refresh dates list after updating
          const genieId = get().admin?.adminId;
          if (genieId) {
            await get().fetchGenieDates({ genieId });
          }
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update date status',
            isLoading: false,
          });
          throw error;
        }
      },

      // Analytics Actions
      fetchPlatformStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const stats = await getPlatformStats();
          set({ platformStats: stats, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch platform stats',
            isLoading: false,
          });
        }
      },

      fetchUserGrowth: async (period, startTime?, endTime?) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getUserGrowth({ period, startTime, endTime });
          set({ userGrowthData: response.dataPoints, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch user growth',
            isLoading: false,
          });
        }
      },

      fetchActiveUsers: async (period, startTime?, endTime?) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getActiveUsers({ period, startTime, endTime });
          set({ activeUsersData: response.dataPoints, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch active users',
            isLoading: false,
          });
        }
      },

      fetchSignups: async (period, startTime?, endTime?) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getSignups({ period, startTime, endTime });
          set({ signupsData: response.dataPoints, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch signups',
            isLoading: false,
          });
        }
      },

      fetchDemographics: async (metricType) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getDemographics(metricType);
          set({ demographicsData: response.data, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch demographics',
            isLoading: false,
          });
        }
      },

      fetchLocationStats: async (level, parentLocation?) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getLocationStats(level, parentLocation);
          set({ locationData: response.locations, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch location stats',
            isLoading: false,
          });
        }
      },

      fetchAvailabilityStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const stats = await getAvailabilityStats();
          set({ availabilityStats: stats, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch availability stats',
            isLoading: false,
          });
        }
      },

      // Bulk Actions
      performBulkAction: async (userIds, action, reason?) => {
        set({ isLoading: true, error: null });
        try {
          const result = await bulkUserAction(userIds, action, reason);

          // Refresh users list after bulk action
          await get().fetchUsers();

          // Show result message
          if (result.failedCount > 0) {
            set({
              error: `Action completed with ${result.failedCount} failures. Check console for details.`,
              isLoading: false,
            });
            console.error('Failed operations:', result.failedUserIds, result.errorMessages);
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Bulk action failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Admin Management Actions
      fetchAdmins: async (page = 1, pageSize = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getAllAdmins(page, pageSize);
          set({
            admins: response.admins,
            totalAdmins: response.totalCount,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch admins',
            isLoading: false,
          });
        }
      },

      createAdmin: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await createAdminUser(data);
          // Refresh admins list
          await get().fetchAdmins();
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create admin',
            isLoading: false,
          });
          throw error;
        }
      },

      updateAdminUser: async (adminId, data) => {
        set({ isLoading: true, error: null });
        try {
          await updateAdmin(adminId, data);
          // Refresh admins list
          await get().fetchAdmins();
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update admin',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteAdminUser: async (adminId) => {
        set({ isLoading: true, error: null });
        try {
          await deleteAdmin(adminId);
          // Refresh admins list
          await get().fetchAdmins();
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete admin',
            isLoading: false,
          });
          throw error;
        }
      },

      updateProfile: async (adminId, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await updateAdminProfile(adminId, data);
          // Update current admin in state if it's the same user
          const currentAdmin = get().admin;
          if (currentAdmin && currentAdmin.adminId === adminId) {
            set({ admin: response.admin });
          }
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      clearSelectedUser: () => set({ selectedUser: null, userSuggestions: [] }),
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
);

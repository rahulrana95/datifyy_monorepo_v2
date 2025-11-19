import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AdminUser,
  UserFullDetails,
  DateSuggestion,
  ScheduledDate,
  adminLogin,
  getAllUsers,
  searchUsers,
  getUserDetails,
  getDateSuggestions,
  scheduleDate,
  getGenieDates,
  updateDateStatus,
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

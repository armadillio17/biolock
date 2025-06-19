import { create } from "zustand";
import { base_url } from '../config';
import { authAxios } from "@/lib/secured-axios-instance";

interface UserData {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    position_id: number;
    created_at: string;
}

interface UserStore {
    userList: UserData[];
    newRegisteredUser: UserData[];
    newRegisteredUserCount: number;
    approvedUser: UserData[];
    isLoading: boolean;
    error: string | null;

    fetchUserList: () => Promise<void>;
    fetchNewUserList: () => Promise<void>;
    fetchApprovedUserList: () => Promise<void>;
    approvedRegisteredUser: (userId: number, is_accepted: boolean) => Promise<void>;
    declineRegisteredUser: (userId: number) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    userList: [],
    newRegisteredUser: [],
    newRegisteredUserCount: 0,
    approvedUser: [],
    isLoading: false,
    error: null,

    fetchUserList: async () => {
        try {
            const response = await authAxios.get(`${base_url}/user/`, {
                withCredentials: true,
            });
            set(() => ({ userList: response.data }));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    },

    fetchNewUserList: async () => {
        try {
            const response = await authAxios.get(`${base_url}/users/new-registered/`, {
                withCredentials: true,
            });
            set(() => ({
                newRegisteredUser: response.data,
                newRegisteredUserCount: response.data.length,
            }));
        } catch (error) {
            console.error("Error fetching new registered users:", error);
        }
    },

    fetchApprovedUserList: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAxios.get(`${base_url}/users/list/`, {
                withCredentials: true,
            });
            set(() => ({
                approvedUser: response.data,
                isLoading: false,
            }));
        } catch (error) {
            console.error("Error fetching approved users:", error);
            set({ isLoading: false });
        }
    },

    approvedRegisteredUser: async (userId: number, is_accepted: boolean) => {
        set({ isLoading: true, error: null });
        try {
            await authAxios.put(
                `${base_url}/users/${userId}/`,
                { is_accepted },
                { withCredentials: true }
            );

            // Refresh both approved and new users after approval
            const [approvedRes, newRes] = await Promise.all([
                authAxios.get(`${base_url}/users/list/`, { withCredentials: true }),
                authAxios.get(`${base_url}/users/new-registered/`, { withCredentials: true }),
            ]);

            set(() => ({
                approvedUser: approvedRes.data,
                newRegisteredUser: newRes.data,
                newRegisteredUserCount: newRes.data.length,
                isLoading: false,
            }));
        } catch (error) {
            console.error("Error approving user:", error);
            set({ isLoading: false });
        }
    },

    declineRegisteredUser: async (userId: number) => {
        set({ isLoading: true, error: null });
        try {
            await authAxios.delete(`${base_url}/users/${userId}/`, {
                withCredentials: true,
            });

            // Refresh newRegisteredUser list after deletion
            const response = await authAxios.get(`${base_url}/users/new-registered/`, {
                withCredentials: true,
            });

            set(() => ({
                newRegisteredUser: response.data,
                newRegisteredUserCount: response.data.length,
                isLoading: false,
            }));
        } catch (error) {
            console.error("Error declining user:", error);
            set({ isLoading: false });
        }
    },
}));

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { base_url } from '../config';
import { authAxios } from "@/lib/secured-axios-instance";

interface UserData {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    created_at: string;
}

interface UserStore {
    userList: UserData[]; // Store all users
    fetchUserList: () => Promise<void>; // Function to fetch users
}

export const useUserStore = create<UserStore>((set) => ({
    userList: [], // Stores the fetched user data

    fetchUserList: async () => {
        console.log("fetchUserList() called!"); // Check if this function runs
        try {
            const response = await authAxios.get(`${base_url}/user/`, {
                withCredentials: true
            });

            set(() => ({ userList: response.data })); // Update Zustand state with fetched users
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }
}));
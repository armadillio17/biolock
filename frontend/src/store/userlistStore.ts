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
    userList: UserData[]; 
    newRegisteredUser: UserData[]; 
    approvedUser: UserData[]; 

    fetchUserList: () => Promise<void>; 
    fetchNewUserList: () => Promise<void>; 
    fetchApprovedUserList: () => Promise<void>; 
    approvedRegisteredUser: (userId: number, is_accepted:boolean) => Promise<void>;
    
}

export const useUserStore = create<UserStore>((set) => ({
    userList: [],
    newRegisteredUser: [],
    approvedUser: [],

    fetchUserList: async () => {
        try {
            const response = await authAxios.get(`${base_url}/user/`, {
                withCredentials: true
            });

            set(() => ({ userList: response.data })); // Update Zustand state with fetched users
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    },

    fetchNewUserList: async () => {
        try {
            const response = await authAxios.get(`${base_url}/users/new-registered/`, {
                withCredentials: true
            });

            set(() => ({ newRegisteredUser: response.data })); 
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    },

    fetchApprovedUserList: async () => {
        try {
            const response = await authAxios.get(`${base_url}/users/list/`, {
                withCredentials: true
            });

            set(() => ({ approvedUser: response.data }));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    },

    approvedRegisteredUser: async (userId: number, is_accepted:boolean) => {
        try {
            const response = await authAxios.put(`${base_url}/users/${userId}/`,{
                is_accepted: is_accepted
            },{
                withCredentials: true
            });

            set(() => ({ approvedUser: response.data }));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    },

}));
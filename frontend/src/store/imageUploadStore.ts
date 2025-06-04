import { create } from "zustand";
import { base_url } from "../config";

interface ImageUploadState {
    uploading: boolean;
    error: string | null;
    imageUrl: string | null;
  
    uploadImage: (userId: number, file: File) => Promise<void>;
    removeImage: (userId: number) => Promise<void>;
  }
  
  export const useImageUploadStore = create<ImageUploadState>((set) => ({
    uploading: false,
    error: null,
    imageUrl: null,
  
    uploadImage: async (userId: number, file) => {
      set({ uploading: true, error: null });
  
      const formData = new FormData();
      formData.append('profile_picture', file);
  
      try {
        const response = await fetch(`${base_url}/user/${userId}/upload-profile/`, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }
  
        const data = await response.json();
        set({ imageUrl: data.url, uploading: false });
      } catch (error: unknown) {
        console.error("Error fetching attendance:", error);
        set({ 
          error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        });
      }
    },
  
    removeImage: async (userId) => {
      set({ uploading: true, error: null });
  
      try {
        const response = await fetch(`${base_url}/user/${userId}/remove-profile/`, {
          method: 'POST',
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Remove failed");
        }
  
        const data = await response.json();
        set({ imageUrl: data.url, uploading: false });
      } catch (error: unknown) {
        console.error("Error fetching attendance:", error);
        set({ 
          error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        });
      }
    },
  }));

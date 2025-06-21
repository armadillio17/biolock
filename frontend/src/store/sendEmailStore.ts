import { create } from "zustand";
import { base_url } from "../config";

interface EmailSendState {
  email: string;
  error: string | null;
  success: boolean;
  sendEmail: (email: string) => Promise<void>;
}

export const useEmailSendStore = create<EmailSendState>((set) => ({
  email: "",
  error: null,
  success: false,

  sendEmail: async (email: string) => {
    set({ error: null, success: false });

    try {
      const response = await fetch(`${base_url}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Send JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email.");
      }

      set({ email, success: true });
    } catch (error: unknown) {
      console.error("Error sending email:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error occurred.",
        success: false,
      });
    }
  },
}));

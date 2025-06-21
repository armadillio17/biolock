import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useEmailSendStore } from "@/store/sendEmailStore";
import toast from "react-hot-toast";

interface SendLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendRegistrationLinkModal: React.FC<SendLinkModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const { sendEmail, error, success } = useEmailSendStore();

  const handleSubmit = async () => {
    if (email.trim()) {
      await sendEmail(email);
      setEmail("");
      onClose();
    }
  };

  useEffect(() => {
    if (success) {
      toast.success("Registration link sent successfully!");
    }
  }, [success]);

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg p-6 max-w-md w-full shadow-xl z-50">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Send Registration Link</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-500"
          />

          {error && (
            <div className="text-red-600 text-sm mb-2">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 text-white hover:bg-blue-700">
              Send Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendRegistrationLinkModal;

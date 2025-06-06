import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { usePositionStore, PositionData } from '@/store/positionStore';
import { useUpdateUserStore } from '@/store/userStore';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position_id: number;
}

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserViewModal: React.FC<UserViewModalProps> = ({ isOpen, onClose, user }) => {
  const {
    fetchUserPosition,
    fetchPosition,
    position,
    userPosition,
    isLoading
  } = usePositionStore();

  const { updateUserPosition } = useUpdateUserStore();

  const [showPositions, setShowPositions] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.position_id) {
      fetchUserPosition(user.position_id);
    }
  }, [fetchUserPosition, user?.position_id]);

  useEffect(() => {
    if (showPositions) fetchPosition();
  }, [showPositions, fetchPosition]);

  const handleUserPositionUpdate = async () => {
    if (user?.id && selectedPositionId !== null) {
      await updateUserPosition(user.id, selectedPositionId);
      setShowPositions(false);
      await fetchUserPosition(selectedPositionId); // Refresh display
    } else {
      console.warn('Missing user ID or selected position ID');
    }
  };

  const handleCloseModal = () => {
    onClose();
    setShowPositions(false);
    setSelectedPositionId(null);
  };

  // Helper function to render position options without using .map()
  const renderPositionOptions = () => {
    if (!Array.isArray(position) || position.length === 0) {
      return null;
    }

    const options = [];
    for (let i = 0; i < position.length; i++) {
      const pos = position[i] as PositionData;
      options.push(
        <option key={pos.id} value={pos.id}>
          {pos.position_name}
        </option>
      );
    }
    return options;
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 bg-white rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-xl font-bold">User Information</h2>

        <div className="space-y-3">
          <div>
            <span className="font-semibold">Name:</span> {user.first_name} {user.last_name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">Current Position:</span>{' '}
            {userPosition?.position_name || 'Position not found'}
            <button
              onClick={() => {
                setShowPositions(true);
                setSelectedPositionId(user.position_id ?? null); // Set default
              }}
              className="ml-2 text-blue-500 hover:text-blue-700"
              title="Edit Position"
            >
              <Pencil size={16} />
            </button>
          </div>

          {showPositions && (
            <div className="mt-2">
              {isLoading ? (
                <div>Loading positions...</div>
              ) : Array.isArray(position) && position.length > 0 ? (
                <select
                  className="w-full px-2 py-1 border rounded"
                  onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                  value={selectedPositionId ?? ''}
                >
                  <option value="">Select a position</option>
                  {renderPositionOptions()}
                </select>
              ) : (
                <div className="text-sm text-gray-500">No positions available</div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6 space-x-2">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 font-bold text-gray-700 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleUserPositionUpdate}
              className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Update Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;
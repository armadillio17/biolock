import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react'; // Pencil icon from lucide-react
import { usePositionStore, PositionData } from '@/store/positionStore';
import { useUpdateUserStore } from '@/store/userStore'; // Re-added import

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
  const { fetchUserPosition, fetchPosition, position, userPosition, isLoading } = usePositionStore();
  const { updateUserPosition } = useUpdateUserStore();

  const [showPositions, setShowPositions] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {

      if (!user?.position_id) return;

         await fetchUserPosition(user.position_id);

    };
  
    loadData();
  }, [fetchUserPosition, user?.position_id]);
  

  const handlePositionList = () => {
    fetchPosition();
    setShowPositions(true);
  }

  const handleUserPositionUpdate = () => {
    if (user?.id !== undefined && selectedPositionId !== null) {
      updateUserPosition(user.id, selectedPositionId);
      setShowPositions(false); // optionally hide dropdown after update
    } else {
      console.warn('Missing user ID or selected position ID');
    }

  };

  const handleCloseModal = () => {
    onClose();
    setShowPositions(false);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">User Information</h2>
        <div className="space-y-3">
          <div>
            <span className="font-semibold">Name:</span> {user.first_name} {user.last_name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">
                Current Position: {userPosition && user?.position_id === userPosition.id
                ? userPosition.position_name
                : 'No position'}
            </span>
            <button
                onClick={handlePositionList}
                className="ml-2 text-blue-500 hover:text-blue-700"
                title="Edit Position"
                >
                <Pencil size={16} />
            </button>
          </div>
        </div>

        {/* Position List Dropdown */}
        {showPositions && (
            <div className="mt-2">
            {isLoading ? (
                <div>Loading positions...</div>
            ) : (
                <select 
                    className="border rounded px-2 py-1"
                    onChange={(e) => {
                        const id = Number(e.target.value);
                        setSelectedPositionId(id);
                      }}
                >
                    <option value="">Select a position</option>
                    {position.map((pos: PositionData) => (
                        <option key={pos.id} value={pos.id}>
                        {pos.position_name}
                        </option>
                    ))}
                </select>
            )}
            </div>
        )}

        <div className="mt-6 flex justify-end space-x-2">
            <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
              >
                Cancel
            </button>
            <button
                onClick={handleUserPositionUpdate}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
              >
                Update Position
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;
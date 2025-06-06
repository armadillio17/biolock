import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { usePositionStore } from '@/store/positionStore';

const PositionsView = () => {
  const {
    position,
    isLoading,
    error,
    fetchPosition,
    createPosition,
    updatePosition,
    deletePosition,
  } = usePositionStore();

  const [showInput, setShowInput] = useState(false);
  const [newPosition, setNewPosition] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  const handleCreate = async () => {
    if (!newPosition.trim()) return;
    await createPosition(newPosition);
    setNewPosition('');
    setShowInput(false);
    await fetchPosition(); // 🔁 Refresh after creating new position
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    await updatePosition(id, editingName);
    setEditingId(null);
    setEditingName('');
    await fetchPosition(); // 🔁 Refresh after updating
  };

  // Helper function to render position items without using .map()
  const renderPositionItems = () => {
    if (!Array.isArray(position) || position.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          No positions available
        </div>
      );
    }

    const items = [];
    for (let i = 0; i < position.length; i++) {
      const pos = position[i];
      items.push(
        <div
          key={pos.id}
          className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
        >
          {editingId === pos.id ? (
            <div className="flex items-center flex-1 gap-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                autoFocus
              />
              <Button
                onClick={() => handleUpdate(pos.id)}
                className="p-2 text-green-600 transition-colors rounded-full hover:bg-green-50"
              >
                <Check className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setEditingName('');
                }}
                className="p-2 text-red-600 transition-colors rounded-full hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <>
              <span className="font-medium text-gray-900">{pos.position_name}</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setEditingId(pos.id);
                    setEditingName(pos.position_name);
                  }}
                  className="p-2 text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button
                  onClick={async () => {
                    await deletePosition(pos.id);
                    await fetchPosition(); // 🔁 Refresh after deletion
                  }}
                  className="p-2 text-red-600 transition-colors rounded-full hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      );
    }
    return items;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
              <Button
                onClick={() => setShowInput(true)}
                className="p-2 text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>

            {showInput && (
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Position name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                  autoFocus
                />
                <Button
                  onClick={handleCreate}
                  className="p-2 text-green-600 transition-colors rounded-full hover:bg-green-50"
                >
                  <Check className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => {
                    setShowInput(false);
                    setNewPosition('');
                  }}
                  className="p-2 text-red-600 transition-colors rounded-full hover:bg-red-50"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            {error && <p className="mb-4 text-red-500">{error}</p>}

            {isLoading ? (
              <p>Loading positions...</p>
            ) : (
              <div className="space-y-3">
                {renderPositionItems()}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PositionsView;
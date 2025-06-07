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
    await fetchPosition(); // Refresh list
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    await updatePosition(id, editingName);
    setEditingId(null);
    setEditingName('');
    await fetchPosition(); // Refresh list
  };

  // Helper function to render position items with loading state
  const renderPositionItems = () => {
    if (isLoading && position.length === 0) {
      return [...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 animate-pulse">
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ));
    }

    if (!Array.isArray(position) || position.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          No positions found. Click "+" to add one.
        </div>
      );
    }

    return position.map((pos) => (
      <div
        key={pos.id}
        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
      >
        {editingId === pos.id ? (
          <div className="flex items-center flex-1 gap-2">
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 outline-none"
              autoFocus
            />
            <Button
              onClick={() => handleUpdate(pos.id)}
              variant="outline"
              size="icon"
              className="text-green-600 border-green-300 hover:bg-green-50"
              disabled={isLoading}
            >
              <Check className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => {
                setEditingId(null);
                setEditingName('');
              }}
              variant="outline"
              size="icon"
              className="text-red-600 border-red-300 hover:bg-red-50"
              disabled={isLoading}
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
                variant="outline"
                size="icon"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                disabled={isLoading}
              >
                <Pencil className="w-5 h-5" />
              </Button>
              <Button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this position?')) {
                    await deletePosition(pos.id);
                    await fetchPosition(); // Refresh after deletion
                  }
                }}
                variant="outline"
                size="icon"
                className="text-red-600 border-red-300 hover:bg-red-50"
                disabled={isLoading}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    ));
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Positions</h1>
          <Button
            onClick={() => setShowInput(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Position
          </Button>
        </div>
        {/* Input Field */}
        {showInput && (
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="Enter position name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
              autoFocus
            />
            <Button
              onClick={handleCreate}
              variant="outline"
              size="icon"
              className="text-green-600 border-green-300 hover:bg-green-50"
              disabled={isLoading}
            >
              <Check className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => {
                setShowInput(false);
                setNewPosition('');
              }}
              variant="outline"
              size="icon"
              className="text-red-600 border-red-300 hover:bg-red-50"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 text-red-600 bg-red-50 border border-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Position List Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800">
            All Positions
          </div>
          <div className="p-6 space-y-3">
            {renderPositionItems()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PositionsView;
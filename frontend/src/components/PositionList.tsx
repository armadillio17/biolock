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
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    await updatePosition(id, editingName);
    setEditingId(null);
    setEditingName('');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
              <Button
                onClick={() => setShowInput(true)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            {showInput && (
              <div className="mb-6 flex items-center gap-2">
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Position name"
                  className="flex-1 rounded-md border-gray-300 border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  autoFocus
                />
                <Button
                  onClick={handleCreate}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => {
                    setShowInput(false);
                    setNewPosition('');
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {isLoading ? (
              <p>Loading positions...</p>
            ) : (
              <div className="space-y-3">
                {position.map((pos) => (
                  <div
                    key={pos.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    {editingId === pos.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 rounded-md border-gray-300 border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                          autoFocus
                        />
                        <Button
                          onClick={() => handleUpdate(pos.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-900 font-medium">{pos.position_name}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => {
                              setEditingId(pos.id);
                              setEditingName(pos.position_name);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            onClick={() => deletePosition(pos.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PositionsView;

import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

interface Department {
  id: number;  // Changed from string to number to match Django's PK
  department_name: string;
}

function App() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);  // Changed to number
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await authAxios.get(`${base_url}/departments/`);
        setDepartments(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch departments');
        setIsLoading(false);
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  const handleAdd = async () => {
    if (!newDepartment.trim()) return;

    try {
      const response = await authAxios.post(`${base_url}/departments/`, {
        department_name: newDepartment
      });
      
      setDepartments([...departments, response.data]);
      setNewDepartment('');
      setShowInput(false);
    } catch (err) {
      setError('Failed to add department');
      console.error('Error adding department:', err);
    }
  };

  const handleEdit = (id: number) => {
    const department = departments.find(d => d.id === id);
    if (department) {
      setEditingId(id);
      setEditingName(department.department_name);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    try {
      const response = await authAxios.put(`${base_url}/departments/${editingId}/`, {
        department_name: editingName
      });

      setDepartments(departments.map(dept =>
        dept.id === editingId ? response.data : dept
      ));
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      setError('Failed to update department');
      console.error('Error updating department:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await authAxios.delete(`${base_url}/departments/${id}/`);
      setDepartments(departments.filter(dept => dept.id !== id));
    } catch (err) {
      setError('Failed to delete department');
      console.error('Error deleting department:', err);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading departments...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
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
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Department name"
                  className="flex-1 rounded-md border-gray-300 border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  autoFocus
                />
                <Button
                  onClick={handleAdd}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => {
                    setShowInput(false);
                    setNewDepartment('');
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {departments.map(department => (
                <div
                  key={department.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  {editingId === department.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-md border-gray-300 border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                        autoFocus
                      />
                      <Button
                        onClick={handleSaveEdit}
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
                      <span className="text-gray-900 font-medium">{department.department_name}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(department.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(department.id)}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App
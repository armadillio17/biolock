import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Department {
  id: number;
  department_name: string;
}

export default function DepartmentView() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await authAxios.get(`${base_url}/departments/`);
        setDepartments(response.data);
      } catch (err) {
        setError('Failed to load departments');
        console.error('Error fetching departments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleAdd = async () => {
    if (!newDepartment.trim()) return;

    try {
      const response = await authAxios.post(`${base_url}/departments/`, {
        department_name: newDepartment,
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
        department_name: editingName,
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

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
          <Button
            onClick={() => setShowInput(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Department
          </Button>
        </div>

        {/* Departments Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-md">
          {/* Input Field */}
          {showInput && (
            <div className="mb-6 flex items-center gap-2">
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Enter department name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                autoFocus
              />
              <Button
                onClick={handleAdd}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => {
                  setShowInput(false);
                  setNewDepartment('');
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Department List */}
          <div className="space-y-3">
            {isLoading ? (
              // Skeleton loader
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg animate-pulse">
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                    <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              ))
            ) : departments.length > 0 ? (
              departments.map(department => (
                <div
                  key={department.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {editingId === department.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        autoFocus
                      />
                      <Button
                        onClick={handleSaveEdit}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-800 font-medium">{department.department_name}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(department.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Pencil className="w-5 h-5" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(department.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500">
                No departments found. Click "+" to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
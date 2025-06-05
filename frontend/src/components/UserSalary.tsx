import { useState, useEffect } from 'react';
import { Button } from "./ui/button"
import { Calendar, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';

type SalaryType = 'monthly' | 'hourly'

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface UserSalary {
  id?: number;
  user: number;
  salary_type: SalaryType; 
  amount: string;
  effective_date: string; 
}

export default function UserSalary() {
  const [formData, setFormData] = useState<{
    id?: number;
    user: string;
    salary_type: SalaryType;
    amount: string;
    effective_date: string;
  }>({
    user: '',
    salary_type: 'monthly' as SalaryType,
    amount: '',
    effective_date: ''
  });
  const [salaryList, setSalaryList] = useState<UserSalary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchSalaries();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authAxios.get(`${base_url}/user/`);
      const acceptedUsers = response.data
        .filter((user: any) => user.is_accepted)
        .map((user: any) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }));
      setUsers(acceptedUsers);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalaries = async () => {
    setIsLoading(true);
    try {
      const response = await authAxios.get(`${base_url}/user-salary/`);
      setSalaryList(response.data);
    } catch (err) {
      setError('Failed to fetch salaries');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Reset previous error

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        user: parseInt(formData.user)
      };

      await authAxios.post(`${base_url}/user-salary/`, payload);
      await fetchSalaries();
      resetForm();
    } catch (err: any) {
      // Try to extract detailed error from response
      const errorMessage = 
        err.response?.data?.user?.[0] || 
        err.response?.data?.detail || 
        'Failed to save salary';

      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (salary: UserSalary) => {
    setEditingId(salary.id || null);
  };

  const handleSaveEdit = async (salary: UserSalary) => {
    setIsLoading(true);
    try {
      const payload = {
        user: salary.user,
        salary_type: salary.salary_type,
        amount: parseFloat(salary.amount),
        effective_date: salary.effective_date
      };

      await authAxios.put(`${base_url}/user-salary/${salary.id}/`, payload);
      setEditingId(null);
      await fetchSalaries();
    } catch (err) {
      setError('Failed to update salary');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      setIsLoading(true);
      try {
        await authAxios.delete(`${base_url}/user-salary/${id}/`);
        await fetchSalaries();
      } catch (err) {
        setError('Failed to delete salary');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditChange = (id: number, field: string, value: string | number) => {
    setSalaryList(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const resetForm = () => {
    setFormData({
      user: '',
      salary_type: 'monthly',
      amount: '',
      effective_date: ''
    });
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Salary</h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 border capitalize border-red-400 text-red-700 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.user}
              onChange={(e) => setFormData({...formData, user: e.target.value})}
              required
              disabled={isLoading}
            >
              <option value="">{isLoading ? 'Loading...' : 'Select User'}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.salary_type}
              onChange={(e) => setFormData({...formData, salary_type: e.target.value as SalaryType})}
              required
            >
              <option value="monthly">Monthly</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
                value={formData.effective_date}
                onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                required
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" disabled={isLoading}>
              {isLoading ? 'Saving...' : (
                <><Plus className="mr-2 h-4 w-4" /> Add Salary</>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary List</h3>
        {isLoading && salaryList.length === 0 ? (
          <div className="text-center py-4">Loading...</div>
        ) : salaryList.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">User</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Type</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Amount</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Date</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaryList.map((salary) => (
                  <tr key={salary.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {editingId === salary.id ? (
                        <select
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={salary.user}
                          onChange={(e) => handleEditChange(salary.id!, 'user', parseInt(e.target.value))}
                        >
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getUserName(salary.user)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize text-center">
                      {editingId === salary.id ? (
                        <select
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={salary.salary_type}
                          onChange={(e) => handleEditChange(salary.id!, 'salary_type', e.target.value as SalaryType)}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="hourly">Hourly</option>
                        </select>
                      ) : (
                        salary.salary_type
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {editingId === salary.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={salary.amount}
                          onChange={(e) => handleEditChange(salary.id!, 'amount', e.target.value)}
                        />
                      ) : (
                        parseFloat(salary.amount).toLocaleString(undefined, {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {editingId === salary.id ? (
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
                            value={salary.effective_date}
                            onChange={(e) => handleEditChange(salary.id!, 'effective_date', e.target.value)}
                          />
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 text-center" />
                        </div>
                      ) : (
                        new Date(salary.effective_date).toLocaleDateString()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {editingId === salary.id ? (
                        <div className="flex space-x-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveEdit(salary)}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4 text-green-500 items-center" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(salary)}
                            disabled={isLoading || editingId !== null}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => salary.id && handleDelete(salary.id)}
                            disabled={isLoading || editingId !== null}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Calendar, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';

type SalaryType = 'monthly' | 'hourly';

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
    user: string;
    salary_type: SalaryType;
    amount: string;
    effective_date: string;
  }>({
    user: '',
    salary_type: 'monthly',
    amount: '',
    effective_date: ''
  });

  const [salaryList, setSalaryList] = useState<UserSalary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [, setIsFormOpen] = useState(false);

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
      setError('Failed to fetch salary data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

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
      const errorMessage =
        err.response?.data?.user?.[0] ||
        err.response?.data?.detail ||
        'Failed to save salary';
      setError(errorMessage);
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
    if (!window.confirm('Are you sure you want to delete this salary?')) return;

    setIsLoading(true);
    try {
      await authAxios.delete(`${base_url}/user-salary/${id}/`);
      setSalaryList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete salary');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (id: number, field: keyof UserSalary, value: string | number) => {
    setSalaryList(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const resetForm = () => {
    setFormData({
      user: '',
      salary_type: 'monthly',
      amount: '',
      effective_date: ''
    });
    setIsFormOpen(false);
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Add New Salary Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Salary</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              required
              disabled={isLoading}
            >
              <option value="">{isLoading ? 'Loading...' : 'Select User'}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={formData.salary_type}
                onChange={(e) =>
                  setFormData({ ...formData, salary_type: e.target.value as SalaryType })
                }
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center gap-2"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              {isLoading ? "Saving..." : "Add Salary"}
            </Button>
          </div>
        </form>
      </div>

      {/* Salary List Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800">
          Salary Records
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && salaryList.length === 0 ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"><div className="h-5 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"><div className="h-5 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600"><div className="h-5 bg-gray-200 rounded w-20 ml-auto"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600"><div className="h-5 bg-gray-200 rounded w-20 ml-auto"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="inline-flex gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : salaryList.length > 0 ? (
                salaryList.map((salary) => (
                  <tr key={salary.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {editingId === salary.id ? (
                        <select
                          className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {editingId === salary.id ? (
                        <select
                          className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
                          value={salary.salary_type}
                          onChange={(e) => handleEditChange(salary.id!, 'salary_type', e.target.value as SalaryType)}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="hourly">Hourly</option>
                        </select>
                      ) : (
                        <span className={`capitalize ${salary.salary_type === 'monthly' ? 'text-blue-600' : 'text-green-600'}`}>
                          {salary.salary_type}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800">
                      {editingId === salary.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full text-right rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800">
                      {editingId === salary.id ? (
                        <div className="relative max-w-xs mx-auto">
                          <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            className="pl-9 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
                            value={salary.effective_date}
                            onChange={(e) => handleEditChange(salary.id!, 'effective_date', e.target.value)}
                          />
                        </div>
                      ) : (
                        new Date(salary.effective_date).toLocaleDateString()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 flex justify-end">
                      {editingId === salary.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => handleSaveEdit(salary)}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={handleCancelEdit}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => handleEdit(salary)}
                            disabled={isLoading || editingId !== null}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => salary.id && handleDelete(salary.id)}
                            disabled={isLoading || editingId !== null}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No salary records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
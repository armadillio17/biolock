import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';

interface PayrollPeriod {
  id?: number;
  start_date: string;
  end_date: string;
  is_processed: boolean;
}

export default function PayrollPeriod() {
  const [payrollPeriod, setPayrollPeriod] = useState<PayrollPeriod>({
    start_date: '',
    end_date: '',
    is_processed: false
  });
  const [periodList, setPeriodList] = useState<PayrollPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch payroll periods on mount
  useEffect(() => {
    fetchPayrollPeriods();
  }, []);

  const fetchPayrollPeriods = async () => {
    setIsLoading(true);
    try {
      const response = await authAxios.get(`${base_url}/payroll-period/`);
      setPeriodList(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load payroll periods');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayrollPeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authAxios.post(`${base_url}/payroll-period/`, payrollPeriod);
      console.log(response);
      setSuccessMessage('Payroll period saved successfully!');
      setPayrollPeriod({
        start_date: '',
        end_date: '',
        is_processed: false
      });
      await fetchPayrollPeriods(); // Refresh list
    } catch (err: any) {

      const errorMessage =
        err.response?.data?.detail ||
        'Failed to save payroll period';
      setError(errorMessage);
      console.error(err);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payroll period?')) return;

    setIsLoading(true);
    try {
      await authAxios.delete(`${base_url}/payroll-period/${id}/`);
      setSuccessMessage('Payroll period deleted successfully!');
      await fetchPayrollPeriods(); // Refresh list
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        'Failed to delete payroll period';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePayslip = async (period: PayrollPeriod) => {
    setIsLoading(true);
    try {
      await authAxios.post(`${base_url}/payslip/`, {
        start_date: period.start_date,
        end_date: period.end_date,
        is_processed: true
      });
      setSuccessMessage('Payslips generated successfully!');
      await fetchPayrollPeriods(); // Refresh the list
    } catch (error: any) {
      let errorMessage = "Failed to generate payslip";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Add New Payroll Period Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Payroll Period</h2>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePayrollPeriodSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={payrollPeriod.start_date}
                onChange={(e) =>
                  setPayrollPeriod({ ...payrollPeriod, start_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={payrollPeriod.end_date}
                onChange={(e) =>
                  setPayrollPeriod({ ...payrollPeriod, end_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Payroll Period"}
          </Button>
        </form>
      </div>

      {/* Payroll Period List Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800">
          Payroll Periods
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && periodList.length === 0 ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-block h-6 px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
                        Loading
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : periodList.length > 0 ? (
                periodList.map((period) => (
                  <tr key={period.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {new Date(period.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {new Date(period.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          period.is_processed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {period.is_processed ? 'Processed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 flex justify-end">
                      {!period.is_processed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => handleGeneratePayslip(period)}
                          disabled={isLoading}
                        >
                          Generate Payslip
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => period.id && handleDelete(period.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No payroll periods found.
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
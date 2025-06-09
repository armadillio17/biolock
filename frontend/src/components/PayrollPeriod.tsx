import { useState, useEffect } from 'react';
import { Button } from "./ui/button"
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';
import { Trash2 } from 'lucide-react'
import { Calendar } from 'lucide-react'

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
  const [error, setError] = useState('');

  // Fetch payroll periods on component mount
  useEffect(() => {
    fetchPayrollPeriods();
  }, []);

  const fetchPayrollPeriods = async () => {
    setIsLoading(true);
    try {
      const response = await authAxios.get(`${base_url}/payroll-period/`);
      setPeriodList(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch payroll periods');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayrollPeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authAxios.post(`${base_url}/payroll-period/`, payrollPeriod);
      console.log(response);
      await fetchPayrollPeriods(); // Refresh the list
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
    if (window.confirm('Are you sure you want to delete this payroll period?')) {
      setIsLoading(true);
      try {
        await authAxios.delete(`${base_url}/payroll-period/${id}/`);
        await fetchPayrollPeriods(); // Refresh the list
      } catch (err) {
        setError('Failed to delete payroll period');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

const handleGeneratePayslip = async (period: PayrollPeriod) => {
  try {
    const response = await authAxios.post(`${base_url}/payslip/`, {
      start_date: period.start_date,
      end_date: period.end_date,
      is_processed: period.is_processed,
    });

    console.log('Payslip generated successfully:', response.data);
    alert('Payslip(s) generated successfully!');

  } catch (error: any) {
    if (error.response) {
      console.error('Failed to generate payslip:', error.response.data.error);
      alert(`Error: ${error.response.data.error}`);
    } else {
      console.error('Unexpected error while generating payslip:', error);
      alert('An unexpected error occurred while generating the payslip.');
    }
  }
};

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Payroll Period</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handlePayrollPeriodSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
                value={payrollPeriod.start_date}
                onChange={(e) => setPayrollPeriod({ ...payrollPeriod, start_date: e.target.value })}
                required
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
                value={payrollPeriod.end_date}
                onChange={(e) => setPayrollPeriod({ ...payrollPeriod, end_date: e.target.value })}
                required
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* <div className="flex items-center">
            <input
              type="checkbox"
              id="isProcessed"
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              checked={payrollPeriod.is_processed}
              onChange={(e) => setPayrollPeriod({ ...payrollPeriod, is_processed: e.target.checked })}
            />
            <label htmlFor="isProcessed" className="ml-2 block text-sm text-gray-700">
              Mark as Processed
            </label>
          </div> */}

          <Button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Payroll Period'}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payroll Periods</h3>
        {isLoading && periodList.length === 0 ? (
          <div className="text-center py-4">Loading payroll periods...</div>
        ) : periodList.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No payroll periods found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {periodList.map((period) => (
                  <tr key={period.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {new Date(period.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {new Date(period.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${period.is_processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {period.is_processed ? 'Processed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => period.id && handleDelete(period.id)}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleGeneratePayslip(period)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Generate Payslip
                      </button>
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
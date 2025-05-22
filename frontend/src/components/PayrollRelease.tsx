import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Eye, Download } from 'lucide-react';
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';

interface Payslip {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  generated_at: string;
  total_working_hours: number;
  total_overtime_hours: number;
  total_leave_hours: number;
  total_absences: number;
  gross_pay: number;
  deductions: number;
  sss_employee: number;
  philhealth_employee: number;
  pagibig_employee: number;
  sss_employer: number;
  philhealth_employer: number;
  pagibig_employer: number;
  employer_contributions: number;
  employee_contributions: number;
  payroll_period: {
    id: string;
    start_date: string;
    end_date: string;
    total_amount: number;
  };
}

export default function PayrollRelease() {
  const [selectedPayslipGroup, setSelectedPayslipGroup] = useState<{
    period: { id: string; start_date: string; end_date: string };
    payslips: Payslip[];
    totalAmount: number;
    generated_at: string;
  } | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Group payslips by payroll period
  const groupedPayslips = payslips.reduce((acc, payslip) => {
    const periodKey = `${payslip.payroll_period.start_date}-${payslip.payroll_period.end_date}`;
    if (!acc[periodKey]) {
      acc[periodKey] = {
        period: {
          id: payslip.payroll_period.id,
          start_date: payslip.payroll_period.start_date,
          end_date: payslip.payroll_period.end_date,
          total_amount: payslip.payroll_period.total_amount,
        },
        payslips: [],
        totalAmount: 0,
        generated_at: payslip.generated_at
      };
    }
    acc[periodKey].payslips.push(payslip);
    acc[periodKey].totalAmount += (payslip.gross_pay - payslip.deductions);
    return acc;
  }, {} as Record<string, {
      period: { id: string; start_date: string; end_date: string; total_amount?: number };
      payslips: Payslip[]; totalAmount: number; generated_at: string 
    }>);

  // Fetch payslips from API
  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const response = await authAxios.get(`${base_url}/payslip/`);
      setPayslips(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch payslips');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const downloadPayslipsPdf = async (payrollPeriodId: string) => {
    try {
      const response = await authAxios.get(`/payslip/download-pdf/${payrollPeriodId}/`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Check if we actually got a PDF
      if (!blob.type.includes('application/pdf')) {
        const text = await blob.text();
        throw new Error(text || 'Server returned non-PDF content');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslips_${payrollPeriodId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Error details:', error);
      
      // Handle Axios error structure
      let errorMessage = 'Download failed';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as {
          response?: any;
          request?: any;
          message?: string;
        };
        // Server responded with a status code outside 2xx
        if (axiosError.response?.data instanceof Blob) {
          try {
            const errorText = await axiosError.response.data.text();
            errorMessage = errorText || axiosError.message;
          } catch (e) {
            errorMessage = 'Failed to parse error response';
          }
        } else {
          errorMessage = axiosError.response?.data?.message || axiosError.message;
        }
      } else if (typeof error === 'object' && error !== null && 'request' in error) {
        // Request was made but no response received
        errorMessage = 'No response from server';
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        // Something happened in setting up the request
        errorMessage = (error as { message?: string }).message || 'An error occurred';
      } else {
        errorMessage = 'An unknown error occurred';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Payroll Releases</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4">Loading payroll releases...</div>
        ) : Object.keys(groupedPayslips).length === 0 ? (
          <div className="text-center py-4 text-gray-500">No payroll releases found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payroll Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(groupedPayslips).map(([key, group]) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(group.period.start_date).toLocaleDateString()} - {new Date(group.period.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(group.generated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${group.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Button
                        onClick={() => setSelectedPayslipGroup(group)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
<Button
  onClick={() => downloadPayslipsPdf(group.period.id)}
  variant="outline"
  size="sm"
  className="flex items-center"
>
  <Download className="w-4 h-4 mr-2" />
  Download PDF
</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPayslipGroup && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Payslips for {new Date(selectedPayslipGroup.period.start_date).toLocaleDateString()} - {new Date(selectedPayslipGroup.period.end_date).toLocaleDateString()}
            </h3>
            <button
              onClick={() => {
                setSelectedPayslipGroup(null);
                setSelectedPayslip(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedPayslipGroup.payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payslip.user.first_name} {payslip.user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payslip.total_working_hours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payslip.gross_pay.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(payslip.gross_pay - payslip.deductions).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Button
                        onClick={() => setSelectedPayslip(payslip)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View More
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Payslip Details - {selectedPayslip.user.first_name} {selectedPayslip.user.last_name}
              </h3>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Existing fields */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Payroll Period</p>
                <p className="text-lg font-medium">
                  {new Date(selectedPayslip.payroll_period.start_date).toLocaleDateString()} - 
                  {new Date(selectedPayslip.payroll_period.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Generated On</p>
                <p className="text-lg font-medium">
                  {new Date(selectedPayslip.generated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Working Hours</p>
                <p className="text-lg font-medium">{selectedPayslip.total_working_hours} hours</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Overtime Hours</p>
                <p className="text-lg font-medium">{selectedPayslip.total_overtime_hours} hours</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Leave Hours</p>
                <p className="text-lg font-medium">{selectedPayslip.total_leave_hours} hours</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Absences</p>
                <p className="text-lg font-medium">{selectedPayslip.total_absences} days</p>
              </div>

              {/* Government Contributions - Employee Share */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">SSS (Employee)</p>
                <p className="text-lg font-medium">${selectedPayslip.sss_employee.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">PhilHealth (Employee)</p>
                <p className="text-lg font-medium">${selectedPayslip.philhealth_employee.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Pag-IBIG (Employee)</p>
                <p className="text-lg font-medium">${selectedPayslip.pagibig_employee.toLocaleString()}</p>
              </div>

              {/* Government Contributions - Employer Share */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">SSS (Employer)</p>
                <p className="text-lg font-medium">${selectedPayslip.sss_employer.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">PhilHealth (Employer)</p>
                <p className="text-lg font-medium">${selectedPayslip.philhealth_employer.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Pag-IBIG (Employer)</p>
                <p className="text-lg font-medium">${selectedPayslip.pagibig_employer.toLocaleString()}</p>
              </div>

              {/* Contribution Totals */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Total Employee Contributions</p>
                <p className="text-lg font-medium">${selectedPayslip.employee_contributions.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Total Employer Contributions</p>
                <p className="text-lg font-medium">${selectedPayslip.employer_contributions.toLocaleString()}</p>
              </div>

              {/* Existing financial summary */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Gross Pay</p>
                <p className="text-lg font-medium text-green-600">${selectedPayslip.gross_pay.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Deductions</p>
                <p className="text-lg font-medium text-red-600">${selectedPayslip.deductions.toLocaleString()}</p>
              </div>
              <div className="col-span-2 pt-4 border-t">
                <p className="text-sm text-gray-600">Net Pay</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(selectedPayslip.gross_pay - selectedPayslip.deductions).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
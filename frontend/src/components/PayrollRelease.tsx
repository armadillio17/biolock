import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Eye, Download, X } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      payslips: Payslip[];
      totalAmount: number;
      generated_at: string;
    }>);
    
  // Fetch payslips on mount
  useEffect(() => {
    const fetchPayslips = async () => {
      setIsLoading(true);
      try {
        const response = await authAxios.get(`${base_url}/payslip/`);
        setPayslips(response.data);
        setError(null);
      } catch (err: any) {
        setError('Failed to fetch payslips');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayslips();
  }, []);

  // Download PDF
  const downloadPayslipsPdf = async (payrollPeriodId: string) => {
    try {
      const response = await authAxios.get(`/payslip/download-pdf/${payrollPeriodId}/`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslips_${payrollPeriodId}.pdf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error: any) {
      let errorMessage = "Download failed";

      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        errorMessage = text || error.message || errorMessage;
      } else {
        errorMessage = error.message || errorMessage;
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Main Table Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800">
          Payroll Releases
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            // Skeleton Loader
            [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse mb-4">
                <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))
          ) : Object.keys(groupedPayslips).length === 0 ? (
            <div className="py-8 text-center text-gray-500">No payroll releases found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payroll Period</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Generated On</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(groupedPayslips).map(([key, group]) => (
                    <tr key={key} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {new Date(group.period.start_date).toLocaleDateString()} - {new Date(group.period.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {new Date(group.generated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        ${group.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => setSelectedPayslipGroup(group)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => downloadPayslipsPdf(group.period.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Group Details */}
      {selectedPayslipGroup && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800 flex justify-between items-center">
            <span>
              Payslips for{" "}
              {new Date(selectedPayslipGroup.period.start_date).toLocaleDateString()} -{" "}
              {new Date(selectedPayslipGroup.period.end_date).toLocaleDateString()}
            </span>
            <button
              onClick={() => {
                setSelectedPayslipGroup(null);
                setSelectedPayslip(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Working Hours</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gross Pay</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Net Pay</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedPayslipGroup.payslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {payslip.user.first_name} {payslip.user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {payslip.total_working_hours} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      ${(payslip.gross_pay).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      ${(payslip.gross_pay - payslip.deductions).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => setSelectedPayslip(payslip)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
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

      {/* Modal - Full Payslip Details */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Payslip for {selectedPayslip.user.first_name} {selectedPayslip.user.last_name}
                </h3>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Basic Info</h4>
                <div>
                  <label className="block text-sm text-gray-500">Payroll Period</label>
                  <p className="text-lg font-medium">
                    {new Date(selectedPayslip.payroll_period.start_date).toLocaleDateString()} -{" "}
                    {new Date(selectedPayslip.payroll_period.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Generated On</label>
                  <p className="text-lg font-medium">{new Date(selectedPayslip.generated_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Working Hours</label>
                  <p className="text-lg font-medium">{selectedPayslip.total_working_hours} hours</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Overtime</label>
                  <p className="text-lg font-medium">{selectedPayslip.total_overtime_hours} hours</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Leave Hours</label>
                  <p className="text-lg font-medium">{selectedPayslip.total_leave_hours} hours</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Absences</label>
                  <p className="text-lg font-medium">{selectedPayslip.total_absences} days</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Earnings & Deductions</h4>
                <div>
                  <label className="block text-sm text-gray-500">Gross Pay</label>
                  <p className="text-lg font-medium text-green-600">${selectedPayslip.gross_pay.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Deductions</label>
                  <p className="text-lg font-medium text-red-600">${selectedPayslip.deductions.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Net Pay</label>
                  <p className="text-2xl font-bold text-blue-600">
                    ${(selectedPayslip.gross_pay - selectedPayslip.deductions).toLocaleString()}
                  </p>
                </div>

                <hr className="my-4 border-gray-200" />

                <h4 className="font-semibold text-gray-700">Government Contributions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">SSS (Employee)</label>
                    <p className="text-base font-medium">${selectedPayslip.sss_employee.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">PhilHealth (Employee)</label>
                    <p className="text-base font-medium">${selectedPayslip.philhealth_employee.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Pag-IBIG (Employee)</label>
                    <p className="text-base font-medium">${selectedPayslip.pagibig_employee.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">SSS (Employer)</label>
                    <p className="text-base font-medium">${selectedPayslip.sss_employer.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">PhilHealth (Employer)</label>
                    <p className="text-base font-medium">${selectedPayslip.philhealth_employer.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Pag-IBIG (Employer)</label>
                    <p className="text-base font-medium">${selectedPayslip.pagibig_employer.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
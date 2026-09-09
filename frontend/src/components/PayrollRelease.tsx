import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Eye, Download, X } from 'lucide-react';
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';
import { Modal } from '@/components/base/BaseModal'; // Import reusable modal

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
  total_holidays_worked: number;
  total_holiday_pay: number;
  total_overtime_pay: number;
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
      const response = await authAxios.get(`${base_url}/payslip/download-pdf/${payrollPeriodId}/`, {
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
    <div className="p-4 space-y-6 md:p-6">
      {/* Main Table Card */}
      <div className="border border-gray-200 shadow-md bg-white/80 backdrop-blur-sm rounded-xl">
        <div className="px-6 py-4 text-lg font-semibold text-gray-800 border-b border-gray-200">
          Payroll Releases
        </div>
        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
              {error}
            </div>
          )}

          {isLoading ? (
            // Skeleton Loader
            [...Array(4)].map((_, i) => (
              <div key={i} className="mb-4 animate-pulse">
                <div className="w-full h-6 mb-4 bg-gray-200 rounded"></div>
                <div className="flex justify-between">
                  <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
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
                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">Payroll Period</th>
                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">Generated On</th>
                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">Total Amount</th>
                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-right text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(groupedPayslips).map(([key, group]) => (
                    <tr key={key} className="transition-colors duration-150 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {new Date(group.period.start_date).toLocaleDateString()} - {new Date(group.period.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {new Date(group.generated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        ₱{group.totalAmount.toLocaleString()}
                      </td>
                      <td className="flex justify-end px-6 py-4 space-x-2 text-sm text-right whitespace-nowrap">
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
        <div className="overflow-hidden border border-gray-200 shadow-md bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex items-center justify-between px-6 py-4 text-lg font-semibold text-gray-800 border-b border-gray-200">
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
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">Employee</th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">Working Hours</th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">Gross Pay</th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">Net Pay</th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-right text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedPayslipGroup.payslips.map((payslip) => (
                  <tr key={payslip.id} className="transition-colors duration-150 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                      {payslip.user.first_name} {payslip.user.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                      {payslip.total_working_hours} hrs
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                      ₱{(payslip.gross_pay).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                      ₱{(payslip.gross_pay - payslip.deductions).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
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
        <Modal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title={`Payslip - ${selectedPayslip.user.first_name} ${selectedPayslip.user.last_name}`}
          className="max-w-3xl w-full"
        >
          {/* Period Info */}
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-medium">Payroll Period:</span>{" "}
            {new Date(selectedPayslip.payroll_period.start_date).toLocaleDateString()} -{" "}
            {new Date(selectedPayslip.payroll_period.end_date).toLocaleDateString()}
            <br />
            <span className="font-medium">Generated On:</span>{" "}
            {new Date(selectedPayslip.generated_at).toLocaleDateString()}
          </div>

          {/* Net Pay Card */}
          <div className="p-6 mb-6 text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Net Pay</h4>
            <p className="text-3xl font-bold text-green-600">
              ₱{(selectedPayslip.gross_pay - selectedPayslip.deductions).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Earnings Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Base Salary</p>
              <p className="text-xl font-bold text-green-700">
                ₱{selectedPayslip.gross_pay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Overtime ({selectedPayslip.total_overtime_hours} hours)</p>
              <p className="text-xl font-bold">
                ₱{selectedPayslip.total_overtime_pay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Holiday Pay ({selectedPayslip.total_holidays_worked} holiday{selectedPayslip.total_holidays_worked !== 1 ? "s" : ""})</p>
              <p className="text-xl font-bold">
                ₱{selectedPayslip.total_holiday_pay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Gross Total</p>
              <p className="text-xl font-bold text-gray-800">
                ₱{(selectedPayslip.gross_pay + selectedPayslip.total_overtime_pay + selectedPayslip.total_holiday_pay).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Working Hours Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{selectedPayslip.total_working_hours}</p>
              <p className="text-xs text-gray-500">Regular Hours</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{selectedPayslip.total_overtime_hours}</p>
              <p className="text-xs text-gray-500">Overtime</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{selectedPayslip.total_leave_hours}</p>
              <p className="text-xs text-gray-500">Leave Hours</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{selectedPayslip.total_absences}</p>
              <p className="text-xs text-gray-500">Absences</p>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-700">Deductions</h4>
            <div className="flex justify-between p-3 bg-red-50 rounded-lg">
              <span>Total Deductions</span>
              <span className="font-bold text-red-700">
                ₱{selectedPayslip.deductions.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                <span>SSS (Employee)</span>
                <span>
                  ₱{selectedPayslip.sss_employee.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                <span>PhilHealth (Employee)</span>
                <span>
                  ₱{selectedPayslip.philhealth_employee.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                <span>Pag-IBIG (Employee)</span>
                <span>
                  ₱{selectedPayslip.pagibig_employee.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Employer Contributions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Employer Contributions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-bold">
                  ₱{selectedPayslip.sss_employer.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-600">SSS</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-bold">
                  ₱{selectedPayslip.philhealth_employer.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-600">PhilHealth</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-bold">
                  ₱{selectedPayslip.pagibig_employer.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-600">Pag-IBIG</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
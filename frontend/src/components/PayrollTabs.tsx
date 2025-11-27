import { useState } from 'react';
import { Users, Calendar } from 'lucide-react';
import PayrollPeriod from "@/components/PayrollPeriod";
import UserSalary from "@/components/UserSalary";
import PayrollRelease from '@/components/PayrollRelease';
import DashboardLayout from "@/layouts/DashboardLayout";
import BenefitsConfig from '@/components/BenefitsConfig';
import SetHoliday from '@/components/SetHoliday';
import { Button } from "./ui/button";

export default function PayrollTabs() {
  const [activeTab, setActiveTab] = useState<'salary' | 'period' | 'release' | 'setHoliday'>('salary');
  const [showBenefits, setShowBenefits] = useState(false);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Payroll Management</h1>
            <Button
              variant="outline"
              onClick={() => setShowBenefits(!showBenefits)}
              className="border bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Users className="w-5 h-5" />
              Benefits
            </Button>
          </div>

          {/* Slide-out Benefits Panel */}
          <div
            className={`fixed right-0 top-0 h-full w-80 z-20 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out ${
              showBenefits ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <BenefitsConfig onClose={() => setShowBenefits(false)} />
          </div>

          {/* Tabs */}
          <nav className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-4 flex space-x-2 overflow-x-auto">
            <Button
              variant="outline"
              onClick={() => setActiveTab('salary')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'salary'
                  ? 'border bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              User Salary
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('period')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'period'
                  ? 'border bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Payroll Period
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('release')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'release'
                  ? 'border bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Payroll Release
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('setHoliday')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'setHoliday'
                  ? 'border bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Holiday Config
            </Button>
          </nav>

          {/* Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6 mt-6">
            {activeTab === 'salary' && <UserSalary />}
            {activeTab === 'period' && <PayrollPeriod />}
            {activeTab === 'release' && <PayrollRelease />}
            {activeTab === 'setHoliday' && <SetHoliday />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
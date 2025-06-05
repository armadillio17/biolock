import { useState } from 'react';
import { Users, Calendar } from 'lucide-react'
import PayrollPeriod from "@/components/PayrollPeriod";
import UserSalary from "@/components/UserSalary";
import PayrollRelease from '@/components/PayrollRelease';
import DashboardLayout from "@/layouts/DashboardLayout"
import BenefitsConfig from '@/components/BenefitsConfig'
import SetHoliday from '@/components/SetHoliday'

export default function PayrollTabs() {
  const [activeTab, setActiveTab] = useState<'salary' | 'period' | 'release' | 'setHoliday'>('salary');
  const [showBenefits, setShowBenefits] = useState(false);

  return (
    <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
                <button
                    onClick={() => setShowBenefits(!showBenefits)}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Benefits
                </button>
                </div>
            
            {/* Benefits Configuration Slide-out */}
            <div className={`fixed right-0 top-0 h-full w-80 z-20 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${showBenefits ? 'translate-x-0' : 'translate-x-full'}`}>
                <BenefitsConfig onClose={() => setShowBenefits(false)} />
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
                <button
                    onClick={() => setActiveTab('salary')}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'salary'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Users className="w-5 h-5 mr-2" />
                    User Salary
                </button>
                <button
                    onClick={() => setActiveTab('period')}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'period'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Calendar className="w-5 h-5 mr-2" />
                    Payroll Period
                </button>
                <button
                    onClick={() => setActiveTab('release')}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'release'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Users className="w-5 h-5 mr-2" />
                    Payroll Release
                </button>
                <button
                    onClick={() => setActiveTab('setHoliday')}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'setHoliday'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Calendar className="w-5 h-5 mr-2" />
                    Holiday Config
                </button>
            </div>

            {/* Content */}
            {activeTab === 'salary' && <UserSalary />}
            {activeTab === 'period' && <PayrollPeriod />}
            {activeTab === 'release' && <PayrollRelease />}
            {activeTab === 'setHoliday' && <SetHoliday />}
        </div>
        </div>
    </DashboardLayout>
  )
}
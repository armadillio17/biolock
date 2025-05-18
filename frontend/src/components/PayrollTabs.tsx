import { useState } from 'react';
import PayrollPeriod from "@/components/PayrollPeriod";
import UserSalary from "@/components/UserSalary";
import PayrollRelease from '@/components/PayrollRelease';
import { Users, Calendar } from 'lucide-react'
import DashboardLayout from "@/layouts/DashboardLayout"

export default function PayrollTabs() {
  const [activeTab, setActiveTab] = useState<'salary' | 'period' | 'release'>('salary') 

  return (
    <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Payroll Management</h1>
            
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
                <button
                    onClick={() => setActiveTab('salary')}
                    className={`flex items-center px-4 py-2 rounded-md ${
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
                    className={`flex items-center px-4 py-2 rounded-md ${
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
                    className={`flex items-center px-4 py-2 rounded-md ${
                    activeTab === 'release'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Users className="w-5 h-5 mr-2" />
                    Payroll Release
                </button>
            </div>

            {/* Content */}
            {activeTab === 'salary' && <UserSalary />}
            {activeTab === 'period' && <PayrollPeriod />}
            {activeTab === 'release' && <PayrollRelease />}
        </div>
        </div>
    </DashboardLayout>
  )
}
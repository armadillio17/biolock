import { X, Settings } from 'lucide-react'
import { useState, useEffect } from 'react';
import { Button } from "./ui/button"
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';

interface BenefitConfig {
  employee_percentage: number
  employer_percentage: number
}

interface BenefitsConfigProps {
  onClose: () => void
}

export default function BenefitsConfig({ onClose }: BenefitsConfigProps) {
  const [activeTab, setActiveTab] = useState<'philhealth' | 'sss' | 'pagibig'>('philhealth')
  const [showSettings, setShowSettings] = useState(false)
  const [configs, setConfigs] = useState({
    philhealth: { employee_percentage: 0, employer_percentage: 0 },
    sss: { employee_percentage: 0, employer_percentage: 0 },
    pagibig: { employee_percentage: 0, employer_percentage: 0 }
  })
  const [tempConfig, setTempConfig] = useState<BenefitConfig>({ employee_percentage: 0, employer_percentage: 0 })
  const [errors, setErrors] = useState({ employee: false, employer: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await authAxios.get(`${base_url}/benefits-configuration/`)
        const data = response.data.reduce((acc: any, curr: any) => {
          acc[curr.benefit_type] = {
            employee_percentage: curr.employee_percentage,
            employer_percentage: curr.employer_percentage
          }
          return acc
        }, {})

        setConfigs({
          philhealth: data.philhealth || { employee_percentage: 0, employer_percentage: 0 },
          sss: data.sss || { employee_percentage: 0, employer_percentage: 0 },
          pagibig: data.pagibig || { employee_percentage: 0, employer_percentage: 0 }
        })
      } catch (error) {
        console.error("Failed to load benefits configuration")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfigs()
  }, [])

  const validatePercentage = (value: number) => {
    return value >= 0 && value <= 100
  }

  const handleApply = async () => {
    const validEmployee = validatePercentage(tempConfig.employee_percentage)
    const validEmployer = validatePercentage(tempConfig.employer_percentage)

    setErrors({
      employee: !validEmployee,
      employer: !validEmployer
    })

    if (validEmployee && validEmployer) {
      try {
        console.log("Updating configuration for:", activeTab)
        await authAxios.put(`${base_url}/benefits-configuration/${activeTab}/`, {
          employee_percentage: tempConfig.employee_percentage,
          employer_percentage: tempConfig.employer_percentage
        })

        // PATCH successful
        setConfigs({ ...configs, [activeTab]: { ...tempConfig } })
        setShowSettings(false)

      } catch (error: any) {
        if (error.response?.status === 404) {
          // If not found, create it
          try {
            await authAxios.post(`${base_url}/benefits-configuration/`, {
              benefit_type: activeTab,
              employee_percentage: tempConfig.employee_percentage,
              employer_percentage: tempConfig.employer_percentage
            })

            setConfigs({ ...configs, [activeTab]: { ...tempConfig } })
            setShowSettings(false)

          } catch (createError) {
            console.error("Failed to create configuration", createError)
          }
        } else {
          console.error("Failed to update configuration", error)
        }
      }
    }
  }

  const openSettings = (tab: 'philhealth' | 'sss' | 'pagibig') => {
    setActiveTab(tab)
    setTempConfig({ ...configs[tab] })
    setShowSettings(true)
    setErrors({ employee: false, employer: false })
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Benefits Configuration</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Benefits Configuration</h2>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {['philhealth', 'sss', 'pagibig'].map((benefit) => (
            <div
              key={benefit}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="capitalize font-medium">{benefit}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Emp: {configs[benefit as keyof typeof configs].employee_percentage}% / 
                  Er: {configs[benefit as keyof typeof configs].employer_percentage}%
                </span>
                <Button
                  onClick={() => openSettings(benefit as 'philhealth' | 'sss' | 'pagibig')}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSettings && (
        <div className="absolute inset-0 bg-white p-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold capitalize">{activeTab} Settings</h3>
            <Button
              onClick={() => setShowSettings(false)}
              variant="ghost"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Contribution (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={tempConfig.employee_percentage}
                  onChange={(e) => setTempConfig({ 
                    ...tempConfig, 
                    employee_percentage: parseFloat(e.target.value)
                  })}
                  className={`w-full rounded-md border ${errors.employee ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                />
                {errors.employee && (
                  <p className="text-red-500 text-sm mt-1">Must be between 0-100</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Contribution (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={tempConfig.employer_percentage}
                  onChange={(e) => setTempConfig({ 
                    ...tempConfig, 
                    employer_percentage: parseFloat(e.target.value)
                  })}
                  className={`w-full rounded-md border ${errors.employer ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                />
                {errors.employer && (
                  <p className="text-red-500 text-sm mt-1">Must be between 0-100</p>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleApply}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            Apply Changes
          </Button>
        </div>
      )}
    </div>
  )
}
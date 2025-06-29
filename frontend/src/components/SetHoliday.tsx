import React, { useState, useEffect } from 'react';
import { base_url } from '../config';
import { authAxios } from "@/lib/secured-axios-instance";
import { Button } from "./ui/button";
import { CheckCircle, Trash2, Settings } from "lucide-react";
import CustomHolidaySettings from '@/components/CustomHoliday';

interface HolidayOption {
  id: number;
  holiday_name: string;
  date: string;
}

interface HolidayConfigResponse {
  id: number;
  holiday: number;
  type: HolidayType;
  pay_percentage: number;
  holiday_name: string;
  holiday_date: string;
  custom_holiday_name?: string;
  custom_holiday_date?: string;
}

type HolidayType = 'regular' | 'special' | 'non-holiday';

export default function HolidayConfig() {
  const [availableHolidays, setAvailableHolidays] = useState<HolidayOption[]>([]);
  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<HolidayType>('regular');
  const [percentage, setPercentage] = useState<number>(0);
  const [savedConfigs, setSavedConfigs] = useState<HolidayConfigResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false)

const closeSettings = () => {
  setShowSettings(false);
};

  
  // Load all available holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await authAxios.get(`${base_url}/holidays/`);
        setAvailableHolidays(response.data);
      } catch (error) {
        console.error("Failed to load holidays", error);
        setError('Failed to load holidays. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  // Load existing configurations
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await authAxios.get(`${base_url}/holiday-configs/`);
        setSavedConfigs(response.data);
      } catch (error) {
        console.error("Failed to fetch saved configs", error);
      }
    };

    fetchConfigs();
  }, []);

  // Toggle selected holidays
  const handleHolidayToggle = (name: string) => {
    setSelectedHolidays((prev) =>
      prev.includes(name)
        ? prev.filter((h) => h !== name)
        : [...prev, name]
    );
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHolidays.length || !percentage) {
      alert("Please select at least one holiday and enter a percentage.");
      return;
    }

    const payload = selectedHolidays.map((name) => {
      const holiday = availableHolidays.find((h) => h.holiday_name === name);
      if (!holiday) return null;

      return {
        holiday: holiday.id,
        type: selectedType,
        pay_percentage: Number(percentage),
      };
    }).filter(Boolean) as { holiday: number; type: HolidayType; pay_percentage: number }[];

    try {
      await authAxios.post(`${base_url}/holiday-configs/`, payload);
      alert("Holiday configurations saved successfully!");
      setSelectedHolidays([]);
      const response = await authAxios.get(`${base_url}/holiday-configs/`);
      setSavedConfigs(response.data);
    } catch (error) {
      console.error("Error saving holiday config", error);
      alert("Failed to save holiday configuration.");
    }
  };

  // Delete a holiday config
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) return;

    try {
      await authAxios.delete(`${base_url}/holiday-configs/${id}/`);
      setSavedConfigs(savedConfigs.filter(config => config.id !== id));
      alert("Configuration deleted successfully");
    } catch (error) {
      console.error("Failed to delete holiday config", error);
      alert("Failed to delete configuration");
    }
  };

  // Filter configs by type
  const filterConfigsByType = (type: HolidayType): HolidayConfigResponse[] => {
    return savedConfigs.filter(config => config.type === type);
  };

  // Table Component
  const HolidayTable: React.FC<{ type: HolidayType; items: HolidayConfigResponse[] }> = ({ type, items }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800 capitalize">
        {type} Holidays
      </div>
      <div className="p-6 overflow-x-auto">
        {items.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Holiday</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pay Rate (%)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.holiday_name || item.custom_holiday_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.holiday_date || item.custom_holiday_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.pay_percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-6 text-center text-gray-500 italic">
            No {type} holidays configured
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
      {/* Add New Holiday Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Configure Holidays</h2>
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="flex items-center text-white px-3 py-2 rounded-md border bg-gradient-to-r from-blue-500 to-teal-500"
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Select Holidays */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Holidays</label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
              {isLoading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center gap-2 animate-pulse">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))
              ) : availableHolidays.length > 0 ? (
                availableHolidays.map((holiday) => (
                  <label key={holiday.id} className="flex items-center gap-2 mb-2 last:mb-0">
                    <input
                      type="checkbox"
                      checked={selectedHolidays.includes(holiday.holiday_name)}
                      onChange={() => handleHolidayToggle(holiday.holiday_name)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{holiday.holiday_name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No holidays found.</p>
              )}
            </div>
          </div>

          {/* Holiday Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Type</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as HolidayType)}
              required
            >
              <option value="regular">Regular Holiday</option>
              <option value="special">Special Holiday</option>
              <option value="non-holiday">Non-Holiday</option>
            </select>
          </div>

          {/* Pay Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay Percentage (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="200"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                required
              />
              <span className="absolute right-3 top-2 text-gray-400">%</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="outline"
            disabled={selectedHolidays.length === 0 || isLoading}
            className="w-full border bg-gradient-to-r from-blue-500 to-teal-500 text-white flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Holiday Configuration"}
          </Button>
        </form>
      </div>

      {/* CustomHolidaySettings component */}

      <CustomHolidaySettings
        showSettings={showSettings}
        onClose={closeSettings}
      />

      <HolidayTable type="regular" items={filterConfigsByType('regular')} />
      <HolidayTable type="special" items={filterConfigsByType('special')} />
      <HolidayTable type="non-holiday" items={filterConfigsByType('non-holiday')} />
    </div>
    </>
    
  );
}
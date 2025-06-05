import React, { useState, useEffect } from 'react';
import { base_url } from '../config';
import { authAxios } from "@/lib/secured-axios-instance";
import { Button } from "./ui/button";

interface HolidayOption {
  id: number;
  holiday_name: string;
  date: string;
}

interface HolidayConfigItem {
  holiday: number;
  type: HolidayType;
  pay_percentage: number;
}

interface HolidayConfigResponse extends HolidayConfigItem {
  id: number;
  holiday_name: string;
}

type HolidayType = 'regular' | 'special' | 'non-holiday';

export default function HolidayConfig() {
  const [availableHolidays, setAvailableHolidays] = useState<HolidayOption[]>([]);
  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<HolidayType>('regular');
  const [percentage, setPercentage] = useState<number>(0);
  const [savedConfigs, setSavedConfigs] = useState<HolidayConfigResponse[]>([]);

  // Load all available holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await authAxios.get(`${base_url}/holidays/`);
        setAvailableHolidays(response.data);
      } catch (error) {
        console.error("Failed to load holidays", error);
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
    }).filter(Boolean) as HolidayConfigItem[];

    try {
      await authAxios.post(`${base_url}/holiday-configs/`, payload);
      alert("Holiday configurations saved successfully!");
      setSelectedHolidays([]);
      // Optionally refresh list
      const response = await authAxios.get(`${base_url}/holiday-configs/`);
      setSavedConfigs(response.data);
    } catch (error) {
      console.error("Error saving holiday config", error);
      alert("Failed to save holiday configuration.");
    }
  };

  // Filter configs by type
  const filterConfigsByType = (type: HolidayType): HolidayConfigResponse[] => {
    return savedConfigs.filter(config => config.type === type);
  };

  // Table Component
  const HolidayTable: React.FC<{ type: HolidayType; items: HolidayConfigResponse[] }> = ({ type, items }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{type} Holidays</h3>
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holiday</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.holiday_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.pay_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No {type} holidays configured</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Holiday Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Holidays
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {availableHolidays.map((holiday) => (
                <label key={holiday.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedHolidays.includes(holiday.holiday_name)}
                    onChange={() => handleHolidayToggle(holiday.holiday_name)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{holiday.holiday_name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holiday Type
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as HolidayType)}
              required
            >
              <option value="regular">Regular Holiday</option>
              <option value="special">Special Holiday</option>
              <option value="non-holiday">Non-Holiday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Percentage (%)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="200"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                required
              />
              <span className="text-gray-500">%</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={selectedHolidays.length === 0}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add Selected Holidays
          </Button>
        </form>
      </div>

      <HolidayTable type="regular" items={filterConfigsByType('regular')} />
      <HolidayTable type="special" items={filterConfigsByType('special')} />
      <HolidayTable type="non-holiday" items={filterConfigsByType('non-holiday')} />
    </div>
  );
}
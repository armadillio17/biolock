import React, { useState } from 'react';
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';
import { Button } from "./ui/button";
import { Modal } from '@/components/base/BaseModal'; // Import reusable modal

type HolidayType = 'regular' | 'special' | 'non-holiday';

interface CustomHoliday {
  id: number;
  custom_holiday_name: string;
  custom_holiday_date: string;
}

interface CustomHolidaySettingsProps {
  showSettings: boolean;
  onClose: () => void;
}

export default function CustomHolidaySettings({
  showSettings,
  onClose,
}: CustomHolidaySettingsProps) {
  const [customHoliday, setCustomHoliday] = useState({
    name: '',
    date: '',
    type: 'regular' as HolidayType,
    percentage: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Step 1: Create CustomHoliday
      const holidayRes = await authAxios.post(
        `${base_url}/custom-holidays/`,
        {
          custom_holiday_name: customHoliday.name,
          custom_holiday_date: customHoliday.date,
        }
      );

      const savedHoliday: CustomHoliday = holidayRes.data;

      // Step 2: Create HolidayConfig
      await authAxios.post(`${base_url}/holiday-configs/`, {
        custom_holiday: savedHoliday.id,
        type: customHoliday.type,
        pay_percentage: customHoliday.percentage,
      });

      // Reset form and close modal
      setCustomHoliday({ name: '', date: '', type: 'regular', percentage: 0 });
      onClose();
    } catch (error) {
      console.error('Error saving holiday:', error);
      alert('Failed to save holiday. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={showSettings}
      onClose={onClose}
      title="Add Custom Holiday"
      className="bg-white rounded-lg shadow-md p-6 max-w-md w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Holiday Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Holiday Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={customHoliday.name}
            onChange={(e) =>
              setCustomHoliday({ ...customHoliday, name: e.target.value })
            }
            placeholder="Enter holiday name"
            required
          />
        </div>

        {/* Holiday Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Holiday Date
          </label>
          <input
            id="date"
            type="date"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={customHoliday.date}
            onChange={(e) =>
              setCustomHoliday({ ...customHoliday, date: e.target.value })
            }
            required
          />
        </div>

        {/* Holiday Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Holiday Type
          </label>
          <select
            id="type"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={customHoliday.type}
            onChange={(e) =>
              setCustomHoliday({
                ...customHoliday,
                type: e.target.value as HolidayType,
              })
            }
            required
          >
            <option value="regular">Regular Holiday</option>
            <option value="special">Special Holiday</option>
            <option value="non-holiday">Non Holiday</option>
          </select>
        </div>

        {/* Percentage Rate */}
        <div>
          <label
            htmlFor="percentage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Percentage Rate
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="percentage"
              type="number"
              min="0"
              max="200"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={customHoliday.percentage}
              onChange={(e) =>
                setCustomHoliday({
                  ...customHoliday,
                  percentage: Number(e.target.value),
                })
              }
              placeholder="Enter percentage"
              required
            />
            <span className="text-gray-500">%</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
        >
          Add Holiday
        </Button>
      </form>
    </Modal>
  );
}
'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { CreateEntryPayload } from '@/lib/types/dashboard';

interface NewEntryFormProps {
  onSubmit: (data: CreateEntryPayload) => void;
  isLoading?: boolean;
}

export function NewEntryForm({ onSubmit, isLoading = false }: NewEntryFormProps) {
  const [formData, setFormData] = useState<CreateEntryPayload>({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    customMessage: 'Happy Birthday! Hope you have a fantastic day filled with joy and celebration...',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    if (!formData.customMessage.trim()) {
      newErrors.customMessage = 'Custom message is required';
    } else if (formData.customMessage.length < 10) {
      newErrors.customMessage = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.fullName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Date of Birth *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.dateOfBirth && (
          <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
        )}
      </div>

      {/* Custom Message */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Custom Message *
        </label>
        <textarea
          name="customMessage"
          value={formData.customMessage}
          onChange={handleChange}
          placeholder="Enter your custom birthday message..."
          rows={5}
          className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${
            errors.customMessage ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.customMessage && (
            <p className="text-sm text-red-600">{errors.customMessage}</p>
          )}
          <p className="text-xs text-gray-500 ml-auto">
            {formData.customMessage.length} characters
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save Record'
          )}
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { createEntryAction } from '@/app/dashboard/actions';
import { useToast } from '@/context/ToastContext';
import type { CreateEntryPayload } from '@/lib/types/dashboard';

interface NewEntryFormProps {
  onSuccess?: () => void;
}

export function NewEntryForm({ onSuccess }: NewEntryFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<CreateEntryPayload>({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    custom_message: 'Happy Birthday! Hope you have a fantastic day filled with joy and celebration...',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      if (dob > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    if (!formData.custom_message.trim()) {
      newErrors.custom_message = 'Custom message is required';
    } else if (formData.custom_message.length < 10) {
      newErrors.custom_message = 'Message must be at least 10 characters';
    } else {
      const wordCount = countWords(formData.custom_message);
      if (wordCount > 300) {
        newErrors.custom_message = `Message exceeds 300 words (currently ${wordCount} words)`;
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createEntryAction(formData);

      if (result.error) {
        showToast(result.error, 'error');
      } else if (result.data) {
        showToast('Record saved successfully!', 'success');
        // Reset form
        setFormData({
          full_name: '',
          phone_number: '',
          date_of_birth: '',
          custom_message: 'Happy Birthday! Hope you have a fantastic day filled with joy and celebration...',
        });
        // Call callback after success
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      }
    } catch (error) {
      showToast('An unexpected error occurred. Please try again.', 'error');
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
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
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="example"
          disabled={isLoading}
          className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 ${
            errors.full_name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Phone Number * (Must be globally unique)
        </label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          disabled={isLoading}
          className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 ${
            errors.phone_number ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.phone_number && (
          <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Date of Birth *
          <span className="text-xs text-gray-500 font-normal">(Format: DD/MM/YYYY)</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 ${
              errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.date_of_birth && (
          <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
        )}
      </div>

      {/* Custom Message */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Custom Message * (Max 300 words)
        </label>
        <textarea
          name="custom_message"
          value={formData.custom_message}
          onChange={handleChange}
          placeholder="Enter your custom birthday message..."
          rows={5}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none disabled:bg-gray-100 ${
            errors.custom_message ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.custom_message && (
            <p className="text-sm text-red-600">{errors.custom_message}</p>
          )}
          <p className={`text-xs ml-auto ${countWords(formData.custom_message) > 300 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            {countWords(formData.custom_message)} / 300 words
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

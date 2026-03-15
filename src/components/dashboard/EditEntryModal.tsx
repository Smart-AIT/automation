'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateEntryAction } from '@/app/dashboard/actions';
import type { RecipientEntry } from '@/lib/types/dashboard';

interface EditEntryModalProps {
  entry: RecipientEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEntryModal({ entry, isOpen, onClose, onSuccess }: EditEntryModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    custom_message: '',
  });

  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (entry && isOpen) {
      setFormData({
        full_name: entry.full_name,
        phone_number: entry.phone_number,
        date_of_birth: entry.date_of_birth,
        custom_message: entry.custom_message,
      });
      setWordCount(entry.custom_message.split(/\s+/).filter(word => word.length > 0).length);
      setErrors({});
      setMessage(null);
    }
  }, [entry, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'custom_message') {
      const count = value.split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(count);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.date_of_birth);
      if (dob > new Date()) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    if (wordCount > 300) {
      newErrors.custom_message = 'Message cannot exceed 300 words';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!entry) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateEntryAction({
        id: entry.id,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        custom_message: formData.custom_message,
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Entry updated successfully!' });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update entry. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-linear-to-br from-white/40 to-white/20 backdrop-blur-2xl max-w-md w-full mx-4 max-h-screen overflow-y-auto rounded-3xl shadow-2xl border-2 border-white/60" style={{
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 0 50px 0 rgba(59, 130, 246, 0.1)'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-white/30 sticky top-0 bg-white/10 backdrop-blur-lg rounded-t-3xl">
          <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Edit Entry</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/40 rounded-full transition duration-200"
            disabled={isLoading}
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 bg-linear-to-b from-white/20 to-white/10">
          {message && (
            <div
              className={`mb-4 p-4 rounded-2xl text-sm font-medium border-2 backdrop-blur ${
                message.type === 'success'
                  ? 'bg-green-100/40 text-green-900 border-green-300/60 shadow-md shadow-green-400/20'
                  : 'bg-red-100/40 text-red-900 border-red-300/60 shadow-md shadow-red-400/20'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Full Name */}
          <div className="mb-5">
            <label htmlFor="full_name" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-white/40 backdrop-blur text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/60 transition shadow-lg shadow-blue-400/10 ${
                errors.full_name ? 'border-red-400 focus:ring-red-400' : 'border-white/50 hover:border-white/70'
              }`}
              disabled={isLoading}
              placeholder="Enter full name"
            />
            {errors.full_name && <p className="mt-2 text-xs text-red-700 font-semibold">{errors.full_name}</p>}
          </div>

          {/* Phone Number */}
          <div className="mb-5">
            <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number *
            </label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-white/40 backdrop-blur text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/60 transition shadow-lg shadow-blue-400/10 ${
                errors.phone_number ? 'border-red-400 focus:ring-red-400' : 'border-white/50 hover:border-white/70'
              }`}
              disabled={isLoading}
              placeholder="Enter phone number"
            />
            {errors.phone_number && <p className="mt-2 text-xs text-red-700 font-semibold">{errors.phone_number}</p>}
          </div>

          {/* Date of Birth */}
          <div className="mb-5">
            <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-900 mb-2">
              Date of Birth (DD/MM/YYYY) *
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-white/40 backdrop-blur text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/60 transition shadow-lg shadow-blue-400/10 ${
                errors.date_of_birth ? 'border-red-400 focus:ring-red-400' : 'border-white/50 hover:border-white/70'
              }`}
              disabled={isLoading}
            />
            {errors.date_of_birth && <p className="mt-2 text-xs text-red-700 font-semibold">{errors.date_of_birth}</p>}
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <label htmlFor="custom_message" className="block text-sm font-semibold text-gray-900 mb-2">
              Custom Message
            </label>
            <textarea
              id="custom_message"
              name="custom_message"
              value={formData.custom_message}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-white/40 backdrop-blur text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/60 transition resize-none shadow-lg shadow-blue-400/10 ${
                errors.custom_message ? 'border-red-400 focus:ring-red-400' : 'border-white/50 hover:border-white/70'
              }`}
              disabled={isLoading}
              placeholder="Enter custom message"
            />
            <div className="flex justify-between items-center mt-3">
              <span className={`text-xs font-semibold ${wordCount > 300 ? 'text-red-700' : 'text-gray-700'}`}>
                {wordCount} / 300 words
              </span>
            </div>
            {errors.custom_message && <p className="mt-2 text-xs text-red-700 font-semibold">{errors.custom_message}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-white/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-white/50 rounded-xl text-sm font-semibold text-gray-900 hover:bg-white/20 hover:border-white/70 backdrop-blur transition shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 backdrop-blur text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl hover:shadow-blue-400/50 disabled:opacity-50 border-2 border-blue-400/50"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

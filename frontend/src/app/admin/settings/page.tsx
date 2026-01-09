'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Upload, X } from 'lucide-react';

export default function PaymentSettings() {
  const queryClient = useQueryClient();
  const [upiId, setUpiId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings/payment');
      const data = response.data.data;
      setUpiId(data.upiId || '');
      setPreviewUrl(data.qrCodeUrl || '');
      return data;
    },
  });

  const uploadQRMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('qrCode', file);
      const response = await api.post('/admin/settings/payment/upload-qr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setPreviewUrl(data.data.qrCodeUrl);
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to upload QR code');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { upiId: string }) => {
      const response = await api.put('/admin/settings/payment', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
      alert('Payment settings updated successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update settings');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG files are allowed');
        return;
      }
      setSelectedFile(file);
      uploadQRMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ upiId });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
        <p className="text-gray-600 mt-2">Configure global payment details for all events</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* UPI ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UPI ID
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="example@upi"
          />
          <p className="text-sm text-gray-500 mt-1">This UPI ID will be shown to users during payment</p>
        </div>

        {/* QR Code Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment QR Code
          </label>
          
          <div className="mt-2">
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload QR code</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {uploadQRMutation.isPending && (
            <div className="mt-2 text-sm text-blue-600">Uploading...</div>
          )}

          {/* QR Preview */}
          {previewUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Current QR Code:</p>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedFile(null);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img 
                src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${previewUrl}`}
                alt="Payment QR Code Preview"
                className="w-64 h-64 object-contain border-2 border-gray-300 rounded-lg mx-auto"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="256"%3E%3Crect fill="%23f0f0f0" width="256" height="256"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          )}
        </div>

        {/* Current Settings Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>These payment details will be shown to all users during event registration</li>
            <li>Users can scan the QR code or use the UPI ID to make payments</li>
            <li>Only admins can update these settings</li>
            <li>Changes take effect immediately</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setUpiId(settings?.upiId || '');
              setPreviewUrl(settings?.qrCodeUrl || '');
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const registrationSchema = z.object({
  utrNumber: z.string().min(12, 'UTR must be at least 12 characters'),
  teamName: z.string().optional(),
});

export default function ManualPaymentForm({ event }: { event: any }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; email: string; phone: string }>>([
    { name: '', email: '', phone: '' },
  ]);

  // Auto-populate first team member with logged-in user details for team events
  useEffect(() => {
    if (event.eventType === 'team' && user) {
      setTeamMembers([{
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }]);
    }
  }, [event.eventType, user]);

  // Fetch global payment settings
  const { data: paymentSettings } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      const response = await api.get('/settings/payment');
      return response.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registrationSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Only JPG and PNG files are allowed');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTeamMember = () => {
    if (teamMembers.length < event.maxTeamSize) {
      setTeamMembers([...teamMembers, { name: '', email: '', phone: '' }]);
    }
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const onSubmit = async (data: any) => {
    try {
      if (!selectedFile) {
        toast.error('Please upload payment screenshot');
        return;
      }

      // Validate team members for team events
      if (event.eventType === 'team') {
        const filledMembers = teamMembers.filter(m => m.name && m.email && m.phone);
        if (filledMembers.length < event.minTeamSize) {
          toast.error(`Team must have at least ${event.minTeamSize} members`);
          return;
        }
        if (filledMembers.length > event.maxTeamSize) {
          toast.error(`Team cannot exceed ${event.maxTeamSize} members`);
          return;
        }
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('eventId', event._id);
      formData.append('ticketType', 'General');
      formData.append('quantity', '1');
      formData.append('utrNumber', data.utrNumber);
      formData.append('paymentScreenshot', selectedFile);

      if (event.eventType === 'team') {
        formData.append('teamName', data.teamName);
        const validMembers = teamMembers.filter(m => m.name && m.email && m.phone);
        formData.append('teamMembers', JSON.stringify(validMembers));
      }

      const response = await api.post('/registrations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Registration submitted! Payment verification pending.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Bank Details Display */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg">
        <h3 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Payment Details
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {paymentSettings?.upiId && (
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">UPI ID:</p>
                <p className="font-mono text-lg font-bold text-blue-900">{paymentSettings.upiId}</p>
                <p className="text-xs text-gray-500 mt-1">Use any UPI app to pay</p>
              </div>
            )}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Amount to Pay:</p>
              <p className="text-3xl font-bold text-green-600">₹{event.registrationFee}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                ⚠️ After payment, save the UTR number and upload screenshot below
              </p>
            </div>
          </div>
          <div>
            {paymentSettings?.qrCodeUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Scan QR Code to Pay:</p>
                <img
                  src={
                    paymentSettings.qrCodeUrl.startsWith('http')
                      ? paymentSettings.qrCodeUrl
                      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${paymentSettings.qrCodeUrl}`
                  }
                  alt="Payment QR Code"
                  className="w-64 h-64 object-contain bg-white border-4 border-blue-300 rounded-xl shadow-lg mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"256\" height=\"256\"%3E%3Crect fill=\"%23f0f0f0\" width=\"256\" height=\"256\"/%3E%3Ctext fill=\"%23999\" x=\"50%25\" y=\"50%25\" text-anchor=\"middle\" dy=\".3em\" font-size=\"14\"%3EQR Code Not Available%3C/text%3E%3C/svg%3E';
                  }}
                />
                <p className="text-xs text-center text-gray-500">Open any UPI app to scan</p>
              </div>
            ) : paymentSettings?.upiId ? (
              <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-blue-300 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <div className="text-center px-4">
                  <svg className="w-16 h-16 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-blue-900 font-semibold">Use UPI ID</p>
                  <p className="text-xs text-blue-600 mt-1">Pay via any UPI app</p>
                </div>
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 border-4 border-gray-300 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-gray-400 text-sm text-center px-4">
                  Contact organizer<br />for payment details
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Event Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Type: {event.eventType === 'team' ? 'Team Event' : 'Solo Event'}</span>
            <span>Fee: ₹{event.registrationFee}</span>
            {event.eventType === 'team' && (
              <span>Team Size: {event.minTeamSize}-{event.maxTeamSize} members</span>
            )}
          </div>
        </div>

        {/* Team Name (for team events) */}
        {event.eventType === 'team' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('teamName', { required: event.eventType === 'team' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your team name"
            />
            {errors.teamName && (
              <p className="text-red-500 text-sm mt-1">{String(errors.teamName.message)}</p>
            )}
          </div>
        )}

        {/* Team Members (for team events) */}
        {event.eventType === 'team' && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Team Members</h3>
              <button
                type="button"
                onClick={addTeamMember}
                disabled={teamMembers.length >= event.maxTeamSize}
                className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className={`p-4 rounded-lg relative ${index === 0 ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">{index === 0 ? '👑 Team Leader' : `Member ${index + 1}`}</span>
                    {teamMembers.length > 1 && index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      placeholder="Full Name"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                      placeholder="Phone (10 digits)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Required: {event.minTeamSize}-{event.maxTeamSize} members
            </p>
          </div>
        )}

        {/* UTR Number */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Payment Proof</h3>
          <div>
            <label className="block text-sm font-medium mb-2">
              UTR/Transaction Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('utrNumber')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter 12-digit UTR number from payment confirmation"
            />
            {errors.utrNumber && (
              <p className="text-red-500 text-sm mt-1">{String(errors.utrNumber.message)}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Find this in your payment confirmation SMS or UPI app transaction history
            </p>
          </div>
        </div>

        {/* Payment Screenshot */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Payment Screenshot <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-primary-600 hover:text-primary-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="border-t pt-6">
          <button
            type="submit"
            disabled={isSubmitting || uploading || !selectedFile}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || uploading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>

      {/* Important Note */}
      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <h4 className="font-semibold text-yellow-900 mb-2">Important Instructions:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Make payment to the above bank account/UPI ID</li>
          <li>Save the UTR/Transaction Reference Number</li>
          <li>Upload a clear screenshot of payment confirmation</li>
          <li>Your registration will be verified by admin within 24-48 hours</li>
          <li>You will receive an email notification once verified</li>
          <li>QR code will be generated after successful verification</li>
        </ul>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Calendar, MapPin, Users, IndianRupee, ArrowLeft, Sparkles, Shield, LogOut, Home } from 'lucide-react';
import AdminMobileMenu from '@/components/AdminMobileMenu';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  eventType: z.enum(['solo', 'team']),
  minTeamSize: z.number().min(1).optional(),
  maxTeamSize: z.number().min(1).optional(),
  registrationFee: z.number().min(0, 'Fee must be a positive number'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  venue: z.string().min(3, 'Venue is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  rules: z.string().optional(),
  prizes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const eventId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Fetch event data
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}`);
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const eventType = watch('eventType');

  // Reset form when event data loads
  useEffect(() => {
    if (eventData) {
      reset({
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        eventType: eventData.eventType,
        minTeamSize: eventData.minTeamSize,
        maxTeamSize: eventData.maxTeamSize,
        registrationFee: eventData.registrationFee || 0,
        startDate: eventData.startDate?.split('T')[0],
        endDate: eventData.endDate?.split('T')[0],
        venue: eventData.location?.venue || '',
        address: eventData.location?.address || '',
        city: eventData.location?.city || '',
        capacity: eventData.capacity,
        rules: eventData.rules || '',
        prizes: eventData.prizes || '',
      });
    }
  }, [eventData, reset]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const payload = {
        ...data,
        location: {
          venue: data.venue,
          address: data.address,
          city: data.city,
        },
        ticketTypes: [{
          name: 'General',
          price: data.registrationFee,
          quantity: data.capacity,
          available: data.capacity - (eventData?.registeredCount || 0),
        }],
      };
      const response = await api.put(`/events/${eventId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Event updated successfully!');
      router.push('/admin/events');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update event');
    },
  });

  const onSubmit = (data: EventFormData) => {
    updateEventMutation.mutate(data);
  };

  if (!isAuthenticated() || user?.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-600" />
            EventHub Admin
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Payments
            </Link>
            <Link href="/admin/events" className="text-purple-600 font-semibold">
              Events
            </Link>
            <Link href="/admin/users" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Users
            </Link>
            <Link href="/admin/registrations" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Registrations
            </Link>
            <Link href="/admin/analytics" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Analytics
            </Link>
            <Link href="/admin/logs" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Logs
            </Link>
            <Link href="/admin/scanner" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Scanner
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <AdminMobileMenu currentPath="/admin/events" onLogout={handleLogout} />
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to events
        </Link>

        {/* Welcome Banner */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-10 h-10" />
              Edit Event
            </h1>
            <p className="text-white/90 text-lg">Update event details ✏️</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Tech Hackathon 2026"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Describe your event..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select category</option>
                    <option value="technical">Technical</option>
                    <option value="cultural">Cultural</option>
                    <option value="competition">Competition</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
                    <option value="sports">Sports</option>
                    <option value="gaming">Gaming/E-Sports</option>
                    <option value="debate">Debate</option>
                    <option value="quiz">Quiz</option>
                    <option value="dance">Dance</option>
                    <option value="art-design">Art & Design</option>
                    <option value="festival">Festival</option>
                    <option value="concert">Concert</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="meetup">Meetup</option>
                    <option value="networking">Networking</option>
                    <option value="training">Training</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('eventType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="solo">Solo Event</option>
                    <option value="team">Team Event</option>
                  </select>
                </div>
              </div>

              {eventType === 'team' && (
                <div className="grid md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Min Team Size <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('minTeamSize', { valueAsNumber: true })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.minTeamSize && (
                      <p className="text-red-500 text-sm mt-1">{errors.minTeamSize.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Team Size <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('maxTeamSize', { valueAsNumber: true })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.maxTeamSize && (
                      <p className="text-red-500 text-sm mt-1">{errors.maxTeamSize.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date & Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Date & Location</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('venue')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Main Auditorium"
                />
                {errors.venue && (
                  <p className="text-red-500 text-sm mt-1">{errors.venue.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    {...register('city')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="City name"
                  />
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Registration Details</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Registration Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('registrationFee', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="0 for free event"
                  />
                  {errors.registrationFee && (
                    <p className="text-red-500 text-sm mt-1">{errors.registrationFee.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Maximum participants"
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Additional Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rules & Guidelines</label>
                <textarea
                  {...register('rules')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Event rules and participation guidelines..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prizes & Rewards</label>
                <textarea
                  {...register('prizes')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="List prizes, certificates, or other rewards..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updateEventMutation.isPending}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateEventMutation.isPending ? 'Updating Event...' : 'Update Event'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/events')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Calendar, MapPin, Users, IndianRupee, ArrowLeft, Sparkles, Shield, LogOut, Menu } from 'lucide-react';
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
  upiId: z.string().optional(),
  qrCodeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventType: 'solo',
      minTeamSize: 1,
      maxTeamSize: 1,
      registrationFee: 0,
      capacity: 100,
    },
  });

  const eventType = watch('eventType');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    if (!isAuthenticated() || (user?.role !== 'admin' && user?.role !== 'coordinator')) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const createEventMutation = useMutation({
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
          available: data.capacity,
        }],
        status: 'published',
      };
      const response = await api.post('/events', payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Event created successfully!');
      router.push(`/events/${data.data._id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
    },
  });

  const onSubmit = (data: EventFormData) => {
    // Convert local datetime-local string to ISO using browser Date (preserves entered local time)
    const toISOStringSafe = (localDateString: string) => {
      const d = new Date(localDateString);
      return d.toISOString();
    };

    const payload = {
      ...data,
      startDate: toISOStringSafe(data.startDate),
      endDate: toISOStringSafe(data.endDate),
    };
    createEventMutation.mutate(payload);
  };

  if (!isAuthenticated() || (user?.role !== 'admin' && user?.role !== 'coordinator')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            EventHub
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Browse Events
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Admin Panel
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'coordinator') && (
              <Link href="/create-event" className="text-purple-600 font-semibold">
                Create Event
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Navigation */}
          {user?.role === 'admin' ? (
            <AdminMobileMenu currentPath="/create-event" onLogout={handleLogout} />
          ) : (
            <button
              aria-label="Open menu"
              onClick={() => router.push('/dashboard')}
              className="lg:hidden p-2 text-gray-700 hover:text-purple-600 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/events" className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to events
        </Link>

        {/* Welcome Banner */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
              Create New Event
            </h1>
            <p className="text-white/90 text-base sm:text-lg">Fill in the details to launch an amazing event 🚀</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8">

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.maxTeamSize && (
                      <p className="text-red-500 text-sm mt-1">{errors.maxTeamSize.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date & Time
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register('startDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    type="datetime-local"
                    {...register('endDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('venue')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Main Auditorium, PCE Purnea"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    {...register('city')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="City name"
                  />
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Registration Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    Registration Fee <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('registrationFee', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="100"
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
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter event rules and guidelines..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prizes</label>
                <textarea
                  {...register('prizes')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 1st Prize: ₹10,000, 2nd Prize: ₹5,000..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createEventMutation.isPending}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

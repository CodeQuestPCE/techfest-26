'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Check, X, Eye, Clock, CheckCircle2, XCircle, TrendingUp, Users, IndianRupee, Calendar } from 'lucide-react'
import computeAmount from '@/lib/computeAmount'

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const { data: pendingRegistrations, isLoading } = useQuery({
    queryKey: ['pendingRegistrations'],
    queryFn: async () => {
      const response = await api.get('/admin/registrations/pending')
      return response.data.data
    }
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/admin/registrations/${id}/approve`)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pendingRegistrations'] })
      await queryClient.refetchQueries({ queryKey: ['pendingRegistrations'] })
      toast.success('Registration approved successfully! ✅')
      setSelectedRegistration(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Approval failed')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.put(`/admin/registrations/${id}/reject`, { reason })
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pendingRegistrations'] })
      await queryClient.refetchQueries({ queryKey: ['pendingRegistrations'] })
      toast.success('Registration rejected successfully')
      setSelectedRegistration(null)
      setRejectionReason('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Rejection failed')
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600"></div>
          <Clock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600 animate-pulse" />
        </div>
      </div>
    )
  }

  const totalPending = pendingRegistrations?.length || 0
  const totalAmount = pendingRegistrations?.reduce((sum: number, reg: any) => sum + (computeAmount(reg) || 0), 0) || 0

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-6 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Pending Verifications</p>
            <p className="text-4xl font-bold text-gray-900">{totalPending}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-6 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-7 h-7 text-white" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Amount Pending</p>
            <p className="text-4xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl shadow-xl hover:shadow-2xl p-6 hover:-translate-y-2 transition-all duration-300 overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-2 border-white/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <p className="text-white/90 text-sm font-medium mb-1">Avg. Per Registration</p>
            <p className="text-4xl font-bold">₹{totalPending > 0 ? Math.round(totalAmount / totalPending) : 0}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-7 h-7 text-purple-600" />
          Payment Verification Queue
        </h2>
        <p className="text-gray-600 mt-1">Review and approve pending registrations</p>
      </div>

      <div className="grid gap-6">
        {pendingRegistrations?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
            <CheckCircle2 className="w-24 h-24 text-green-300 mx-auto mb-6" />
            <p className="text-gray-600 text-xl font-medium">All caught up! No pending registrations ✨</p>
          </div>
        ) : (
          pendingRegistrations?.map((registration: any, index: number) => (
            <div key={registration._id} className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
              {/* Event Badge */}
              <div className="mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">{registration.event ? registration.event.title : <span className="text-red-500">[Event Deleted]</span>}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${registration.event?.eventType === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {registration.event ? (registration.event.eventType === 'team' ? '👥 Team Event' : '👤 Solo Event') : '[Event Deleted]'}
                      </span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Registered: {registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    {registration.teamName ? 'Team Leader Details' : 'Participant Details'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                      <span className="text-purple-700 font-bold min-w-[100px]">{registration.teamName ? '👑 Leader:' : 'Name:'}</span>
                      <span className="text-gray-900 font-bold">{registration.user.name}</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium min-w-[100px]">Email:</span>
                      <span className="text-gray-900 font-medium">{registration.user.email}</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium min-w-[100px]">Phone:</span>
                      <span className="text-gray-900 font-medium">{registration.user.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium min-w-[100px]">College:</span>
                      <span className="text-gray-900 font-medium">{registration.user.college}</span>
                    </div>
                    {registration.teamName && (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                        <span className="text-blue-600 font-medium min-w-[100px]">Team:</span>
                        <span className="text-blue-900 font-bold">{registration.teamName}</span>
                      </div>
                    )}
                  </div>

                  {registration.teamMembers && registration.teamMembers.length > 0 && (
                    <>
                      <h4 className="text-lg font-bold text-gray-900 mt-6 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Team Members ({registration.teamMembers.length + 1})
                      </h4>
                      <div className="space-y-3">
                        {/* Team Leader (Registrant) */}
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              👑
                            </span>
                            <span className="text-gray-900 font-bold">{registration.user.name} (Leader)</span>
                          </div>
                          <div className="ml-9 space-y-1">
                            <p className="text-sm text-gray-600">📧 {registration.user.email}</p>
                            <p className="text-sm text-gray-600">📱 {registration.user.phone}</p>
                          </div>
                        </div>
                        {/* Other Team Members */}
                        {registration.teamMembers.map((member: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {idx + 2}
                              </span>
                              <span className="text-gray-900 font-bold">{member.name}</span>
                            </div>
                            <div className="ml-9 space-y-1">
                              <p className="text-sm text-gray-600">📧 {member.email}</p>
                              <p className="text-sm text-gray-600">📱 {member.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <h4 className="text-lg font-bold text-gray-900 mt-6 mb-4 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    Payment Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <span className="text-gray-700 font-medium">Amount:</span>
                      <span className="text-2xl font-bold text-green-700">₹{computeAmount(registration)}</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium min-w-[100px]">Ticket:</span>
                      <span className="text-gray-900 font-semibold">{registration.ticketType}</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium min-w-[100px]">Quantity:</span>
                      <span className="text-gray-900 font-semibold">{registration.quantity}</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                      <span className="text-purple-600 font-medium min-w-[100px]">UTR:</span>
                      <span className="text-purple-900 font-mono font-bold">{registration.utrNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    Payment Screenshot
                  </h4>
                  {registration.paymentScreenshotUrl ? (
                    <div className="relative group">
                      <img
                        src={registration.paymentScreenshotUrl.startsWith('http')
                          ? registration.paymentScreenshotUrl
                          : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${registration.paymentScreenshotUrl}`}
                        alt="Payment Screenshot"
                        className="w-full rounded-2xl border-4 border-gray-200 cursor-pointer hover:border-purple-400 transition-all shadow-lg hover:shadow-2xl"
                        onClick={() => {
                          const fullUrl = registration.paymentScreenshotUrl.startsWith('http')
                            ? registration.paymentScreenshotUrl
                            : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${registration.paymentScreenshotUrl}`;
                          console.log('Opening image:', fullUrl);
                          window.open(fullUrl, '_blank');
                        }}
                        onError={(e) => {
                          const fullUrl = registration.paymentScreenshotUrl.startsWith('http')
                            ? registration.paymentScreenshotUrl
                            : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${registration.paymentScreenshotUrl}`;
                          console.error('Image load error. URL:', fullUrl);
                          console.error('PaymentScreenshotUrl from backend:', registration.paymentScreenshotUrl);
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', registration.paymentScreenshotUrl);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all">
                          Click to enlarge 🔍
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                      <Eye className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No screenshot uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-100 flex gap-4">
                <button
                  onClick={() => approveMutation.mutate(registration._id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <CheckCircle2 size={24} />
                  {approveMutation.isPending ? 'Approving...' : 'Approve Payment ✓'}
                </button>
                <button
                  onClick={() => setSelectedRegistration(registration)}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <XCircle size={24} />
                  Reject Payment ✗
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-6 pt-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-4 sm:p-8 w-full sm:max-w-md shadow-2xl animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Reject Registration</h3>
                <p className="text-sm sm:text-base text-gray-600">Provide a detailed reason</p>
              </div>
            </div>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-6 transition-all max-h-[40vh] overflow-y-auto"
              rows={4}
              placeholder="e.g., UTR number mismatch, payment screenshot not clear, wrong amount paid, duplicate payment..."
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSelectedRegistration(null)
                  setRejectionReason('')
                }}
                className="w-full sm:flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectionReason.trim()) {
                    rejectMutation.mutate({
                      id: selectedRegistration._id,
                      reason: rejectionReason
                    })
                  } else {
                    toast.error('Please provide a rejection reason')
                  }
                }}
                disabled={rejectMutation.isPending}
                className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm sm:text-base"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

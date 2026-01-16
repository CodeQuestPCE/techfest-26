"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Image from 'next/image'
import { Upload, X, Trash2, Plus } from 'lucide-react'

export default function EditRegistrationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id

  const { data: registration, isLoading } = useQuery({
    queryKey: ['registration', id],
    queryFn: async () => {
      const res = await api.get(`/registrations/${id}`)
      return res.data.data
    },
    enabled: !!id
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<Array<any>>([])
  const [teamName, setTeamName] = useState('')
  const [utrNumber, setUtrNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (registration) {
      setTeamName(registration.teamName || '')
      setUtrNumber(registration.utrNumber || '')
      setTeamMembers(registration.teamMembers || [])
      // preload existing payment screenshot into preview if present
      if (registration.paymentScreenshotUrl) {
        setPreviewUrl(registration.paymentScreenshotUrl)
      }
    }
  }, [registration])

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Only JPG and PNG files are allowed')
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addMember = () => setTeamMembers([...teamMembers, { name: '', email: '', phone: '' }])
  const removeMember = (i: number) => setTeamMembers(teamMembers.filter((_, idx) => idx !== i))
  const updateMember = (i: number, field: string, value: string) => {
    const copy = [...teamMembers]
    copy[i] = { ...copy[i], [field]: value }
    setTeamMembers(copy)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('utrNumber', utrNumber)
      if (registration.event?.eventType === 'team') {
        formData.append('teamName', teamName)
        formData.append('teamMembers', JSON.stringify(teamMembers.filter(m => m.name && m.email && m.phone)))
      }
      if (selectedFile) formData.append('paymentScreenshot', selectedFile)

      const res = await api.patch(`/registrations/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Registration updated and resubmitted')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <div className="py-12 text-center">Loading...</div>
  if (!registration) return <div className="py-12 text-center">Registration not found</div>

  // Only allow editing when registration is rejected
  if (registration.status !== 'rejected') {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Only rejected registrations can be edited and resubmitted</h3>
        <p className="text-sm text-gray-600 mb-6">This registration is currently <strong>{registration.status}</strong>. You can only edit when it's rejected.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-primary-600 text-white rounded">Go back</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-1">Edit Registration</h2>
        <p className="text-sm text-gray-600">Update your payment details or team members and resubmit for verification.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{registration.event?.title}</h3>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Type: {registration.event?.eventType === 'team' ? 'Team Event' : 'Solo Event'}</span>
            <span>Fee: ₹{registration.event?.registrationFee || registration.event?.registrationFee}</span>
            {registration.event?.eventType === 'team' && (
              <span>Team Size: {registration.event?.minTeamSize}-{registration.event?.maxTeamSize} members</span>
            )}
          </div>
        </div>

        {/* Team Name */}
        {registration.event?.eventType === 'team' && (
          <div>
            <label className="block text-sm font-medium mb-2">Team Name</label>
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
        )}

        {/* Team Members */}
        {registration.event?.eventType === 'team' && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Team Members</h3>
              <button type="button" onClick={addMember} className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                <Plus className="w-4 h-4" /> Add Member
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">👑 Team Leader</span>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <input type="text" value={registration.user?.name || registration.attendeeInfo?.name || ''} readOnly className="px-3 py-2 border border-gray-300 rounded-lg bg-white" />
                  <input type="email" value={registration.user?.email || registration.attendeeInfo?.email || ''} readOnly className="px-3 py-2 border border-gray-300 rounded-lg bg-white" />
                  <input type="tel" value={registration.user?.phone || registration.attendeeInfo?.phone || ''} readOnly className="px-3 py-2 border border-gray-300 rounded-lg bg-white" />
                </div>
              </div>

              {teamMembers.map((m, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-gray-50 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">Member {idx + 2}</span>
                    <button type="button" onClick={() => removeMember(idx)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input value={m.name || ''} onChange={(e) => updateMember(idx, 'name', e.target.value)} placeholder="Full Name" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2" />
                    <input value={m.email || ''} onChange={(e) => updateMember(idx, 'email', e.target.value)} placeholder="Email" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2" />
                    <input value={m.phone || ''} onChange={(e) => updateMember(idx, 'phone', e.target.value)} placeholder="Phone" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UTR */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium mb-2">UTR / Transaction Reference</label>
          <input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2" placeholder="Enter UTR" />
        </div>

        {/* Payment Screenshot */}
        <div>
          <label className="block text-sm font-medium mb-2">Payment Screenshot</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {previewUrl ? (
              <div className="relative">
                <Image src={previewUrl} alt="Preview" width={400} height={300} className="max-h-64 mx-auto rounded-lg object-contain" unoptimized />
                <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-primary-600 hover:text-primary-700 font-medium">Click to upload</span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} className="hidden" />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700">{submitting ? 'Submitting...' : 'Update & Resubmit'}</button>
        </div>
      </form>
    </div>
  )
}

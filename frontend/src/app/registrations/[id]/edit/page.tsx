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

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Edit Registration</h2>
      <p className="text-sm text-gray-600 mb-6">Update your payment details or team members and resubmit for verification.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {registration.event?.eventType === 'team' && (
          <div>
            <label className="block text-sm font-medium mb-2">Team Name</label>
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        )}

        {registration.event?.eventType === 'team' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Team Members</h4>
              <button type="button" onClick={addMember} className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded"> <Plus /> Add</button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((m, idx) => (
                <div key={idx} className="p-3 border rounded grid md:grid-cols-3 gap-2">
                  <input value={m.name || ''} onChange={(e) => updateMember(idx, 'name', e.target.value)} placeholder="Full name" className="px-2 py-1 border rounded" />
                  <input value={m.email || ''} onChange={(e) => updateMember(idx, 'email', e.target.value)} placeholder="Email" className="px-2 py-1 border rounded" />
                  <div className="flex gap-2">
                    <input value={m.phone || ''} onChange={(e) => updateMember(idx, 'phone', e.target.value)} placeholder="Phone" className="px-2 py-1 border rounded flex-1" />
                    <button type="button" onClick={() => removeMember(idx)} className="text-red-600 px-2"> <Trash2 /> </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">UTR / Transaction Reference</label>
          <input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Screenshot</label>
          <div className="border-dashed border-2 p-4 rounded text-center">
            {previewUrl ? (
              <div className="relative">
                <Image src={previewUrl} alt="Preview" width={600} height={400} className="mx-auto max-h-64 object-contain" unoptimized />
                <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"><X /></button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-primary-600">Click to upload</span>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-2">PNG/JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-2 rounded">
            {submitting ? 'Submitting...' : 'Update & Resubmit'}
          </button>
        </div>
      </form>
    </div>
  )
}

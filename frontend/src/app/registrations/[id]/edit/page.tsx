"use client"

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

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

  useEffect(() => {
    if (registration) {
      const eventId = registration.event?._id || registration.event
      if (eventId) {
        router.replace(`/events/${eventId}/register?edit=${id}`)
      }
    }
  }, [registration, id, router])

  if (isLoading) return <div className="py-12 text-center">Loading...</div>
  return <div className="py-12 text-center">Redirecting to event registration...</div>
}

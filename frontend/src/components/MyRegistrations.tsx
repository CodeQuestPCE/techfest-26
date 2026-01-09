'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Download, CheckCircle, Clock, XCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function MyRegistrations() {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['myRegistrations'],
    queryFn: async () => {
      const response = await api.get('/registrations')
      return response.data.data
    }
  })

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending Verification' },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Cancelled' }
    }
    
    const { color, icon: Icon, text } = config[status as keyof typeof config] || config.pending
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${color}`}>
        <Icon size={16} />
        {text}
      </span>
    )
  }

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Registrations</h1>

      <div className="grid gap-6">
        {registrations?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No registrations yet
          </div>
        ) : (
          registrations?.map((registration: any) => (
            <div key={registration._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {registration.event?.title || 'Event'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {registration.event?.startDate 
                      ? new Date(registration.event.startDate).toLocaleDateString()
                      : 'Date TBD'}
                  </p>
                </div>
                {getStatusBadge(registration.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Ticket Type</p>
                  <p className="font-medium">{registration.ticketType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="font-medium">₹{registration.totalAmount || 0}</p>
                </div>
                {registration.teamName && (
                  <div>
                    <p className="text-sm text-gray-600">Team Name</p>
                    <p className="font-medium">{String(registration.teamName)}</p>
                  </div>
                )}
                {registration.utrNumber && (
                  <div>
                    <p className="text-sm text-gray-600">UTR Number</p>
                    <p className="font-mono text-sm">{String(registration.utrNumber)}</p>
                  </div>
                )}
              </div>

              {registration.status === 'verified' && registration.qrCodeHash && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-start gap-6">
                    <div>
                      <p className="font-semibold mb-2">Your Ticket QR Code:</p>
                      <QRCodeSVG
                        value={JSON.stringify({
                          registrationId: registration._id,
                          qrHash: registration.qrCodeHash
                        })}
                        size={150}
                        level="H"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-4">
                        Show this QR code at the event venue for check-in
                      </p>
                      {registration.checkInStatus && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={20} />
                          <span>Checked in on {new Date(registration.checkInTime).toLocaleString()}</span>
                        </div>
                      )}
                      {registration.certificateIssued && (
                        <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                          <Download size={20} />
                          Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {registration.status === 'rejected' && registration.rejectionReason && (
                <div className="border-t pt-4 mt-4 bg-red-50 p-4 rounded">
                  <p className="font-semibold text-red-900 mb-2">Rejection Reason:</p>
                  <p className="text-red-800">
                    {(() => {
                      const reason = registration.rejectionReason;
                      if (typeof reason === 'string') {
                        return reason;
                      } else if (typeof reason === 'object' && reason !== null && 'reason' in reason) {
                        return String(reason.reason);
                      }
                      return 'No reason provided';
                    })()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

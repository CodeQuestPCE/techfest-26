'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { QrCode, CheckCircle, XCircle } from 'lucide-react'

export default function QRScanner() {
  const [qrHash, setQrHash] = useState('')
  const [scanResult, setScanResult] = useState<any>(null)

  const checkInMutation = useMutation({
    mutationFn: async (qrHash: string) => {
      const response = await api.post('/checkin/validate', { qrHash })
      return response.data
    },
    onSuccess: (data) => {
      toast.success('Check-in successful!')
      setScanResult(data.data)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Check-in failed'
      toast.error(message)
      setScanResult({ error: message })
    }
  })

  const handleManualScan = () => {
    if (!qrHash.trim()) {
      toast.error('Please enter QR hash')
      return
    }
    checkInMutation.mutate(qrHash)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <QrCode className="w-8 h-8 text-primary-600" />
          <h2 className="text-2xl font-bold">Event Check-In</h2>
        </div>

        {/* QR Scanner would go here - using react-qr-reader or similar */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Scan QR code or enter manually</p>
            {/* In production, integrate actual QR scanner here */}
          </div>
        </div>

        {/* Manual Entry */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Or Enter QR Hash Manually
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrHash}
              onChange={(e) => setQrHash(e.target.value)}
              placeholder="Enter QR hash"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleManualScan}
              disabled={checkInMutation.isPending}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {checkInMutation.isPending ? 'Validating...' : 'Validate'}
            </button>
          </div>
        </div>

        {/* Result Display */}
        {scanResult && (
          <div className={`mt-6 p-6 rounded-lg border-2 ${
            scanResult.error 
              ? 'bg-red-50 border-red-300' 
              : 'bg-green-50 border-green-300'
          }`}>
            {scanResult.error ? (
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Check-In Failed</h3>
                  <p className="text-red-800">{scanResult.error}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-4">Check-In Successful!</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {scanResult.user.name}</p>
                    <p><strong>Email:</strong> {scanResult.user.email}</p>
                    <p><strong>Event:</strong> {scanResult.event.title}</p>
                    {scanResult.teamName && (
                      <p><strong>Team:</strong> {scanResult.teamName}</p>
                    )}
                    <p><strong>Check-In Time:</strong> {new Date(scanResult.checkInTime).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Scan the attendee&apos;s QR code ticket</li>
          <li>System will validate and mark attendance</li>
          <li>Green checkmark indicates successful check-in</li>
          <li>Red cross indicates invalid or already used ticket</li>
        </ul>
      </div>
    </div>
  )
}

'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Trophy, Medal, Award } from 'lucide-react'

export default function AmbassadorLeaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await api.get('/ambassadors/leaderboard?limit=50')
      return response.data.data
    }
  })

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading leaderboard...</div>
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />
    if (index === 2) return <Award className="w-6 h-6 text-orange-600" />
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Campus Ambassador Leaderboard 🏆
      </h1>

      <div className="max-w-4xl mx-auto">
        {/* Desktop / Tablet: table view */}
        <div className="hidden sm:block bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">College</th>
                <th className="px-6 py-4 text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((ambassador: any, index: number) => (
                <tr
                  key={ambassador._id}
                  className={`border-b hover:bg-gray-50 ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <span className="font-semibold">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{ambassador.name}</td>
                  <td className="px-6 py-4 text-gray-600">{ambassador.college}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold">
                      {ambassador.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: card list view */}
        <div className="sm:hidden space-y-3">
          {leaderboard?.map((ambassador: any, index: number) => (
            <div
              key={ambassador._id}
              className={`bg-white rounded-lg shadow p-4 flex items-center justify-between ${index < 3 ? 'bg-yellow-50' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary-100 text-primary-700 font-bold">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{ambassador.name}</div>
                  <div className="text-xs text-gray-600 truncate">{ambassador.college}</div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold">{ambassador.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 max-w-4xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Points Work:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Share your referral code with students</li>
          <li>When they register using your code, you&apos;re linked</li>
          <li>You earn <strong>10 points</strong> when their payment is verified by admin</li>
          <li>More verified referrals = Higher rank!</li>
        </ul>
      </div>
    </div>
  )
}

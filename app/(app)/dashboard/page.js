'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { 
  Search, Package, CheckCircle, Clock, PlusCircle, FileText,
  TrendingUp, ArrowRight, MapPin, Calendar, Tag
} from 'lucide-react'
import { formatTimeAgo, getCategoryLabel } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const [lostRes, foundRes, returnedRes, claimsRes, recentRes] = await Promise.all([
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('reporter_id', user.id).eq('item_type', 'lost'),
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('reporter_id', user.id).eq('item_type', 'found'),
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('reporter_id', user.id).eq('status', 'returned'),
        supabase.from('claims').select('id', { count: 'exact', head: true }).eq('claimant_id', user.id).eq('status', 'pending'),
        supabase.from('items').select('id, title, item_type, status, category, location, event_date, created_at').eq('reporter_id', user.id).order('created_at', { ascending: false }).limit(5),
      ])
      setStats({
        lost: lostRes.count || 0,
        found: foundRes.count || 0,
        returned: returnedRes.count || 0,
        pendingClaims: claimsRes.count || 0,
      })
      setRecentItems(recentRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [user])

  const firstName = profile?.full_name?.split(' ')[0] || 'Student'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hello, {firstName} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your overview on CampusFinder</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard icon={Search} label="Lost Reports" value={stats.lost} color="bg-red-500" />
            <StatCard icon={Package} label="Found Reports" value={stats.found} color="bg-emerald-500" />
            <StatCard icon={CheckCircle} label="Items Returned" value={stats.returned} color="bg-blue-500" />
            <StatCard icon={Clock} label="Pending Claims" value={stats.pendingClaims} color="bg-amber-500" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/report-lost" className="group bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-6 text-white hover:from-red-600 hover:to-rose-700 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5" />
                <span className="font-semibold">Report Lost Item</span>
              </div>
              <p className="text-red-100 text-sm">Lost something? Report it here and let the community help you find it.</p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/report-found" className="group bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white hover:from-emerald-600 hover:to-teal-700 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5" />
                <span className="font-semibold">Report Found Item</span>
              </div>
              <p className="text-emerald-100 text-sm">Found something? Help it get back to its owner.</p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Items */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Your Recent Reports</h2>
          <Link href="/my-reports" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No reports yet. Report a lost or found item to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentItems.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-10 rounded-full flex-shrink-0 ${item.item_type === 'lost' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-gray-900 truncate">{item.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.item_type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {item.item_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{getCategoryLabel(item.category)}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatTimeAgo(item.created_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

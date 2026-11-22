'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { 
  Search, Package, CheckCircle, Clock, PlusCircle, FileText,
  TrendingUp, ArrowRight, MapPin, Calendar, Tag, Sparkles
} from 'lucide-react'
import { formatTimeAgo, getCategoryLabel } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { getStoredItems } from '@/lib/itemStore'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
      <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ lost: 8, found: 16, returned: 12, pendingClaims: 2 })
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Load local stored items as instant baseline
      const stored = getStoredItems()
      const lostCount = stored.filter((i) => i.item_type === 'lost').length
      const foundCount = stored.filter((i) => i.item_type === 'found').length
      const retCount = stored.filter((i) => i.status === 'returned').length
      const claimCount = stored.filter((i) => i.status === 'claimed').length

      setStats({
        lost: lostCount,
        found: foundCount,
        returned: retCount,
        pendingClaims: claimCount || 2,
      })
      setRecentItems(stored.slice(0, 6))

      if (user) {
        try {
          const [lostRes, foundRes, returnedRes, claimsRes, recentRes] = await Promise.all([
            supabase.from('items').select('id', { count: 'exact', head: true }).eq('reporter_id', user.id).eq('item_type', 'lost'),
            supabase.from('items').select('id', { count: 'exact', head: true }).eq('reporter_id', user.id).eq('item_type', 'found'),
            supabase.from('items').select('id', { count: 'exact', head: true }).eq('reporter_id', user.id).eq('status', 'returned'),
            supabase.from('claims').select('id', { count: 'exact', head: true }).eq('claimant_id', user.id).eq('status', 'pending'),
            supabase.from('items').select('id, title, item_type, status, category, location, event_date, created_at, image_url').order('created_at', { ascending: false }).limit(6),
          ])

          if (recentRes.data && recentRes.data.length > 0) {
            setRecentItems(recentRes.data)
            setStats({
              lost: lostRes.count || lostCount,
              found: foundRes.count || foundCount,
              returned: returnedRes.count || retCount,
              pendingClaims: claimsRes.count || claimCount,
            })
          }
        } catch (e) {}
      }

      setLoading(false)
    }
    fetchData()
  }, [user])

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Campus Dashboard 👋</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, <strong className="text-indigo-600">{firstName}</strong>! Here is your campus activity overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/report-lost"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            Report Lost
          </Link>
          <Link
            href="/report-found"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Package className="w-3.5 h-3.5" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard icon={Search} label="Lost Reports" value={stats.lost} color="bg-rose-500" />
            <StatCard icon={Package} label="Found Belongings" value={stats.found} color="bg-emerald-500" />
            <StatCard icon={CheckCircle} label="Items Returned" value={stats.returned} color="bg-blue-600" />
            <StatCard icon={Clock} label="Pending Claims" value={stats.pendingClaims} color="bg-amber-500" />
          </>
        )}
      </div>

      {/* Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          href="/report-lost"
          className="group bg-gradient-to-r from-rose-600 to-red-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider">
                <Search className="w-4 h-4" />
                <span>Lost Item Report</span>
              </div>
              <h3 className="text-xl font-black text-white">Did You Misplace Something?</h3>
              <p className="text-xs text-rose-100 max-w-sm">
                Provide identifying details and photos so classmates and faculty can locate it.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link
          href="/report-found"
          className="group bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-7 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                <Package className="w-4 h-4" />
                <span>Found Item Submission</span>
              </div>
              <h3 className="text-xl font-black text-white">Found Someone's Belonging?</h3>
              <p className="text-xs text-emerald-100 max-w-sm">
                Help reunite it with its owner and earn a spot on the campus Good Samaritan leaderboard.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Items Activity Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg">Recent Campus Activity</h2>
            <p className="text-xs text-gray-500 mt-0.5">Live items currently active or resolved on campus</p>
          </div>
          <Link
            href="/browse-lost"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Browse all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600">No reports logged yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-colors"
              >
                {/* Image thumbnail */}
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-extrabold text-gray-900 text-sm truncate">{item.title}</p>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        item.item_type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.item_type}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {getCategoryLabel(item.category)}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {item.location}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex-shrink-0">
                  {formatTimeAgo(item.created_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

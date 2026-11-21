'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/Skeleton'
import { 
  Users, Package, Search, CheckCircle, Clock, Shield, 
  TrendingUp, AlertCircle, ChevronRight, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

export default function AdminPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [stats, setStats] = useState(null)
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('items')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    if (profile?.role === 'admin') fetchData()
  }, [profile])

  const fetchData = async () => {
    setLoading(true)
    const [usersRes, lostRes, foundRes, returnedRes, claimsRes, recentItemsRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, department, role, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('items').select('id', { count: 'exact', head: true }).eq('item_type', 'lost'),
      supabase.from('items').select('id', { count: 'exact', head: true }).eq('item_type', 'found'),
      supabase.from('items').select('id', { count: 'exact', head: true }).eq('status', 'returned'),
      supabase.from('claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('items').select('id, title, item_type, status, category, created_at').order('created_at', { ascending: false }).limit(20),
    ])
    setStats({
      users: usersRes.data?.length || 0,
      lost: lostRes.count || 0,
      found: foundRes.count || 0,
      returned: returnedRes.count || 0,
      pendingClaims: claimsRes.count || 0,
    })
    setUsers(usersRes.data || [])
    setItems(recentItemsRes.data || [])
    setLoading(false)
  }

  const handleDeleteItem = async () => {
    setDeleting(true)
    const { error } = await supabase.from('items').delete().eq('id', confirmDelete)
    if (error) { toast({ type: 'error', title: 'Error', message: error.message }) }
    else { toast({ type: 'success', title: 'Item deleted' }); setItems((p) => p.filter((i) => i.id !== confirmDelete)) }
    setConfirmDelete(null)
    setDeleting(false)
  }

  if (!profile) return <div className="max-w-7xl mx-auto px-4 py-8"><Skeleton className="h-96 rounded-2xl" /></div>
  if (profile.role !== 'admin') return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Platform oversight and management</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={stats.users} color="bg-indigo-500" />
          <StatCard icon={Search} label="Lost Reports" value={stats.lost} color="bg-red-500" />
          <StatCard icon={Package} label="Found Reports" value={stats.found} color="bg-emerald-500" />
          <StatCard icon={CheckCircle} label="Returned" value={stats.returned} color="bg-blue-500" />
          <StatCard icon={Clock} label="Pending Claims" value={stats.pendingClaims} color="bg-amber-500" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {[['items', 'Recent Items'], ['users', 'Users']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', tab === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Reports</h2>
          </div>
          {loading ? <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div> : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <div className={cn('w-2 h-8 rounded-full flex-shrink-0', item.item_type === 'lost' ? 'bg-red-400' : 'bg-emerald-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', getStatusColor(item.status))}>{getStatusLabel(item.status)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/items/${item.id}`}><Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button></Link>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Registered Users</h2>
          </div>
          {loading ? <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div> : (
            <div className="divide-y divide-gray-100">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{u.full_name || 'Unnamed'}</p>
                      {u.role === 'admin' && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">Admin</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.email} · {u.department || 'N/A'}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(u.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this report?"
        message="This will permanently remove the item and all associated claims."
        onConfirm={handleDeleteItem}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

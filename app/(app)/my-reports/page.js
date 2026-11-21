'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDate, getCategoryLabel, getStatusColor, getStatusLabel } from '@/lib/utils'
import { FileText, Trash2, ExternalLink, Search, Package, MapPin, Calendar, Tag, PlusCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export default function MyReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchItems()
  }, [user, filter])

  const fetchItems = async () => {
    setLoading(true)
    let query = supabase
      .from('items')
      .select('id, title, category, item_type, location, event_date, status, created_at, image_url')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('item_type', filter)
    const { data } = await query
    setItems(data || [])
    setLoading(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('items').delete().eq('id', confirmDelete).eq('reporter_id', user.id)
    if (error) {
      toast({ type: 'error', title: 'Error', message: error.message })
    } else {
      toast({ type: 'success', title: 'Report deleted', message: 'Your report has been removed.' })
      setItems((prev) => prev.filter((i) => i.id !== confirmDelete))
    }
    setConfirmDelete(null)
    setDeleting(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">All items you've reported</p>
        </div>
        <div className="flex gap-2">
          <Link href="/report-lost"><Button variant="secondary" size="sm"><Search className="w-4 h-4" />Report Lost</Button></Link>
          <Link href="/report-found"><Button size="sm"><Package className="w-4 h-4" />Report Found</Button></Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {['all', 'lost', 'found'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize', filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-700 font-semibold mb-1">No reports found</h3>
          <p className="text-sm text-gray-400 mb-5">You haven't submitted any reports yet.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/report-lost"><Button variant="secondary" size="sm"><PlusCircle className="w-4 h-4" />Report Lost</Button></Link>
            <Link href="/report-found"><Button size="sm"><PlusCircle className="w-4 h-4" />Report Found</Button></Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', item.item_type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>
                    {item.item_type}
                  </span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(item.status))}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{getCategoryLabel(item.category)}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.event_date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/items/${item.id}`}>
                  <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete report?"
        message="This action cannot be undone. All associated claims will also be affected."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatTimeAgo } from '@/lib/utils'
import { Bell, BellOff, ExternalLink, Check, CheckCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data || [])
    setLoading(false)
  }

  const markRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BellOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-700 font-semibold mb-1">No notifications</h3>
          <p className="text-sm text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={cn('bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors', n.is_read ? 'border-gray-200' : 'border-indigo-200 bg-indigo-50/50')}>
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', n.is_read ? 'bg-gray-100' : 'bg-indigo-100')}>
                <Bell className={cn('w-4 h-4', n.is_read ? 'text-gray-400' : 'text-indigo-600')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">{formatTimeAgo(n.created_at)}</span>
                  {n.related_item_id && (
                    <Link href={`/items/${n.related_item_id}`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
                      <ExternalLink className="w-3 h-3" /> View Item
                    </Link>
                  )}
                </div>
              </div>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)} className="flex-shrink-0 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

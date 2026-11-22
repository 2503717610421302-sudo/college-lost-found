'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatTimeAgo } from '@/lib/utils'
import { Bell, BellOff, ExternalLink, Check, CheckCheck, Sparkles, Shield, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const SAMPLE_DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New Ownership Claim Submitted',
    message: 'Aditya Raman submitted an ownership claim for your found item: "Casio fx-991EX ClassWiz Scientific Calculator".',
    related_item_id: 'demo-1',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Claim Approved by Finder! 🎉',
    message: 'Your claim on "boAt Airdopes 141 True Wireless Case" has been approved. Meet at College Cafeteria for handover.',
    related_item_id: 'demo-3',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'notif-3',
    title: '🚨 Exam Urgent Alert',
    message: 'A student lost their "Semester Exam Hall Ticket & ID Card" at Main Library. Check if you found it!',
    related_item_id: 'demo-2',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 3600 * 8).toISOString(),
  },
  {
    id: 'notif-4',
    title: 'Item Returned Successfully 🤝',
    message: '"Engineering Graphics Mini-Drafter" has been marked as returned to owner. Thank you for your honesty!',
    related_item_id: 'demo-5',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
  },
]

export default function NotificationsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    setLoading(true)

    if (!user) {
      setNotifications(SAMPLE_DEMO_NOTIFICATIONS)
      setLoading(false)
      return
    }

    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data && data.length > 0) {
        setNotifications(data)
      } else {
        setNotifications(SAMPLE_DEMO_NOTIFICATIONS)
      }
    } catch (e) {
      setNotifications(SAMPLE_DEMO_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id) => {
    if (user) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      } catch (e) {}
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  const markAllRead = async () => {
    if (user) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
      } catch (e) {}
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Campus Notifications</h1>
          <p className="text-gray-500 text-xs mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alerts on your claims and reports` : 'You are all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 mb-1">No notifications</h3>
          <p className="text-xs text-gray-400">You will receive updates when someone claims your items.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all hover:shadow-md',
                n.is_read ? 'border-gray-200 opacity-80' : 'border-indigo-300 bg-indigo-50/40 shadow-sm'
              )}
            >
              <div
                className={cn(
                  'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm',
                  n.is_read ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white'
                )}
              >
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-gray-900 text-sm">{n.title}</h3>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">{formatTimeAgo(n.created_at)}</span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>

                <div className="flex items-center gap-4 pt-1">
                  {n.related_item_id && (
                    <Link
                      href={`/items/${n.related_item_id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Related Item
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-gray-500 hover:text-gray-900 font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

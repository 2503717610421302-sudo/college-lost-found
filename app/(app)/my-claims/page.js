'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { FileText, ExternalLink, Package, Calendar, CheckCircle, XCircle, MessageSquare, Shield, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

const SAMPLE_DEMO_CLAIMS = [
  {
    id: 'claim-1',
    status: 'pending',
    proof_description: 'The scientific calculator has my name sticker "Aditya R." partially torn on the back battery casing, and the exponent key is slightly worn.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    items: {
      id: 'demo-1',
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category: 'stationery',
      image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      item_type: 'found',
    },
    profiles: {
      full_name: 'Aditya Raman',
      department: 'CSE Dept - 3rd Year',
    },
  },
  {
    id: 'claim-2',
    status: 'approved',
    proof_description: 'I lost my boAt Airdopes 141 case during lunch. It has a small scratch on the bottom right and the serial ends with 492.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: {
      id: 'demo-3',
      title: 'boAt Airdopes 141 True Wireless Case (Black)',
      category: 'accessories',
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      item_type: 'found',
    },
    profiles: {
      full_name: 'Karthik Raja',
      department: 'ECE Dept - 4th Year',
    },
  },
]

export default function MyClaimsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('received') // received | submitted

  useEffect(() => {
    fetchClaims()
  }, [user, tab])

  const fetchClaims = async () => {
    setLoading(true)

    if (!user) {
      setClaims(SAMPLE_DEMO_CLAIMS)
      setLoading(false)
      return
    }

    try {
      const field = tab === 'submitted' ? 'claimant_id' : 'finder_id'
      const { data } = await supabase
        .from('claims')
        .select('id, status, proof_description, created_at, updated_at, items:item_id(id, title, category, image_url, item_type), profiles:claimant_id(full_name, department)')
        .eq(field, user.id)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setClaims(data)
      } else {
        setClaims(SAMPLE_DEMO_CLAIMS)
      }
    } catch (e) {
      setClaims(SAMPLE_DEMO_CLAIMS)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimAction = async (claimId, itemId, newStatus) => {
    if (user) {
      try {
        await supabase.from('claims').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', claimId)
        if (newStatus === 'approved') {
          await supabase.from('items').update({ status: 'claimed' }).eq('id', itemId)
        }
      } catch (e) {}
    }

    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
    )

    toast({
      type: newStatus === 'approved' ? 'success' : 'info',
      title: `Claim ${newStatus === 'approved' ? 'Approved! ✅' : newStatus === 'rejected' ? 'Rejected ❌' : 'Verification Requested 📩'}`,
      message: `Status updated for claim #${claimId.slice(0, 7)}.`,
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Recovery Claims</h1>
        <p className="text-gray-500 text-xs mt-1">Review and manage ownership verification requests</p>
      </div>

      <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1.5 w-fit">
        {[
          ['received', 'Claims on Items I Found'],
          ['submitted', 'Claims I Submitted'],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={cn(
              'px-5 py-2 rounded-xl text-xs font-bold transition-all',
              tab === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 mb-1">No claims found</h3>
          <p className="text-xs text-gray-400">Browse found items to submit a recovery claim.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                {claim.items?.image_url ? (
                  <img
                    src={claim.items.image_url}
                    alt={claim.items?.title}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base">{claim.items?.title}</h3>
                      <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                        Claimed by: {claim.profiles?.full_name || 'Verified Student'} ({claim.profiles?.department || 'College Dept'})
                      </p>
                    </div>
                    <span className={cn('text-xs px-3 py-1 rounded-full font-bold flex-shrink-0', getStatusColor(claim.status))}>
                      {getStatusLabel(claim.status)}
                    </span>
                  </div>

                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-gray-700">
                    <span className="font-bold text-gray-900 block mb-0.5">Submitted Ownership Proof:</span>
                    {claim.proof_description}
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(claim.created_at)}
                    </span>
                    <Link
                      href={`/items/${claim.items?.id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Item Page
                    </Link>
                  </div>
                </div>
              </div>

              {tab === 'received' && claim.status === 'pending' && (
                <div className="flex flex-wrap gap-2.5 pt-4 border-t border-gray-100">
                  <Button size="sm" variant="success" onClick={() => handleClaimAction(claim.id, claim.items?.id, 'approved')}>
                    <CheckCircle className="w-4 h-4" /> Approve Ownership
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleClaimAction(claim.id, claim.items?.id, 'verification_needed')}>
                    <MessageSquare className="w-4 h-4" /> Request ID Card Proof
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleClaimAction(claim.id, claim.items?.id, 'rejected')}>
                    <XCircle className="w-4 h-4" /> Reject Claim
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

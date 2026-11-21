'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { FileText, ExternalLink, Package, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export default function MyClaimsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('submitted') // submitted | received

  useEffect(() => {
    if (!user) return
    fetchClaims()
  }, [user, tab])

  const fetchClaims = async () => {
    setLoading(true)
    const field = tab === 'submitted' ? 'claimant_id' : 'finder_id'
    const { data } = await supabase
      .from('claims')
      .select('id, status, proof_description, created_at, updated_at, items:item_id(id, title, category, image_url, item_type), profiles:claimant_id(full_name, department)')
      .eq(field, user.id)
      .order('created_at', { ascending: false })
    setClaims(data || [])
    setLoading(false)
  }

  const handleClaimAction = async (claimId, itemId, status) => {
    const { error } = await supabase.from('claims').update({ status, updated_at: new Date().toISOString() }).eq('id', claimId)
    if (error) { toast({ type: 'error', title: 'Error', message: error.message }); return }
    if (status === 'approved') {
      await supabase.from('items').update({ status: 'claimed' }).eq('id', itemId)
      await supabase.from('notifications').insert({
        user_id: claims.find(c => c.id === claimId)?.claimant_id,
        title: 'Claim Approved',
        message: 'Your claim has been approved. Please contact the finder to arrange handover.',
        related_item_id: itemId,
      })
    }
    toast({ type: 'success', title: `Claim ${status}`, message: `You've ${status} this claim.` })
    fetchClaims()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your recovery requests</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {[['submitted', 'Claims I Submitted'], ['received', 'Claims I Received']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', tab === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : claims.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-700 font-semibold mb-1">No claims found</h3>
          <p className="text-sm text-gray-400">Browse found items to submit a recovery claim.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                {claim.items?.image_url ? (
                  <img src={claim.items.image_url} alt={claim.items?.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{claim.items?.title}</p>
                      {tab === 'received' && (
                        <p className="text-xs text-gray-500 mt-0.5">Claimed by: <strong>{claim.profiles?.full_name}</strong> ({claim.profiles?.department})</p>
                      )}
                    </div>
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium flex-shrink-0', getStatusColor(claim.status))}>
                      {getStatusLabel(claim.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{claim.proof_description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(claim.created_at)}</span>
                    <Link href={`/items/${claim.items?.id}`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
                      <ExternalLink className="w-3 h-3" /> View Item
                    </Link>
                  </div>
                </div>
              </div>
              {tab === 'received' && claim.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button size="sm" variant="success" onClick={() => handleClaimAction(claim.id, claim.items?.id, 'approved')}>
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleClaimAction(claim.id, claim.items?.id, 'verification_needed')}>
                    <MessageSquare className="w-4 h-4" /> Request Verification
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleClaimAction(claim.id, claim.items?.id, 'rejected')}>
                    <XCircle className="w-4 h-4" /> Reject
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

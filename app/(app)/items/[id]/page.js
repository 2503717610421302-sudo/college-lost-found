'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import {
  MapPin, Calendar, Tag, User, Package, ArrowLeft,
  CheckCircle, Shield, AlertTriangle, Gift, Share2,
  ZoomIn, MessageCircle, Copy, ExternalLink, Clock, Building
} from 'lucide-react'
import { formatDate, getCategoryLabel, getStatusColor, getStatusLabel } from '@/lib/utils'
import { getStoredItems, updateItemStatus } from '@/lib/itemStore'
import ImageLightbox from '@/components/ui/ImageLightbox'
import ClaimModal from '@/components/ui/ClaimModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export default function ItemDetailPage({ params }) {
  // Unwrap params using React.use for Next.js 15/16 compatibility
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)

  useEffect(() => {
    async function loadItem() {
      setLoading(true)

      // 1. Try local stored / demo items first
      const stored = getStoredItems()
      const foundLocal = stored.find((i) => String(i.id) === String(id))

      if (foundLocal) {
        setItem(foundLocal)
        setLoading(false)
        return
      }

      // 2. Try Supabase
      try {
        const { data } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single()
        if (data) {
          setItem(data)
        } else if (stored.length > 0) {
          setItem(stored[0])
        }
      } catch (e) {
        if (stored.length > 0) setItem(stored[0])
      } finally {
        setLoading(false)
      }
    }
    loadItem()
  }, [id])

  const handleClaimSuccess = (updatedItem) => {
    updateItemStatus(item.id, 'claimed')
    setItem((prev) => ({ ...prev, status: 'claimed' }))
  }

  const handleMarkReturned = () => {
    updateItemStatus(item.id, 'returned')
    setItem((prev) => ({ ...prev, status: 'returned' }))
    toast({
      type: 'success',
      title: 'Item Marked as Returned! 🤝',
      message: 'Thank you for helping reunite belongings on campus.',
    })
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      toast({
        type: 'info',
        title: 'Link Copied!',
        message: 'Share this link on your college WhatsApp group.',
      })
    }
  }

  const handleWhatsAppShare = () => {
    if (!item) return
    const text = encodeURIComponent(
      `🔔 Campus Lost & Found:\n\n*${item.title}*\nType: ${item.item_type?.toUpperCase()}\nLocation: ${item.location}\nDate: ${item.event_date}\n\nView details or claim: ${window.location.href}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Item not found</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">The requested item report may have been removed.</p>
        <Link href="/browse-lost">
          <Button>Back to Browse Catalog</Button>
        </Link>
      </div>
    )
  }

  const isFound = item.item_type === 'found'
  const isLost = item.item_type === 'lost'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={isFound ? '/browse-found' : '/browse-lost'}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {isFound ? 'Found Items' : 'Lost Items'}
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 shadow-sm transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition-all shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Share on WhatsApp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Card */}
        <div className="md:col-span-7 space-y-4">
          <div
            className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-gray-200 cursor-pointer group"
            onClick={() => setLightboxOpen(true)}
            title="Click to zoom image"
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full max-h-[460px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-400 bg-slate-100">
                <Package className="w-16 h-16 stroke-1 mb-2 text-gray-300" />
                <span className="text-sm font-medium">No photo available</span>
              </div>
            )}

            {/* Click to zoom overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/75 text-white text-xs font-bold backdrop-blur-md border border-white/20">
                <ZoomIn className="w-4 h-4 text-sky-400" /> Click to View Fullscreen Image
              </span>
            </div>

            {/* Badges on image */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
              <span
                className={cn(
                  'text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md',
                  isLost ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                )}
              >
                {isLost ? 'Lost Item' : 'Found Item'}
              </span>

              <span className={cn('text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md', getStatusColor(item.status))}>
                {getStatusLabel(item.status)}
              </span>
            </div>

            {item.urgency === 'critical' && (
              <div className="absolute bottom-4 left-4 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black shadow-lg animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> Exam / Critical Belonging
                </span>
              </div>
            )}
          </div>

          {/* Reward Callout */}
          {item.reward && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                  Token of Appreciation Offered
                </div>
                <div className="text-sm font-black text-amber-950">{item.reward}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Info & Actions */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xl space-y-5">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-indigo-600 mb-1">
                {getCategoryLabel(item.category)}
              </div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">{item.title}</h1>
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">{item.description}</p>
            </div>

            {/* Key Attributes */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs text-gray-700">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Reported Campus Location</span>
                  <span className="font-extrabold text-gray-900 text-xs">{item.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date of Incident</span>
                  <span className="font-extrabold text-gray-900 text-xs">{formatDate(item.event_date)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Verified Campus Department</span>
                  <span className="font-extrabold text-gray-900 text-xs">
                    {item.reporter_dept || 'Computer Science & Engineering'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reporter Profile Box */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {(item.reporter_name || 'Campus Student')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-gray-900 flex items-center gap-1.5 truncate">
                  {item.reporter_name || 'Verified Student / Staff'}
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {item.reporter_dept || 'Campus Member'}
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-3">
              {isFound && item.status === 'active' && (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
                >
                  <Shield className="w-4 h-4" />
                  Submit Ownership Claim
                </button>
              )}

              {item.status === 'claimed' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold text-center">
                    ⏳ Ownership claim submitted & under verification
                  </div>
                  <button
                    onClick={handleMarkReturned}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Handover Complete: Mark Returned
                  </button>
                </div>
              )}

              {item.status === 'returned' && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  This item was successfully returned to its owner!
                </div>
              )}

              <button
                onClick={handleWhatsAppShare}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Share on WhatsApp Class Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        item={item}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onClaimClick={() => setClaimModalOpen(true)}
      />

      {/* Claim Questionnaire Modal */}
      <ClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={handleClaimSuccess}
      />
    </div>
  )
}

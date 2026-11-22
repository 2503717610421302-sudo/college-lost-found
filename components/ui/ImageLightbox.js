'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  X, ZoomIn, ZoomOut, MapPin, Calendar, Tag, Shield,
  Share2, ArrowRight, CheckCircle, AlertCircle, Gift, ExternalLink, MessageCircle
} from 'lucide-react'
import { formatDate, getCategoryLabel, getStatusColor, getStatusLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ImageLightbox({ item, isOpen, onClose, onClaimClick }) {
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !item) return null

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🔔 Campus Lost & Found Alert:\n\n*${item.title}*\nType: ${item.item_type?.toUpperCase()}\nLocation: ${item.location}\nDate: ${item.event_date}\n\nCheck details or claim on CampusFinder: ${window.location.origin}/items/${item.id}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Close lightbox"
      />

      <div className="relative z-10 w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button Mobile/Desktop */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all shadow-lg border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: High-Res Image Area */}
        <div className="relative flex-1 bg-black/90 flex items-center justify-center min-h-[300px] md:min-h-[500px] overflow-hidden group">
          <img
            src={item.image_url}
            alt={item.title}
            className={cn(
              'max-h-[55vh] md:max-h-[85vh] w-full object-contain transition-all duration-300',
              zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
            )}
            onClick={() => setZoomed(!zoomed)}
          />

          {/* Zoom Overlay Button */}
          <button
            onClick={() => setZoomed(!zoomed)}
            className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all"
          >
            {zoomed ? (
              <>
                <ZoomOut className="w-3.5 h-3.5" /> Normal View
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5" /> Click to Zoom
              </>
            )}
          </button>
        </div>

        {/* Right Side: Quick Action & Details Sidebar */}
        <div className="w-full md:w-80 lg:w-96 p-6 flex flex-col justify-between bg-slate-950 text-white border-t md:border-t-0 md:border-l border-slate-800 overflow-y-auto">
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                  item.item_type === 'lost' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                )}
              >
                {item.item_type === 'lost' ? 'Lost Item' : 'Found Item'}
              </span>

              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', getStatusColor(item.status))}>
                {getStatusLabel(item.status)}
              </span>

              {item.urgency === 'critical' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                  🚨 Exam / Critical
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl font-black text-white leading-snug">{item.title}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.description}</p>
            </div>

            {/* Metadata Pills */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="font-medium text-slate-200 truncate">{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{getCategoryLabel(item.category)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{formatDate(item.event_date)}</span>
              </div>
            </div>

            {/* Reward Notification if present */}
            {item.reward && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Gift className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Owner Reward: {item.reward}</span>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-6 space-y-2.5">
            {item.item_type === 'found' && item.status === 'active' && (
              <button
                onClick={() => {
                  onClose()
                  if (onClaimClick) onClaimClick(item)
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Shield className="w-4 h-4" />
                Claim This Belonging
              </button>
            )}

            <button
              onClick={handleWhatsAppShare}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Share to Class WhatsApp Group
            </button>

            <Link
              href={`/items/${item.id}`}
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all"
            >
              View Full Details Page
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

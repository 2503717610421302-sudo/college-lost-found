'use client'

import Link from 'next/link'
import {
  MapPin, Calendar, Tag, Package, AlertCircle, Gift,
  ZoomIn, ArrowUpRight, Shield
} from 'lucide-react'
import { formatDate, getCategoryLabel, getStatusColor, getStatusLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ItemCard({ item, onImageClick, onClaimClick }) {
  const statusClass = getStatusColor(item.status)
  const isCritical = item.urgency === 'critical'
  const isHigh = item.urgency === 'high'

  const handleImageClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onImageClick) {
      onImageClick(item)
    }
  }

  const handleClaimClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClaimClick) {
      onClaimClick(item)
    }
  }

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      {/* Top Image Banner with Click to Enlarge */}
      <div
        className="relative h-52 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={handleImageClick}
        title="Click to view full image and quick actions"
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-tr from-slate-100 to-slate-200">
            <Package className="w-12 h-12 stroke-[1.5] mb-1" />
            <span className="text-xs font-medium">No photo uploaded</span>
          </div>
        )}

        {/* Hover Click to Enlarge Badge */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 text-white">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold shadow-lg border border-white/20">
            <ZoomIn className="w-4 h-4 text-sky-400" />
            Click Image to View & Claim
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
          <span
            className={cn(
              'text-xs font-black px-3 py-1 rounded-full backdrop-blur-md shadow-md uppercase tracking-wider',
              item.item_type === 'lost'
                ? 'bg-rose-500/95 text-white'
                : 'bg-emerald-500/95 text-white'
            )}
          >
            {item.item_type === 'lost' ? 'Lost' : 'Found'}
          </span>

          <span
            className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md',
              item.status === 'active'
                ? 'bg-emerald-600/95 text-white'
                : item.status === 'claimed'
                ? 'bg-amber-500/95 text-white'
                : 'bg-blue-600/95 text-white'
            )}
          >
            {getStatusLabel(item.status)}
          </span>
        </div>

        {/* Urgency Pill if high or critical */}
        {(isCritical || isHigh) && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md text-white backdrop-blur-md',
                isCritical
                  ? 'bg-red-600/95 animate-pulse'
                  : 'bg-amber-600/95'
              )}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {isCritical ? 'Exam / Urgent' : 'High Priority'}
            </span>
          </div>
        )}

        {/* Reward Pill if offered */}
        {item.reward && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md bg-amber-400 text-amber-950">
              <Gift className="w-3.5 h-3.5 text-amber-900" />
              {item.reward}
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link
            href={`/items/${item.id}`}
            className="group/title flex items-start justify-between gap-2"
          >
            <h3 className="font-extrabold text-gray-900 group-hover/title:text-indigo-600 transition-colors line-clamp-1 text-base">
              {item.title}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover/title:text-indigo-600 flex-shrink-0 transition-colors" />
          </Link>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata & Quick Action */}
        <div className="pt-3 border-t border-gray-100 space-y-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {getCategoryLabel(item.category)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(item.event_date)}
            </span>
          </div>

          {/* Quick Action Button */}
          <div className="pt-1 flex items-center gap-2">
            {item.item_type === 'found' && item.status === 'active' ? (
              <button
                onClick={handleClaimClick}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition-all shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                Claim This Item
              </button>
            ) : (
              <Link
                href={`/items/${item.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

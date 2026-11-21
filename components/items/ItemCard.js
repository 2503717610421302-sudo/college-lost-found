'use client'

import Link from 'next/link'
import { MapPin, Calendar, Tag, Package, AlertCircle, Gift } from 'lucide-react'
import { formatDate, getCategoryLabel, getStatusColor, getStatusLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ItemCard({ item }) {
  const statusClass = getStatusColor(item.status)
  const isCritical = item.urgency === 'critical'
  const isHigh = item.urgency === 'high'

  return (
    <Link
      href={`/items/${item.id}`}
      className="group relative bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Top Banner on image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Package className="w-12 h-12 stroke-[1.5] mb-1" />
            <span className="text-xs font-medium">No photo uploaded</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5">
          <span
            className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm uppercase tracking-wider',
              item.item_type === 'lost'
                ? 'bg-rose-500/90 text-white'
                : 'bg-emerald-500/90 text-white'
            )}
          >
            {item.item_type === 'lost' ? 'Lost' : 'Found'}
          </span>

          <span
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md',
              item.status === 'active'
                ? 'bg-emerald-600/90 text-white'
                : item.status === 'claimed'
                ? 'bg-amber-500/90 text-white'
                : 'bg-blue-600/90 text-white'
            )}
          >
            {getStatusLabel(item.status)}
          </span>
        </div>

        {/* Urgency Pill if high or critical */}
        {(isCritical || isHigh) && (
          <div className="absolute bottom-3 left-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md text-white backdrop-blur-md',
                isCritical
                  ? 'bg-red-600/95 animate-pulse'
                  : 'bg-amber-600/95'
              )}
            >
              <AlertCircle className="w-3 h-3" />
              {isCritical ? 'Exam / Urgent' : 'High Priority'}
            </span>
          </div>
        )}

        {/* Reward Pill if offered */}
        {item.reward && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md bg-amber-400 text-amber-950">
              <Gift className="w-3 h-3 text-amber-900" />
              {item.reward}
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-base">
            {item.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Metadata */}
        <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
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
        </div>
      </div>
    </Link>
  )
}

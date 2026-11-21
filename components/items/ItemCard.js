'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Tag, Package } from 'lucide-react'
import { formatDate, truncate, getCategoryLabel, getStatusColor, getStatusLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ItemCard({ item }) {
  const statusClass = getStatusColor(item.status)

  return (
    <Link
      href={`/items/${item.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              item.item_type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            )}
          >
            {item.item_type === 'lost' ? 'Lost' : 'Found'}
          </span>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusClass)}>
            {getStatusLabel(item.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap gap-y-1 gap-x-3 pt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Tag className="w-3 h-3" />
            {getCategoryLabel(item.category)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-24">{item.location}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatDate(item.event_date)}
          </span>
        </div>
      </div>
    </Link>
  )
}

'use client'

import { Search, SlidersHorizontal, X, AlertTriangle } from 'lucide-react'
import { CATEGORIES, LOCATIONS } from '@/lib/constants'

export default function SearchFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.location ||
    filters.status ||
    filters.urgency ||
    filters.date

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-sm space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.query || ''}
          onChange={(e) => handleChange('query', e.target.value)}
          placeholder="Search items by name (e.g. calculator, watch, keys, bag, hall ticket)..."
          className="w-full pl-11 pr-10 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/70 hover:bg-white transition-all placeholder:text-gray-400"
        />
        {filters.query && (
          <button
            onClick={() => handleChange('query', '')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selectors Row */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="">All Campus Locations</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active (Waiting Claim)</option>
          <option value="claimed">Claimed (Verifying)</option>
          <option value="returned">Returned (Resolved)</option>
        </select>

        <select
          value={filters.urgency || ''}
          onChange={(e) => handleChange('urgency', e.target.value)}
          className="text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="">All Priorities</option>
          <option value="critical">🚨 Exam / Critical Only</option>
          <option value="high">High Priority</option>
          <option value="normal">Normal</option>
        </select>

        <input
          type="date"
          value={filters.date || ''}
          onChange={(e) => handleChange('date', e.target.value)}
          className="text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />

        {hasActiveFilters && (
          <button
            onClick={() =>
              onChange({ query: '', category: '', location: '', status: '', urgency: '', date: '' })
            }
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-all shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES, LOCATIONS } from '@/lib/constants'

export default function SearchFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = filters.query || filters.category || filters.location || filters.status

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.query || ''}
          onChange={(e) => handleChange('query', e.target.value)}
          placeholder="Search by name, description..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {filters.query && (
          <button
            onClick={() => handleChange('query', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="claimed">Claimed</option>
          <option value="returned">Returned</option>
        </select>

        <input
          type="date"
          value={filters.date || ''}
          onChange={(e) => handleChange('date', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ query: '', category: '', location: '', status: '', date: '' })}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

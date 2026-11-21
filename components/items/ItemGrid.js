'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import ItemCard from '@/components/items/ItemCard'
import SearchFilters from '@/components/items/SearchFilters'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { ChevronLeft, ChevronRight, PackageOpen, Sparkles } from 'lucide-react'
import { DEMO_PRESET_ITEMS } from '@/lib/constants'

const PAGE_SIZE = 12

export default function ItemGrid({ itemType }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ query: '', category: '', location: '', status: '', date: '' })
  const [showDemo, setShowDemo] = useState(false)
  const debounceRef = useRef(null)
  const supabase = createClient()

  const fetchItems = useCallback(async (currentFilters, currentPage) => {
    setLoading(true)
    try {
      let query = supabase
        .from('items')
        .select('id, title, description, category, item_type, location, event_date, image_url, status, urgency, reward, created_at', { count: 'exact' })
        .eq('item_type', itemType)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1)

      if (currentFilters.query) {
        query = query.or(`title.ilike.%${currentFilters.query}%,description.ilike.%${currentFilters.query}%`)
      }
      if (currentFilters.category) query = query.eq('category', currentFilters.category)
      if (currentFilters.location) query = query.eq('location', currentFilters.location)
      if (currentFilters.status) query = query.eq('status', currentFilters.status)
      if (currentFilters.date) query = query.gte('event_date', currentFilters.date)

      const { data, count } = await query
      if (data && data.length > 0) {
        setItems(data)
        setTotal(count || 0)
        setShowDemo(false)
      } else {
        // Filter demo items by type as a presentation fallback
        const demoFiltered = DEMO_PRESET_ITEMS.filter(i => i.item_type === itemType)
        setItems(demoFiltered)
        setTotal(demoFiltered.length)
        setShowDemo(true)
      }
    } catch {
      const demoFiltered = DEMO_PRESET_ITEMS.filter(i => i.item_type === itemType)
      setItems(demoFiltered)
      setTotal(demoFiltered.length)
      setShowDemo(true)
    } finally {
      setLoading(false)
    }
  }, [supabase, itemType])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchItems(filters, 1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [filters])

  useEffect(() => {
    fetchItems(filters, page)
  }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <SearchFilters filters={filters} onChange={setFilters} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? 'Searching...' : `${total} item${total !== 1 ? 's' : ''} found`}
        </p>
        {showDemo && !loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Project Demo Preset Active
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-700 font-semibold mb-1">No items found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 font-medium px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

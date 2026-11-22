'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import ItemCard from '@/components/items/ItemCard'
import SearchFilters from '@/components/items/SearchFilters'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { ChevronLeft, ChevronRight, PackageOpen, Sparkles, RefreshCw } from 'lucide-react'
import { getStoredItems, updateItemStatus, resetToDemoItems } from '@/lib/itemStore'
import ImageLightbox from '@/components/ui/ImageLightbox'
import ClaimModal from '@/components/ui/ClaimModal'

const PAGE_SIZE = 12

export default function ItemGrid({ itemType }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ query: '', category: '', location: '', status: '', date: '' })
  const [lightboxItem, setLightboxItem] = useState(null)
  const [claimItem, setClaimItem] = useState(null)
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
      } else {
        // Fallback to rich stored demo dataset
        loadLocalFiltered(currentFilters, currentPage)
      }
    } catch {
      loadLocalFiltered(currentFilters, currentPage)
    } finally {
      setLoading(false)
    }
  }, [supabase, itemType])

  const loadLocalFiltered = (currentFilters, currentPage) => {
    let list = getStoredItems().filter((item) => item.item_type === itemType)

    if (currentFilters.query) {
      const q = currentFilters.query.toLowerCase()
      list = list.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q)
      )
    }
    if (currentFilters.category) {
      list = list.filter((i) => i.category === currentFilters.category)
    }
    if (currentFilters.location) {
      list = list.filter((i) => i.location === currentFilters.location)
    }
    if (currentFilters.status) {
      list = list.filter((i) => i.status === currentFilters.status)
    }
    if (currentFilters.date) {
      list = list.filter((i) => i.event_date >= currentFilters.date)
    }

    setTotal(list.length)
    const startIndex = (currentPage - 1) * PAGE_SIZE
    setItems(list.slice(startIndex, startIndex + PAGE_SIZE))
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchItems(filters, 1)
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [filters, fetchItems])

  useEffect(() => {
    fetchItems(filters, page)
  }, [page, fetchItems])

  const handleClaimSuccess = (updatedItem) => {
    updateItemStatus(updatedItem.id, 'claimed')
    setItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? { ...i, status: 'claimed' } : i))
    )
  }

  const handleResetData = () => {
    resetToDemoItems()
    fetchItems(filters, 1)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <SearchFilters filters={filters} onChange={setFilters} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-sm font-semibold text-gray-700">
          {loading ? 'Searching catalog...' : `${total} item${total !== 1 ? 's' : ''} found`}
        </p>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Click any photo to enlarge & claim
          </span>

          <button
            onClick={handleResetData}
            title="Reset to fresh demo campus catalog"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-300 px-2.5 py-1 rounded-full transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <PackageOpen className="w-14 h-14 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">No items match your filters</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mb-5">
            Try adjusting your search keywords, clear category filter, or reset the catalog.
          </p>
          <button
            onClick={() => setFilters({ query: '', category: '', location: '', status: '', date: '' })}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onImageClick={(clickedItem) => setLightboxItem(clickedItem)}
              onClaimClick={(clickedItem) => setClaimItem(clickedItem)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-700 font-bold px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Lightbox Modal */}
      <ImageLightbox
        item={lightboxItem}
        isOpen={!!lightboxItem}
        onClose={() => setLightboxItem(null)}
        onClaimClick={(clicked) => {
          setLightboxItem(null)
          setClaimItem(clicked)
        }}
      />

      {/* Claim Questionnaire Modal */}
      <ClaimModal
        item={claimItem}
        isOpen={!!claimItem}
        onClose={() => setClaimItem(null)}
        onSuccess={handleClaimSuccess}
      />
    </div>
  )
}

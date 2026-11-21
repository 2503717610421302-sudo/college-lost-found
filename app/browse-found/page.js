import ItemGrid from '@/components/items/ItemGrid'
import { Package } from 'lucide-react'

export const metadata = {
  title: 'Browse Found Items | CampusFinder',
  description: 'Find items recovered across campus',
}

export default function BrowseFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Found Items</h1>
          <p className="text-gray-500 text-sm">Browse items found on campus waiting to be claimed</p>
        </div>
      </div>
      <ItemGrid itemType="found" />
    </div>
  )
}
